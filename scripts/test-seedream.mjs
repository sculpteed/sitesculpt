import { fal } from '@fal-ai/client';

fal.config({ credentials: process.env.FAL_API_KEY });

const bgPrompt = `Ultra-clean composition, premium color grading, full-bleed website hero background. Dark navy deep-space digital grid landscape stretching to horizon, glowing cyan wireframe lines, floating geometric 3D nodes connected by thin light trails, holographic terminal windows with code, subtle particle effects, atmospheric depth fog. Cinematic tech aesthetic. No text, no logos, no watermarks in-frame. Aspect ratio 16:9.`;

async function tryModel(model, input) {
  try {
    const r = await fal.subscribe(model, {
      input: { ...input, prompt: bgPrompt, num_images: 1 },
    });
    const img = r.data?.images?.[0];
    console.log(model + ' ✓ ' + img?.width + 'x' + img?.height + ' ' + img?.url);
    return img?.url;
  } catch (e) {
    console.log(model + ' ✗ ' + e.message?.slice(0, 150));
    return null;
  }
}

const url1 = await tryModel('fal-ai/bytedance/seedream/v4.5/text-to-image', { image_size: { width: 2048, height: 1152 } });
const url2 = await tryModel('fal-ai/bytedance/seedream/v4/text-to-image', { image_size: { width: 2048, height: 1152 } });
const url3 = await tryModel('fal-ai/imagen4/preview', { aspect_ratio: '16:9', output_format: 'jpeg' });
const url4 = await tryModel('fal-ai/nano-banana', { aspect_ratio: '16:9', output_format: 'jpeg' });

console.log('URLs:', { seedream45: url1, seedream4: url2, imagen4: url3, nanoBanana: url4 });
