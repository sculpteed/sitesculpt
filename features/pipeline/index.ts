import {
  hashInput,
  readStatus,
  writeStatus,
  writeJson,
  readJson,
  fileExists,
  listFrames,
  initialStatus,
  type GenerateInput,
  type ProjectStatus,
} from '@/lib/cache';
import type {
  PipelineResult,
  Progress,
  ProgressCallback,
  Scene,
  SiteStructure,
  StepName,
} from '@/features/pipeline/types';
import { expandPrompt } from './steps/expandPrompt';
import { composeSite } from './steps/composeSite';
import { generateImage } from './steps/generateImage';
import { compositeAssets } from './steps/compositeAssets';
import { generateVideo } from './steps/generateVideo';
import { extractFrames } from './steps/extractFrames';
import { runChecks, type CheckResult } from './quality/checks';

/**
 * Parallel pipeline orchestrator.
 *
 *   expandPrompt ─┐
 *                 ├─> generateImage ─> generateVideo ─> extractFrames
 *                 │
 *   composeSite ──┘  (runs in parallel with generateImage, independent of video)
 *
 * Resumes from the filesystem cache whenever a step's output already exists,
 * so identical inputs are near-free.
 */
export async function runPipeline(
  input: GenerateInput,
  onProgress: ProgressCallback = () => {},
): Promise<PipelineResult> {
  const projectId = hashInput(input);

  // Load or initialize status
  let status = (await readStatus(projectId)) ?? initialStatus(projectId, input);
  status.input = input; // keep in sync even if hash collides on reuse
  await writeStatus(status);

  const emit = async (step: StepName, patch: Partial<Progress>): Promise<void> => {
    status.steps[step] = { ...status.steps[step], ...patch };
    status.updatedAt = Date.now();
    await writeStatus(status);
    onProgress(step, status.steps[step]);
  };

  try {
    // ─── Step 1: expandPrompt ──────────────────────────────────────────────
    const scene = await runStepCached<Scene>({
      step: 'expandPrompt',
      projectId,
      file: 'scene.json',
      status,
      emit,
      run: () => expandPrompt(input.prompt),
    });

    // ─── Steps 2 + 3 run in parallel ───────────────────────────────────────
    //
    // composeSite is gated by runChecks(). If the first attempt fails any
    // error-severity check, we retry ONCE with the failures pinned into the
    // prompt so the model can fix them directly. This is the difference
    // between shipping a mediocre site silently and catching the bad frames
    // before the user sees them. Budget: +$0.001 + ~3s on the retry path,
    // which fires for maybe 5% of generations.
    const composeSitePromise = runStepCached<SiteStructure>({
      step: 'composeSite',
      projectId,
      file: 'site.json',
      status,
      emit,
      run: async () => {
        const first = await composeSite(input.prompt);
        const firstChecks = runChecks(scene, first);
        const firstFailures = errorFailures(firstChecks);
        if (firstFailures.length === 0) {
          logChecks(projectId, 'pass', firstChecks);
          return first;
        }
        logChecks(projectId, 'retry', firstChecks);
        const repairHint = firstFailures
          .map((c) => `- ${c.name}: ${c.message ?? 'failed'}`)
          .join('\n');
        const retried = await composeSite(input.prompt, undefined, repairHint);
        const retryChecks = runChecks(scene, retried);
        const retryFailures = errorFailures(retryChecks);
        if (retryFailures.length === 0) {
          logChecks(projectId, 'retry-pass', retryChecks);
          return retried;
        }
        // Second attempt still failing — ship it anyway but log loudly.
        // Shipping is less bad than an infinite retry loop or a hard error.
        logChecks(projectId, 'retry-fail', retryChecks);
        return retried;
      },
    });

    const generateImagePromise = runStepIfMissing({
      step: 'generateImage',
      projectId,
      sentinel: 'keyframe.png',
      status,
      emit,
      run: () => generateImage({ projectId, scene, aspect: input.aspect }),
    });

    const [site] = await Promise.all([composeSitePromise, generateImagePromise]);

    // ─── Step 3.5: compositeAssets (opt-in) ─────────────────────────────────
    // When the user supplied brand assets (logo, product photos), composite
    // them onto the keyframe BEFORE the video runs so the motion model
    // animates the branded version. Skipped entirely when no assets — zero
    // regression on the default path.
    const assets = input.brandAssets ?? [];
    if (assets.length > 0) {
      await runStepIfMissing({
        step: 'compositeAssets',
        projectId,
        sentinel: 'composite-applied.flag',
        status,
        emit,
        run: () => compositeAssets({ projectId, assets }),
      });
    } else {
      // No assets — mark done immediately so SSE clients see a clean step list.
      await emit('compositeAssets', { state: 'done', message: 'skipped (no brand assets)' });
    }

    // ─── Step 4 + 5: generateVideo + extractFrames ─────────────────────────
    // Cinematic scroll motion is the product's core promise, so video is ON
    // by default. Callers that want to skip it (smoke tests, cheap retries)
    // can pass `enableVideo: false` in the input. Cost: +$0.40 and +~2min.
    let frameCount = 0;
    const enableVideo = (input as { enableVideo?: boolean }).enableVideo ?? true;

    if (enableVideo) {
      await runStepIfMissing({
        step: 'generateVideo',
        projectId,
        sentinel: 'video.mp4',
        status,
        emit,
        run: () =>
          generateVideo({
            projectId,
            scene,
            onProgress: (p) => {
              void emit('generateVideo', {
                state: 'running',
                pct: p.pct,
                message: p.message,
              });
            },
          }),
      });

      const existingFrames = await listFrames(projectId);
      frameCount = existingFrames.length;
      if (frameCount === 0) {
        await emit('extractFrames', { state: 'running' });
        const result = await extractFrames({ projectId });
        frameCount = result.frameCount;
        await emit('extractFrames', { state: 'done' });
      } else {
        await emit('extractFrames', { state: 'done' });
      }
    } else {
      // Skip video + frames — mark as done immediately so SSE closes cleanly.
      await emit('generateVideo', { state: 'done', message: 'skipped (keyframe hero)' });
      await emit('extractFrames', { state: 'done', message: 'skipped (keyframe hero)' });
    }

    status.completedAt = Date.now();
    await writeStatus(status);

    return {
      projectId,
      scene,
      site,
      keyframePath: 'keyframe.png',
      videoPath: 'video.mp4',
      frameCount,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    status.failed = { step: findRunningStep(status) ?? 'expandPrompt', error: message };
    await writeStatus(status);
    throw err;
  }
}

function findRunningStep(status: ProjectStatus): StepName | undefined {
  const order: StepName[] = [
    'expandPrompt',
    'composeSite',
    'generateImage',
    'compositeAssets',
    'generateVideo',
    'extractFrames',
  ];
  return order.find((s) => status.steps[s].state === 'running');
}

// ─── Step helpers ────────────────────────────────────────────────────────────

async function runStepCached<T>(args: {
  step: StepName;
  projectId: string;
  file: string;
  status: ProjectStatus;
  emit: (step: StepName, patch: Partial<Progress>) => Promise<void>;
  run: () => Promise<T>;
}): Promise<T> {
  const cached = await readJson<T>(args.projectId, args.file);
  if (cached) {
    await args.emit(args.step, { state: 'done' });
    return cached;
  }
  await args.emit(args.step, { state: 'running' });
  const result = await args.run();
  await writeJson(args.projectId, args.file, result);
  await args.emit(args.step, { state: 'done' });
  return result;
}

// ─── Quality-check helpers ──────────────────────────────────────────────────

function errorFailures(checks: CheckResult[]): CheckResult[] {
  return checks.filter((c) => !c.pass && c.severity === 'error');
}

function logChecks(
  projectId: string,
  phase: 'pass' | 'retry' | 'retry-pass' | 'retry-fail',
  checks: CheckResult[],
): void {
  const fails = checks.filter((c) => !c.pass);
  if (fails.length === 0) {
    console.log(`[quality] ${projectId} ${phase} — all ${checks.length} checks passed`);
    return;
  }
  const summary = fails
    .map((c) => `${c.severity === 'error' ? 'ERR' : 'WARN'} ${c.name}${c.message ? `: ${c.message}` : ''}`)
    .join(' | ');
  const tag = phase === 'retry-fail' ? 'error' : 'warn';
  console[tag === 'error' ? 'error' : 'warn'](
    `[quality] ${projectId} ${phase} — ${fails.length}/${checks.length} failed: ${summary}`,
  );
}

async function runStepIfMissing(args: {
  step: StepName;
  projectId: string;
  sentinel: string;
  status: ProjectStatus;
  emit: (step: StepName, patch: Partial<Progress>) => Promise<void>;
  run: () => Promise<unknown>;
}): Promise<void> {
  if (await fileExists(args.projectId, args.sentinel)) {
    await args.emit(args.step, { state: 'done' });
    return;
  }
  await args.emit(args.step, { state: 'running' });
  await args.run();
  await args.emit(args.step, { state: 'done' });
}
