import { NextRequest } from 'next/server';
import { z } from 'zod';
import { envStatus } from '@/lib/env';
import { hashInput, ensureProjectDir, writeJson, writeFileBytes } from '@/lib/cache';
import { generateFluxImage } from '@/lib/providers/fal-image';
import { requirePaidUser } from '@/lib/auth';
import type { Aspect } from '@/features/pipeline/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const bodySchema = z.object({
  visualPrompt: z.string().min(10),
  motionPrompt: z.string().optional(),
  concept: z.string().optional(),
  palette: z.object({
    background: z.string(),
    foreground: z.string(),
    accent: z.string(),
  }),
  aspect: z.enum(['16:9', '9:16', '1:1']).default('16:9'),
});

/**
 * POST /api/generate-keyframe
 *
 * Step 3 of the funnel — generates a single keyframe from a chosen visual
 * concept + palette. Returns the projectId so the client can show the image
 * via /api/preview/{id}/keyframe.
 *
 * Cost: ~$0.04 (the image model medium quality)
 */
export async function POST(req: NextRequest): Promise<Response> {
  const gate = await requirePaidUser();
  if (gate) return gate;

  const envCheck = envStatus();
  if (!envCheck.ok) {
    return Response.json({ error: envCheck.error }, { status: 500 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { visualPrompt, motionPrompt, concept, palette, aspect } = parsed.data;

  // Generate a unique project ID using the visual prompt + a random seed
  const projectId = hashInput({
    prompt: visualPrompt,
    aspect: aspect as Aspect,
    variationSeed: crypto.randomUUID().slice(0, 8),
  });

  try {
    await ensureProjectDir(projectId);

    // Save the scene JSON so /preview/[id] can read it
    await writeJson(projectId, 'scene.json', {
      visualPrompt,
      motionPrompt: motionPrompt || 'Slow continuous parallax camera push. Subtle atmospheric motion. Gentle depth shift. No cuts.',
      palette,
      concept: concept || '',
    });

    // Generate the keyframe via the image model (best-in-class text rendering)
    const bytes = await generateFluxImage({
      prompt: visualPrompt,
      aspect: aspect as Aspect,
    });
    await writeFileBytes(projectId, 'keyframe.png', bytes);

    return Response.json({ projectId });
  } catch (err) {
    console.error('[generate-keyframe] failed', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Keyframe generation failed' },
      { status: 500 },
    );
  }
}
