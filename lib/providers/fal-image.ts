import { fal } from '@fal-ai/client';
import type { Aspect } from '@/features/pipeline/types';

// Configure fal client with API key
fal.config({
  credentials: process.env.FAL_API_KEY,
});

function sizeForAspect(aspect: Aspect): { width: number; height: number } {
  switch (aspect) {
    case '16:9':
      return { width: 1536, height: 1024 };
    case '9:16':
      return { width: 1024, height: 1536 };
    case '1:1':
      return { width: 1024, height: 1024 };
  }
}

/**
 * Generate a high-quality image using Flux via fal.ai.
 * Flux has dramatically better text rendering and composition than GPT Image.
 * Returns raw PNG/JPEG bytes.
 */
export async function generateFluxImage(args: {
  prompt: string;
  aspect: Aspect;
}): Promise<Buffer> {
  const size = sizeForAspect(args.aspect);

  const result = await fal.subscribe('fal-ai/flux-pro/v1.1-ultra', {
    input: {
      prompt: args.prompt,
      num_images: 1,
      aspect_ratio: args.aspect === '16:9' ? '16:9' : args.aspect === '9:16' ? '9:16' : '1:1',
      safety_tolerance: '5', // most permissive for creative content
      output_format: 'jpeg',
    },
  });

  const imageUrl = (result.data as { images: Array<{ url: string }> }).images?.[0]?.url;
  if (!imageUrl) throw new Error('Flux returned no image URL');

  // Download the image bytes
  const resp = await fetch(imageUrl);
  if (!resp.ok) throw new Error(`Failed to download Flux image: ${resp.status}`);
  return Buffer.from(await resp.arrayBuffer());
}
