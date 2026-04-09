import { openaiSoraProvider } from '@/lib/providers/openai-video';
import { readFileBytes, writeFileBytes } from '@/lib/cache';
import type { Scene } from '@/features/pipeline/types';

const POLL_INTERVAL_MS = 10_000;
const MAX_WAIT_MS = 10 * 60 * 1000; // 10 minutes

export interface GenerateVideoProgress {
  pct: number;
  message: string;
}

/**
 * Run Sora image-to-video, poll until done, and persist the mp4 bytes.
 * Calls onProgress with best-effort percentage during polling.
 */
export async function generateVideo(args: {
  projectId: string;
  scene: Scene;
  onProgress?: (p: GenerateVideoProgress) => void;
}): Promise<{ videoPath: string }> {
  const keyframe = await readFileBytes(args.projectId, 'keyframe.png');

  // 4-second loops ship by default — saves $0.40 per generation vs 8s.
  // Visually ~identical for scroll-triggered flipbooks; user sees ~120
  // frames at 30fps which is plenty for smooth scroll motion.
  const { jobId } = await openaiSoraProvider.generate({
    imageBytes: keyframe,
    prompt: args.scene.motionPrompt,
    durationSec: 4,
  });

  const startedAt = Date.now();
  let attempt = 0;
  while (Date.now() - startedAt < MAX_WAIT_MS) {
    attempt += 1;
    const status = await openaiSoraProvider.poll(jobId);
    if (status.status === 'done') {
      await writeFileBytes(args.projectId, 'video.mp4', status.videoBytes);
      args.onProgress?.({ pct: 1, message: 'video ready' });
      return { videoPath: 'video.mp4' };
    }
    if (status.status === 'failed') {
      throw new Error(`Sora job failed: ${status.error}`);
    }
    args.onProgress?.({
      pct: status.progress ?? Math.min(0.95, attempt * 0.05),
      message: status.message ?? `polling (attempt ${attempt})`,
    });
    await sleep(POLL_INTERVAL_MS);
  }
  throw new Error(`Sora job timed out after ${MAX_WAIT_MS / 1000}s`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
