import OpenAI from 'openai';
import { env } from '@/lib/env';
import type { Aspect } from '@/features/pipeline/types';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (client) return client;
  client = new OpenAI({ apiKey: env().OPENAI_API_KEY });
  return client;
}

function sizeForAspect(aspect: Aspect): '1536x1024' | '1024x1536' | '1024x1024' {
  switch (aspect) {
    case '16:9':
      return '1536x1024';
    case '9:16':
      return '1024x1536';
    case '1:1':
      return '1024x1024';
  }
}

/**
 * Generate a cinematic keyframe with gpt-image-1.5 at hd quality.
 * Returns raw PNG bytes.
 */
export async function generateKeyframeImage(args: {
  prompt: string;
  aspect: Aspect;
}): Promise<Buffer> {
  const c = getClient();
  // NOTE: gpt-image-1.x returns b64_json by default (no response_format param).
  // Medium quality saves ~$0.125/gen vs high and is visually nearly identical
  // for hero backgrounds. If the model ID needs changing, bump
  // OPENAI_IMAGE_MODEL in .env.local.
  const response = await c.images.generate({
    model: env().OPENAI_IMAGE_MODEL,
    prompt: args.prompt,
    n: 1,
    size: sizeForAspect(args.aspect),
    quality: 'medium',
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error('OpenAI image API returned no b64_json');
  return Buffer.from(b64, 'base64');
}
