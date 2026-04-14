import { fal } from '@fal-ai/client';
import type { Aspect } from '@/features/pipeline/types';

// Configure fal client with API key
fal.config({
  credentials: process.env.FAL_API_KEY,
});

function imageSizeForAspect(aspect: Aspect): 'landscape_16_9' | 'portrait_16_9' | 'square_hd' {
  switch (aspect) {
    case '16:9':
      return 'landscape_16_9';
    case '9:16':
      return 'portrait_16_9';
    case '1:1':
      return 'square_hd';
  }
}

/**
 * Generate a high-quality image using Ideogram v3 via fal.ai.
 * Ideogram v3 has ~95% text rendering accuracy — dramatically better
 * than Flux (~60%) and GPT Image. Best-in-class for website hero
 * images that include nav bars, headlines, and UI text.
 * Returns raw JPEG bytes.
 */
export async function generateFluxImage(args: {
  prompt: string;
  aspect: Aspect;
}): Promise<Buffer> {
  const result = await fal.subscribe('fal-ai/ideogram/v3', {
    input: {
      prompt: args.prompt,
      image_size: imageSizeForAspect(args.aspect),
      num_images: 1,
      style: 'DESIGN',
    },
  });

  const imageUrl = (result.data as { images: Array<{ url: string }> }).images?.[0]?.url;
  if (!imageUrl) throw new Error('Ideogram returned no image URL');

  // Download the image bytes
  const resp = await fetch(imageUrl);
  if (!resp.ok) throw new Error(`Failed to download Ideogram image: ${resp.status}`);
  return Buffer.from(await resp.arrayBuffer());
}
