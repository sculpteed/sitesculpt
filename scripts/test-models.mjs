import { fal } from '@fal-ai/client';

fal.config({ credentials: process.env.FAL_API_KEY });

async function tryModel(model) {
  try {
    const r = await fal.subscribe(model, {
      input: {
        prompt: 'Modern SaaS landing page hero widescreen 16:9 with Build Faster Ship Smarter headline',
        num_images: 1,
        output_format: 'jpeg',
        aspect_ratio: '16:9',
      },
    });
    const img = r.data?.images?.[0];
    console.log(model + ' ✓ ' + img?.width + 'x' + img?.height + ' ' + img?.url?.slice(0, 80));
  } catch (e) {
    const msg = e.message?.slice(0, 100) ?? 'unknown';
    console.log(model + ' ✗ ' + msg);
  }
}

await tryModel('fal-ai/nano-banana/pro');
await tryModel('fal-ai/imagen4/preview');
await tryModel('fal-ai/imagen4/preview/fast');
await tryModel('fal-ai/flux-pro/v1.1-ultra');
await tryModel('fal-ai/flux-pro/new');
await tryModel('fal-ai/recraft-v3');
await tryModel('fal-ai/bytedance/seedream/v4');
