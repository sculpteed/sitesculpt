import { NextRequest } from 'next/server';
import { z } from 'zod';
import { envStatus } from '@/lib/env';
import { readJson } from '@/lib/cache';
import { generateVideo } from '@/features/pipeline/steps/generateVideo';
import { extractFrames } from '@/features/pipeline/steps/extractFrames';
import type { Scene } from '@/features/pipeline/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 600; // 10 minutes — Sora can take up to 5min

const bodySchema = z.object({
  projectId: z.string().min(8),
});

/**
 * POST /api/generate-motion
 *
 * After keyframe approval, generate the 3D scroll motion:
 * 1. Sora image-to-video (4s loop from keyframe)
 * 2. ffmpeg extracts ~120 frames at 30fps
 * 3. sharp sharpens + optimizes each to JPEG
 *
 * Returns frameCount so the preview can render the HeroFlipbook.
 * This is the core Draftly mechanism — Canvas 2D frame scrubbing.
 */
export async function POST(req: NextRequest): Promise<Response> {
  const envCheck = envStatus();
  if (!envCheck.ok) {
    return Response.json({ error: envCheck.error }, { status: 500 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { projectId } = parsed.data;

  try {
    // Read the scene (needed for motionPrompt)
    const scene = await readJson<Scene>(projectId, 'scene.json');
    if (!scene) {
      return Response.json({ error: 'Scene not found — run generate-keyframe first' }, { status: 404 });
    }

    // 1. Generate video via Sora
    console.log(`[motion] ${projectId} — starting Sora video...`);
    await generateVideo({
      projectId,
      scene,
      onProgress: (p) => console.log(`[motion] ${projectId} — sora ${Math.round(p.pct * 100)}% ${p.message}`),
    });

    // 2. Extract frames
    console.log(`[motion] ${projectId} — extracting frames...`);
    const { frameCount } = await extractFrames({ projectId });
    console.log(`[motion] ${projectId} — ${frameCount} frames ready`);

    return Response.json({ projectId, frameCount });
  } catch (err) {
    console.error(`[motion] ${projectId} failed:`, err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Motion generation failed' },
      { status: 500 },
    );
  }
}
