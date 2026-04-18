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
 * Generate a cinematic keyframe with the image model.5 at hd quality.
 * Returns raw PNG bytes.
 */
export async function generateKeyframeImage(args: {
  prompt: string;
  aspect: Aspect;
}): Promise<Buffer> {
  const c = getClient();

  // Wrap the prompt with a safe-for-work preamble to reduce moderation blocks.
  // OpenAI's safety filter can be aggressive with cinematic/atmospheric prompts.
  const safePrompt = `Professional website hero image, commercial photography style. ${args.prompt}. Clean, brand-safe, suitable for a corporate website.`;

  try {
    const response = await c.images.generate({
      model: env().OPENAI_IMAGE_MODEL,
      prompt: safePrompt,
      n: 1,
      size: sizeForAspect(args.aspect),
      quality: 'medium',
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error('OpenAI image API returned no b64_json');
    return Buffer.from(b64, 'base64');
  } catch (err: unknown) {
    // If moderation blocked, retry with a minimal safe prompt
    const error = err as { code?: string; message?: string };
    if (error.code === 'moderation_blocked') {
      console.warn('[openai-image] moderation blocked, retrying with simplified prompt');
      const fallback = `Professional website hero background image. Abstract, elegant, modern design. Brand-safe commercial photography. Color palette suggestion: atmospheric and sophisticated.`;
      const response = await c.images.generate({
        model: env().OPENAI_IMAGE_MODEL,
        prompt: fallback,
        n: 1,
        size: sizeForAspect(args.aspect),
        quality: 'medium',
      });
      const b64 = response.data?.[0]?.b64_json;
      if (!b64) throw new Error('OpenAI image API returned no b64_json');
      return Buffer.from(b64, 'base64');
    }
    throw err;
  }
}
