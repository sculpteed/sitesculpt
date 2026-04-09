import sharp from 'sharp';
import { env } from '@/lib/env';
import type { VideoJobStatus, VideoProvider } from '@/lib/providers/video';

const API_BASE = 'https://api.openai.com/v1';
const SORA_SIZE = '1280x720';
const SORA_W = 1280;
const SORA_H = 720;

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${env().OPENAI_API_KEY}`,
  };
}

interface SoraJob {
  id: string;
  status: string;
  progress?: number;
  error?: { message?: string } | null;
}

/**
 * OpenAI Sora 2 video provider — raw HTTP implementation because the openai
 * SDK v4.73 we depend on does NOT yet expose a `videos` namespace. When a
 * future SDK version adds proper support, this file can be swapped for the
 * SDK-based version (preserving the VideoProvider interface).
 *
 * API surface (per OpenAI docs):
 *   POST /v1/videos                  — create, multipart (input_reference file + prompt + seconds + size + model)
 *   GET  /v1/videos/{id}             — retrieve status + progress
 *   GET  /v1/videos/{id}/content     — download mp4 bytes once completed
 */
export const openaiSoraProvider: VideoProvider = {
  async generate({ imageBytes, prompt, durationSec }) {
    // Sora requires input_reference dimensions to exactly match the requested
    // video size. Resize with sharp (cover fit, no letterboxing).
    const resizedBytes = await sharp(imageBytes)
      .resize(SORA_W, SORA_H, { fit: 'cover', position: 'center' })
      .png()
      .toBuffer();

    const form = new FormData();
    form.set('model', env().OPENAI_VIDEO_MODEL);
    form.set('prompt', prompt);
    form.set('seconds', String(durationSec));
    form.set('size', SORA_SIZE);
    form.set(
      'input_reference',
      new File([new Uint8Array(resizedBytes)], 'keyframe.png', { type: 'image/png' }),
    );

    const res = await fetch(`${API_BASE}/videos`, {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`sora create failed (${res.status}): ${text}`);
    }
    const json = (await res.json()) as SoraJob;
    return { jobId: json.id };
  },

  async poll(jobId): Promise<VideoJobStatus> {
    const res = await fetch(`${API_BASE}/videos/${jobId}`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      return { status: 'failed', error: `sora retrieve failed (${res.status}): ${text}` };
    }
    const job = (await res.json()) as SoraJob;

    if (job.status === 'failed') {
      return { status: 'failed', error: job.error?.message ?? 'sora job failed' };
    }
    if (job.status === 'completed') {
      const contentRes = await fetch(`${API_BASE}/videos/${jobId}/content`, {
        headers: authHeaders(),
      });
      if (!contentRes.ok) {
        return {
          status: 'failed',
          error: `sora content fetch failed (${contentRes.status})`,
        };
      }
      const arrayBuffer = await contentRes.arrayBuffer();
      return { status: 'done', videoBytes: Buffer.from(arrayBuffer) };
    }
    // in_progress / queued / etc
    // Sora returns progress in 0-100 (percentage), we normalize to 0-1 so
    // the rest of the pipeline + UI can treat it as a unit fraction.
    const rawProgress = typeof job.progress === 'number' ? job.progress : undefined;
    const normalized =
      rawProgress === undefined ? undefined : Math.max(0, Math.min(1, rawProgress / 100));
    return {
      status: 'pending',
      progress: normalized,
      message: `sora: ${job.status}`,
    };
  },
};
