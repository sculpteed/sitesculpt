import { compositeKeyframe } from '@/lib/providers/fal-composite';
import { readFileBytes, writeFileBytes } from '@/lib/cache';
import type { BrandAsset } from '@/features/pipeline/types';

/**
 * Composite user-supplied brand assets onto the keyframe and overwrite
 * `keyframe.png` so the downstream video step animates the branded version.
 *
 * Caller should skip this step when `assets` is empty — the orchestrator
 * already gates on that, but we throw defensively to surface bugs.
 */
export async function compositeAssets(args: {
  projectId: string;
  assets: BrandAsset[];
}): Promise<{ keyframePath: string }> {
  if (args.assets.length === 0) {
    throw new Error('compositeAssets called with zero assets — orchestrator should have skipped');
  }

  const baseImage = await readFileBytes(args.projectId, 'keyframe.png');
  const composited = await compositeKeyframe({
    baseImage,
    assets: args.assets,
  });

  // Overwrite the keyframe so generateVideo (which reads keyframe.png) picks
  // up the branded version with no extra plumbing. The unbranded original is
  // recoverable from the model provider's logs if ever needed.
  await writeFileBytes(args.projectId, 'keyframe.png', composited);

  // Sentinel so SSE resumes don't re-run a step whose output already shipped.
  await writeFileBytes(
    args.projectId,
    'composite-applied.flag',
    Buffer.from(`${Date.now()}\n`, 'utf8'),
  );

  return { keyframePath: 'keyframe.png' };
}
