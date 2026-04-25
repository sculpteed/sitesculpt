import { fal } from '@fal-ai/client';
import type { BrandAsset } from '@/features/pipeline/types';

fal.config({
  credentials: process.env.FAL_API_KEY,
});

/** Hard cap so fan-out per generation stays predictable on cost and prompt size. */
const MAX_ASSETS = 3;

function defaultPlacement(kind: BrandAsset['kind']): string {
  switch (kind) {
    case 'logo':
      return 'upper-left corner, scaled to roughly 8% of the frame width';
    case 'product':
      return 'placed naturally in the foreground, matching the scene perspective and depth';
    case 'reference':
      return 'used purely as a style and color reference, not pasted into the frame';
  }
}

/**
 * Build a single instruction the multi-image edit model can act on.
 * Image 1 is always the keyframe; images 2..N are the brand assets in order.
 */
function buildInstruction(assets: BrandAsset[]): string {
  const lines = [
    'Edit image 1 (the cinematic scene) by integrating the supporting images. Preserve the scene composition, lighting, and mood — do not regenerate the background. Match each addition to the scene lighting (color temperature, shadow direction, contrast) so it reads as native, not pasted.',
    '',
  ];
  assets.forEach((a, i) => {
    const idx = i + 2;
    const where = a.placement?.trim() || defaultPlacement(a.kind);
    if (a.kind === 'reference') {
      lines.push(`Image ${idx} (reference): ${where}.`);
    } else {
      lines.push(`Image ${idx} (${a.kind}): place into image 1, ${where}.`);
    }
  });
  return lines.join('\n');
}

/**
 * Composite brand assets onto a base keyframe via the multi-image edit model.
 * Returns raw PNG bytes of the edited image.
 */
export async function compositeKeyframe(args: {
  baseImage: Buffer;
  assets: BrandAsset[];
}): Promise<Buffer> {
  if (args.assets.length === 0) {
    throw new Error('compositeKeyframe called with zero assets');
  }
  const assets = args.assets.slice(0, MAX_ASSETS);

  // Upload the base keyframe so the edit model can fetch it. Each call gets
  // a fresh URL — fal storage is short-lived, perfect for this.
  // new File() needs a BlobPart, and Node's Buffer's typing has drifted from
  // ArrayBuffer → ArrayBufferLike under the latest @types/node. Wrapping in a
  // Uint8Array keeps the bytes the same and satisfies the BlobPart contract.
  const baseFile = new File([new Uint8Array(args.baseImage)], 'keyframe.png', {
    type: 'image/png',
  });
  const baseUrl = await fal.storage.upload(baseFile);

  const result = await fal.subscribe('fal-ai/flux-pro/kontext/multi', {
    input: {
      prompt: buildInstruction(assets),
      image_urls: [baseUrl, ...assets.map((a) => a.url)],
      num_images: 1,
      output_format: 'png',
    },
  });

  const imageUrl = (result.data as { images?: Array<{ url: string }> }).images?.[0]?.url;
  if (!imageUrl) throw new Error('the composite model returned no image URL');

  const resp = await fetch(imageUrl);
  if (!resp.ok) throw new Error(`Failed to download composited image: ${resp.status}`);
  return Buffer.from(await resp.arrayBuffer());
}
