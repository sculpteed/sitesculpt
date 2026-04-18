// Video provider interface — isolate the video model behind this so the Sept 2026 sunset
// means swapping one file (openai-video.ts → veo-video.ts / runway-video.ts / etc).

export type VideoJobStatus =
  | { status: 'pending'; progress?: number; message?: string }
  | { status: 'done'; videoBytes: Buffer }
  | { status: 'failed'; error: string };

export interface VideoProvider {
  /**
   * Kick off image-to-video generation. Returns a jobId for polling.
   * imageBytes is the keyframe PNG to animate.
   */
  generate(input: {
    imageBytes: Buffer;
    prompt: string;
    durationSec: number;
  }): Promise<{ jobId: string }>;

  /**
   * Poll a running job. Returns pending (optionally with progress), done (with
   * the actual mp4 bytes), or failed.
   */
  poll(jobId: string): Promise<VideoJobStatus>;
}
