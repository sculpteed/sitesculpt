import { generateKeyframeImage } from '@/lib/providers/openai-image';
import { writeFileBytes } from '@/lib/cache';
import type { Aspect, Scene } from '@/features/pipeline/types';

/**
 * Generate the cinematic keyframe and persist it to the project cache.
 * Returns the relative path ("keyframe.png") for downstream steps.
 */
export async function generateImage(args: {
  projectId: string;
  scene: Scene;
  aspect: Aspect;
}): Promise<{ keyframePath: string }> {
  const bytes = await generateKeyframeImage({
    prompt: args.scene.visualPrompt,
    aspect: args.aspect,
  });
  await writeFileBytes(args.projectId, 'keyframe.png', bytes);
  return { keyframePath: 'keyframe.png' };
}
