import { put } from '@vercel/blob';
import { generateFluxImage } from '../lib/providers/fal-image';
import { openaiSoraProvider } from '../lib/providers/openai-video';

async function main(): Promise<void> {
  const keyframe = await generateFluxImage({
    prompt:
      'Editorial cinematic hero for a modern software platform. Dark studio background with a single glowing translucent geometric form — ribbed glass cube or luminous node — sitting on a matte obsidian surface. Volumetric blue and cyan rim light, soft atmospheric haze, macro depth. Minimal, high-end, editorial product photography. No text. No logos. No people. No hands. No faces.',
    aspect: '16:9',
  });
  const { jobId } = await openaiSoraProvider.generate({
    imageBytes: keyframe,
    prompt:
      'Slow continuous parallax camera push forward. Gentle atmospheric depth shift. Subtle light bloom. No cuts. Editorial and cinematic.',
    durationSec: 4,
  });
  console.log('job', jobId);
  for (let i = 0; i < 60; i++) {
    const s = await openaiSoraProvider.poll(jobId);
    if (s.status === 'done') {
      const blob = await put('template-loops/saas-landing.mp4', s.videoBytes, {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'video/mp4',
        token: process.env.BLOB_READ_WRITE_TOKEN!,
        allowOverwrite: true,
      });
      console.log('OK', blob.url);
      return;
    }
    if (s.status === 'failed') {
      console.log('FAIL', s.error);
      process.exit(1);
    }
    console.log(
      'attempt',
      i + 1,
      s.message ?? 'pending',
      s.progress ? `${Math.round(s.progress * 100)}%` : '',
    );
    await new Promise((r) => setTimeout(r, 10_000));
  }
  console.log('timeout');
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
