import type { Aspect } from '@/features/pipeline/types';
import { env } from '@/lib/env';
import { generateKeyframeImage } from './openai-image';
import { generateFluxImage } from './fal-image';

export type ImageProvider = 'openai' | 'fal';

export interface RoutedImage {
  bytes: Buffer;
  /** Which provider actually produced the bytes (after fallback). */
  provider: ImageProvider;
  /** Provider that was attempted first; differs from `provider` only on fallback. */
  attempted: ImageProvider;
}

/**
 * Pick the image provider based on env config and key availability.
 *
 *   IMAGE_PROVIDER=fal     → always fal (errors propagate)
 *   IMAGE_PROVIDER=openai  → always openai
 *   IMAGE_PROVIDER=auto    → fal when FAL_API_KEY is set, else openai
 *
 * `auto` is the default and matches pre-router behavior whenever
 * FAL_API_KEY is absent (no regression).
 */
function pickProvider(): ImageProvider {
  const e = env();
  if (e.IMAGE_PROVIDER === 'fal') return 'fal';
  if (e.IMAGE_PROVIDER === 'openai') return 'openai';
  return e.FAL_API_KEY ? 'fal' : 'openai';
}

async function callProvider(
  provider: ImageProvider,
  args: { prompt: string; aspect: Aspect },
): Promise<Buffer> {
  if (provider === 'fal') return generateFluxImage(args);
  return generateKeyframeImage(args);
}

/**
 * Generate a keyframe via the configured provider, with a one-shot fallback
 * to the other provider on runtime error when IMAGE_PROVIDER=auto. Forced
 * providers (`openai` or `fal`) skip the fallback so failures stay loud.
 *
 * Returns the bytes plus which provider was actually used so callers can
 * log/observe routing decisions.
 */
export async function generateRoutedKeyframe(args: {
  prompt: string;
  aspect: Aspect;
}): Promise<RoutedImage> {
  const attempted = pickProvider();
  const allowFallback = env().IMAGE_PROVIDER === 'auto';

  try {
    const bytes = await callProvider(attempted, args);
    return { bytes, provider: attempted, attempted };
  } catch (err) {
    if (!allowFallback) throw err;
    const other: ImageProvider = attempted === 'fal' ? 'openai' : 'fal';
    console.warn(
      `[image-router] ${attempted} failed (${err instanceof Error ? err.message : String(err)}); falling back to ${other}`,
    );
    const bytes = await callProvider(other, args);
    return { bytes, provider: other, attempted };
  }
}
