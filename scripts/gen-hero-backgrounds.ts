/**
 * Generate 4 premium cinematic hero background loops for the homepage.
 * Each one: image model keyframe -> video model loop -> Vercel Blob.
 *
 * Run:  npx tsx --env-file=.env.local scripts/gen-hero-backgrounds.ts
 *
 * Cost: ~$0.04 per keyframe + ~$0.30 per loop = ~$1.36 total
 * Time: ~5-8 min end to end (all 4 in parallel)
 */

import { put } from '@vercel/blob';
import { generateFluxImage } from '../lib/providers/fal-image';
import { openaiSoraProvider } from '../lib/providers/openai-video';

const POLL_INTERVAL_MS = 10_000;
const MAX_WAIT_MS = 10 * 60 * 1000;
const DURATION_SEC = 4;

const MOTION_PROMPT =
  'Slow continuous camera push. Gentle atmospheric motion. Volumetric depth shift. No cuts, no people, no text. Editorial and cinematic.';

const HERO_PROMPTS: Array<{ id: string; prompt: string }> = [
  {
    id: 'architecture',
    prompt:
      'Cinematic brutalist concrete cathedral interior at golden hour. Monolithic geometric forms, massive pillars. Dramatic sunbeams through atmospheric dust. Minimal, editorial, 35mm film aesthetic. No people. No text. No signage.',
  },
  {
    id: 'nebula',
    prompt:
      'Cinematic deep-space nebula. Volumetric gaseous clouds in teal, amber, and violet. Distant galaxies, scattered stars. Dramatic volumetric lighting and depth. Editorial astrophotography. No text. No logos.',
  },
  {
    id: 'liquid',
    prompt:
      'Cinematic macro shot of flowing iridescent chrome liquid with slow-motion droplets against a deep black studio background. Luxury editorial product photography with dramatic rim lighting. No text. No logos.',
  },
  {
    id: 'dunes',
    prompt:
      'Cinematic vast dune landscape at golden hour. Long shadows raking across sculpted sand ridges. Warm atmospheric haze, wide editorial National-Geographic aesthetic, dramatic sky. No people. No text. No signage.',
  },
];

async function generateOne(spec: { id: string; prompt: string }): Promise<{ id: string; url?: string; error?: string }> {
  const { id, prompt } = spec;
  try {
    console.log(`[${id}] generating keyframe...`);
    const keyframe = await generateFluxImage({ prompt, aspect: '16:9' });

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
        console.log(`[${id}] done, uploading...`);
        const blob = await put(`hero-bg/${id}.mp4`, status.videoBytes, {
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
  console.log(`generating ${HERO_PROMPTS.length} cinematic hero backgrounds in parallel\n`);
  const results = await Promise.all(HERO_PROMPTS.map(generateOne));

  console.log('\n=== RESULTS ===');
  const ok: Array<{ id: string; url: string }> = [];
  for (const r of results) {
    if (r.url) {
      ok.push({ id: r.id, url: r.url });
      console.log(`  ${r.id} -> ${r.url}`);
    } else {
      console.log(`  ${r.id} FAIL: ${r.error}`);
    }
  }

  console.log('\n=== PASTE INTO Homepage.tsx ===');
  console.log(JSON.stringify(ok, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
