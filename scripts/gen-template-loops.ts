/**
 * Generate a short cinematic loop per template, upload to Vercel Blob,
 * and print a mapping { templateId: loopUrl } that can be pasted into
 * features/studio/templates.ts as the `loopUrl` field.
 *
 * Run:  npx tsx scripts/gen-template-loops.ts
 *
 * Env required:  OPENAI_API_KEY, OPENAI_VIDEO_MODEL, BLOB_READ_WRITE_TOKEN
 *
 * Cost: ~$0.30 per 3s 720p clip × 12 templates ≈ $3.60
 * Time: ~2–4 min per clip; concurrency 3 → total ~15–20 min
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { put } from '@vercel/blob';
import { openaiSoraProvider } from '../lib/providers/openai-video';
import { TEMPLATES } from '../features/studio/templates';

const POLL_INTERVAL_MS = 10_000;
const MAX_WAIT_MS = 10 * 60 * 1000;
const CONCURRENCY = 3;
const DURATION_SEC = 4;

// Subtle cinematic motion — no cuts, slow parallax, matches Draftly vibe.
// One prompt for all templates keeps the card gallery feeling cohesive.
const MOTION_PROMPT =
  'Slow continuous parallax camera push forward. Gentle atmospheric depth shift. Subtle light bloom. No cuts, no people, no text. Editorial and cinematic.';

interface Result {
  id: string;
  url?: string;
  error?: string;
}

async function generateLoop(templateId: string, imagePath: string): Promise<Result> {
  console.log(`[${templateId}] reading keyframe...`);
  const imageBytes = await fs.readFile(imagePath);

  console.log(`[${templateId}] submitting to video provider...`);
  const { jobId } = await openaiSoraProvider.generate({
    imageBytes,
    prompt: MOTION_PROMPT,
    durationSec: DURATION_SEC,
  });

  console.log(`[${templateId}] job ${jobId} submitted, polling...`);
  const startedAt = Date.now();
  let attempt = 0;
  while (Date.now() - startedAt < MAX_WAIT_MS) {
    attempt += 1;
    const status = await openaiSoraProvider.poll(jobId);
    if (status.status === 'done') {
      console.log(`[${templateId}] done, uploading to blob...`);
      const blob = await put(`template-loops/${templateId}.mp4`, status.videoBytes, {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'video/mp4',
        token: process.env.BLOB_READ_WRITE_TOKEN!,
        allowOverwrite: true,
      });
      console.log(`[${templateId}] -> ${blob.url}`);
      return { id: templateId, url: blob.url };
    }
    if (status.status === 'failed') {
      return { id: templateId, error: status.error };
    }
    const pct = status.progress ? Math.round(status.progress * 100) : undefined;
    console.log(
      `[${templateId}] attempt ${attempt}: ${status.message ?? 'pending'}${pct !== undefined ? ` (${pct}%)` : ''}`,
    );
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  return { id: templateId, error: `timeout after ${MAX_WAIT_MS / 1000}s` };
}

async function runBatch<T, R>(items: T[], n: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += n) {
    const slice = items.slice(i, i + n);
    console.log(`\n=== batch ${i / n + 1}/${Math.ceil(items.length / n)} (${slice.length} items) ===`);
    const batch = await Promise.all(slice.map(fn));
    results.push(...batch);
  }
  return results;
}

async function main(): Promise<void> {
  const root = path.resolve(process.cwd());
  const templatesWithImages = TEMPLATES.filter((t) => t.previewUrl).map((t) => ({
    id: t.id,
    imagePath: path.join(root, 'public', t.previewUrl!.replace(/^\//, '')),
  }));

  console.log(`generating loops for ${templatesWithImages.length} templates`);
  console.log(`concurrency: ${CONCURRENCY}, duration: ${DURATION_SEC}s`);
  console.log(`estimated cost: ~$${(templatesWithImages.length * 0.3).toFixed(2)}\n`);

  const results = await runBatch(templatesWithImages, CONCURRENCY, (t) =>
    generateLoop(t.id, t.imagePath).catch((err) => ({
      id: t.id,
      error: err instanceof Error ? err.message : String(err),
    })),
  );

  console.log('\n=== RESULTS ===');
  const ok: Array<{ id: string; url: string }> = [];
  const fail: Array<{ id: string; error: string }> = [];
  for (const r of results as Result[]) {
    if (r.url) ok.push({ id: r.id, url: r.url });
    else fail.push({ id: r.id, error: r.error ?? 'unknown' });
  }

  console.log(`\nOK (${ok.length}):`);
  for (const r of ok) console.log(`  ${r.id} -> ${r.url}`);
  if (fail.length > 0) {
    console.log(`\nFAIL (${fail.length}):`);
    for (const r of fail) console.log(`  ${r.id}: ${r.error}`);
  }

  console.log('\n=== PASTE INTO templates.ts ===');
  console.log(JSON.stringify(Object.fromEntries(ok.map((r) => [r.id, r.url])), null, 2));

  await fs.writeFile(
    'template-loops.json',
    JSON.stringify(Object.fromEntries(ok.map((r) => [r.id, r.url])), null, 2),
  );
  console.log('\nwrote template-loops.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
