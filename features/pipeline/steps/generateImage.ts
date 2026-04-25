import { generateRoutedKeyframe } from '@/lib/providers/image-router';
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
  const { bytes, provider, attempted } = await generateRoutedKeyframe({
    prompt: args.scene.visualPrompt,
    aspect: args.aspect,
  });
  if (provider !== attempted) {
    console.warn(
      `[generateImage] ${args.projectId} keyframe routed to ${provider} after ${attempted} failed`,
    );
  } else {
    console.log(`[generateImage] ${args.projectId} keyframe via ${provider}`);
  }
  await writeFileBytes(args.projectId, 'keyframe.png', bytes);
  return { keyframePath: 'keyframe.png' };
}
