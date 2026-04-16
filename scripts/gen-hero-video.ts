/**
 * Generate the homepage background video via gpt-image-1 + sora-2.
 *
 * Run:   `npx tsx --env-file=.env.local scripts/gen-hero-video.ts`
 * Cost:  ~$0.95 per run ($0.15 image + $0.80 sora), ~5 min wall clock.
 * Out:   public/homepage-bg.mp4
 *
 * Prompts below are hand-written; do NOT pipe them through expandPrompt.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { generateKeyframeImage } from '@/lib/providers/openai-image';
import { openaiSoraProvider } from '@/lib/providers/openai-video';

const IMAGE_PROMPT = `A serene meadow of wildflowers in full bloom — pink, yellow, white, and lavender blossoms stretching to the horizon — perched atop a dramatic clifftop overlooking a rugged coastline far below. The ocean is a deep cerulean blue with a single tall sailing ship visible on the distant horizon. Majestic snow-capped mountains rise in the far background adding scale and depth. Golden hour light, soft cinematic clouds drifting across a luminous sky, editorial landscape photography, medium format, ultra sharp, shallow depth of field, painterly color grading, National Geographic quality.`;

const MOTION_PROMPT = `A gentle ocean breeze moves continuously through the wildflowers, causing them to sway softly and rhythmically. Soft cumulus clouds drift slowly across the sky from left to right. The distant sailing ship glides imperceptibly along the horizon. Subtle atmospheric haze. Continuous cinematic motion, no cuts, no camera movement, no zoom — only the natural world breathing.`;

const POLL_INTERVAL_MS = 10_000;
const MAX_WAIT_MS = 10 * 60 * 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main(): Promise<void> {
  const started = Date.now();

  // ── Step 1: Generate keyframe (or reuse cached) ─────────────────────────
  const cachedKeyframePath = path.resolve(process.cwd(), 'public', 'hero-keyframe-debug.png');
  let keyframeBytes: Buffer;
  try {
    keyframeBytes = await fs.readFile(cachedKeyframePath);
    console.log(
      `[hero] 1/3 reusing cached keyframe: ${(keyframeBytes.length / 1024).toFixed(0)} KB (saved \$0.15)`,
    );
  } catch {
    console.log('[hero] 1/3 generating keyframe via gpt-image-1…');
    keyframeBytes = await generateKeyframeImage({
      prompt: IMAGE_PROMPT,
      aspect: '16:9',
    });
    await fs.writeFile(cachedKeyframePath, keyframeBytes);
    console.log(
      `[hero] 1/3 keyframe ${(keyframeBytes.length / 1024).toFixed(0)} KB (${((Date.now() - started) / 1000).toFixed(1)}s)`,
    );
  }

  // ── Step 2: Sora image-to-video ────────────────────────────────────────
  console.log('[hero] 2/3 kicking off sora-2 image-to-video (8s)…');
  const { jobId } = await openaiSoraProvider.generate({
    imageBytes: keyframeBytes,
    prompt: MOTION_PROMPT,
    durationSec: 8,
  });
  console.log(`[hero] 2/3 job ${jobId} queued, polling every ${POLL_INTERVAL_MS / 1000}s…`);

  let videoBytes: Buffer | null = null;
  let attempt = 0;
  while (Date.now() - started < MAX_WAIT_MS) {
    attempt += 1;
    const status = await openaiSoraProvider.poll(jobId);
    const elapsed = ((Date.now() - started) / 1000).toFixed(0);
    if (status.status === 'done') {
      videoBytes = status.videoBytes;
      console.log(`[hero] 2/3 sora done at ${elapsed}s, ${(videoBytes.length / 1024 / 1024).toFixed(1)} MB`);
      break;
    }
    if (status.status === 'failed') {
      throw new Error(`sora failed: ${status.error}`);
    }
    const pct = typeof status.progress === 'number' ? ` (${Math.round(status.progress * 100)}%)` : '';
    console.log(`[hero] 2/3 polling attempt ${attempt} at ${elapsed}s${pct} — ${status.message ?? 'pending'}`);
    await sleep(POLL_INTERVAL_MS);
  }

  if (!videoBytes) {
    throw new Error('sora timeout after 10 minutes');
  }

  // ── Step 3: Save and replace public/homepage-bg.mp4 ────────────────────
  console.log('[hero] 3/3 saving to public/homepage-bg.mp4…');
  const outPath = path.resolve(process.cwd(), 'public', 'homepage-bg-sora.mp4');
  await fs.writeFile(outPath, videoBytes);
  console.log(`[hero] 3/3 wrote ${outPath}`);
  console.log(`[hero] total elapsed: ${((Date.now() - started) / 1000).toFixed(1)}s`);
  console.log(`[hero] NOTE: saved as homepage-bg-sora.mp4 — rename to homepage-bg.mp4 manually after verifying it looks right, or run the optimizer + swap step.`);
}

main().catch((err) => {
  console.error('[hero] FAILED:', err);
  process.exit(1);
});
