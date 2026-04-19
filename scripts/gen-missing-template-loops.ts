/**
 * Retry the 3 template loops that were blocked by the video model's
 * moderation filter (saas-landing, creative-agency, nonprofit). Instead
 * of feeding the original /public/templates/*.jpg keyframes — which
 * tripped the filter the first time around — we generate fresh
 * moderation-safe keyframes via the image provider for each template
 * and then pipe those through the same image -> video -> blob flow.
 *
 * Run: npx tsx scripts/gen-missing-template-loops.ts
 *
 * Cost: 3 × (~$0.04 image + ~$0.30 video) ≈ $1.02
 */

import { put } from '@vercel/blob';
import { generateFluxImage } from '../lib/providers/fal-image';
import { openaiSoraProvider } from '../lib/providers/openai-video';

const POLL_INTERVAL_MS = 10_000;
const MAX_WAIT_MS = 10 * 60 * 1000;
const DURATION_SEC = 4;

const MOTION_PROMPT =
  'Slow continuous parallax camera push forward. Gentle atmospheric depth shift. Subtle light bloom. No cuts. Editorial and cinematic.';

// Moderation-safe, people-free keyframe prompts calibrated to the brand
// of each template that previously failed.
const RETRIES: Array<{ id: string; keyframePrompt: string }> = [
  {
    id: 'saas-landing',
    keyframePrompt:
      'Editorial cinematic hero for a modern software platform. Dark studio background with a single glowing translucent geometric form — ribbed glass cube or luminous node — sitting on a matte obsidian surface. Volumetric blue and cyan rim light, soft atmospheric haze, macro depth. Minimal, high-end, editorial product photography. No text. No logos. No people. No hands. No faces.',
  },
  {
    id: 'creative-agency',
    keyframePrompt:
      'Editorial cinematic still for a creative consultancy. Minimalist cream studio with a single matte paper envelope resting on a pale ash desk beside a folded wool throw and a brass lamp. Soft window-light from the left, gentle shadows, shallow depth of field. Restrained, editorial, Kinfolk-style product photography. No text. No logos. No people. No faces.',
  },
  {
    id: 'nonprofit',
    keyframePrompt:
      'Editorial cinematic still of an empty sunlit wellness studio. Pale oak floor, terracotta clay pot with a single eucalyptus branch, folded linen blanket, soft morning light through sheer curtains, dust motes in the beams. Warm minimalism, calm, editorial interior photography. No text. No logos. No people. No faces. No hands.',
  },
];

async function generateRetry(spec: { id: string; keyframePrompt: string }): Promise<{ id: string; url?: string; error?: string }> {
  const { id, keyframePrompt } = spec;
  try {
    console.log(`[${id}] generating fresh keyframe...`);
    const keyframe = await generateFluxImage({ prompt: keyframePrompt, aspect: '16:9' });

    console.log(`[${id}] submitting to video provider...`);
    const { jobId } = await openaiSoraProvider.generate({
      imageBytes: keyframe,
      prompt: MOTION_PROMPT,
      durationSec: DURATION_SEC,
    });

    console.log(`[${id}] job ${jobId} polling...`);
    const startedAt = Date.now();
    let attempt = 0;
    while (Date.now() - startedAt < MAX_WAIT_MS) {
      attempt += 1;
      const status = await openaiSoraProvider.poll(jobId);
      if (status.status === 'done') {
        console.log(`[${id}] done, uploading to blob...`);
        const blob = await put(`template-loops/${id}.mp4`, status.videoBytes, {
          access: 'public',
          addRandomSuffix: false,
          contentType: 'video/mp4',
          token: process.env.BLOB_READ_WRITE_TOKEN!,
          allowOverwrite: true,
        });
        console.log(`[${id}] -> ${blob.url}`);
        return { id, url: blob.url };
      }
      if (status.status === 'failed') {
        return { id, error: status.error };
      }
      const pct = status.progress ? Math.round(status.progress * 100) : undefined;
      console.log(`[${id}] attempt ${attempt}: ${status.message ?? 'pending'}${pct !== undefined ? ` (${pct}%)` : ''}`);
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
    return { id, error: `timeout after ${MAX_WAIT_MS / 1000}s` };
  } catch (err) {
    return { id, error: err instanceof Error ? err.message : String(err) };
  }
}

async function main(): Promise<void> {
  console.log(`retrying ${RETRIES.length} moderation-blocked templates with fresh keyframes\n`);
  const results = await Promise.all(RETRIES.map(generateRetry));

  console.log('\n=== RESULTS ===');
  for (const r of results) {
    if (r.url) console.log(`  OK  ${r.id} -> ${r.url}`);
    else console.log(`  FAIL ${r.id}: ${r.error}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
