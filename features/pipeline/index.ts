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
import { generateVideo } from './steps/generateVideo';
import { extractFrames } from './steps/extractFrames';

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
    const composeSitePromise = runStepCached<SiteStructure>({
      step: 'composeSite',
      projectId,
      file: 'site.json',
      status,
      emit,
      run: () => composeSite(input.prompt),
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

    // ─── Step 4 + 5: generateVideo + extractFrames (OPTIONAL) ──────────────
    // Sora video is 720p which looks blurry when stretched to full viewport.
    // The keyframe (1536×1024) + CSS Ken Burns looks sharper and is the
    // default hero treatment. Sora is skipped by default (saves $0.40 + 2min).
    // When a user explicitly opts into video (premium toggle), set
    // input.enableVideo = true to run these steps.
    let frameCount = 0;
    const enableVideo = (input as { enableVideo?: boolean }).enableVideo ?? false;

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
