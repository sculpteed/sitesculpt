/**
 * Generate the homepage background keyframe via gpt-image-1.5.
 *
 * Run once: `npx tsx --env-file=.env.local scripts/gen-homepage-bg.ts`
 *
 * Cost: ~$0.13-0.20 per run (1792×1024 hd).
 * Output: public/homepage-bg.png
 *
 * Rerun anytime you want a fresh background. Bump the version in the
 * filename (homepage-bg-v2.png) if you want to keep both around.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { generateKeyframeImage } from '@/lib/providers/openai-image';

const PROMPT = `A vast deep-space nebula in rich violet and indigo, distant stars scattered across the black void, soft luminous gas clouds drifting in silence, subtle magenta highlights at the edges. Hubble-quality astrophotography, ultra sharp, cinematic grade, editorial composition with dark negative space on the left for text overlay.`;

async function main(): Promise<void> {
  console.log('[homepage-bg] generating keyframe via gpt-image-1.5…');
  console.log(`[homepage-bg] prompt: ${PROMPT.slice(0, 80)}…`);
  const startedAt = Date.now();

  const bytes = await generateKeyframeImage({ prompt: PROMPT, aspect: '16:9' });

  const outDir = path.resolve(process.cwd(), 'public');
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, 'homepage-bg.png');
  await fs.writeFile(outPath, bytes);

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  const sizeKb = (bytes.length / 1024).toFixed(0);
  console.log(`[homepage-bg] wrote ${outPath}`);
  console.log(`[homepage-bg] ${sizeKb} KB, ${elapsed}s elapsed`);
}

void main();
