/**
 * Pre-generate 6 starter scenes into public/gallery/ so the homepage can show
 * an instant, zero-cost cinematic backdrop for first-time visitors.
 *
 * Run once: `npm run seed:gallery`. Outputs are committed to git — the script
 * is idempotent and skips any slug that already has frames on disk.
 *
 * Cost: ~$1/slug × 6 = ~$6 total. Time: ~15-20 min.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { runPipeline } from '@/features/pipeline';
import { getProjectDir, hashInput } from '@/lib/cache';

interface Seed {
  slug: string;
  prompt: string;
}

const SEEDS: Seed[] = [
  { slug: 'saas-dark', prompt: 'SaaS landing page, dark mode, cinematic minimal tech aesthetic' },
  { slug: 'luxury-fashion', prompt: 'Luxury fashion e-commerce, editorial, warm low light' },
  { slug: 'agency-portfolio', prompt: 'Creative agency portfolio, brutalist, high contrast' },
  { slug: 'ai-startup', prompt: 'AI startup homepage, futuristic, neon accents on black' },
  { slug: 'studio-personal', prompt: 'Personal portfolio for a designer, pastel dawn atmosphere' },
  { slug: 'launch-waitlist', prompt: 'Product waitlist launch page, bold typography, deep blues' },
];

async function seedOne(seed: Seed): Promise<void> {
  const outDir = path.resolve(process.cwd(), 'public', 'gallery', seed.slug);
  try {
    const existing = await fs.readdir(path.join(outDir, 'frames')).catch(() => []);
    if (existing.length > 50) {
      console.log(`[seed] ${seed.slug}: already has ${existing.length} frames, skipping`);
      return;
    }
  } catch {
    // fresh
  }

  console.log(`[seed] ${seed.slug}: running pipeline…`);
  const projectId = hashInput({ prompt: seed.prompt, aspect: '16:9' });
  await runPipeline({ prompt: seed.prompt, aspect: '16:9' }, (step, progress) => {
    if (progress.state === 'running' || progress.state === 'done') {
      console.log(`  ${seed.slug} · ${step} · ${progress.state}`);
    }
  });

  // Copy frames into public/gallery/{slug}
  const projectDir = getProjectDir(projectId);
  await fs.mkdir(path.join(outDir, 'frames'), { recursive: true });
  const frames = await fs.readdir(path.join(projectDir, 'frames'));
  for (const frame of frames) {
    await fs.copyFile(
      path.join(projectDir, 'frames', frame),
      path.join(outDir, 'frames', frame),
    );
  }
  // Copy scene + site for metadata
  for (const meta of ['scene.json', 'site.json', 'keyframe.png']) {
    try {
      await fs.copyFile(path.join(projectDir, meta), path.join(outDir, meta));
    } catch {
      // ignore missing
    }
  }
  console.log(`[seed] ${seed.slug}: wrote ${frames.length} frames → public/gallery/${seed.slug}`);
}

async function main(): Promise<void> {
  console.log('[seed] starting gallery seed — this will call OpenAI + Anthropic APIs');
  for (const seed of SEEDS) {
    try {
      await seedOne(seed);
    } catch (err) {
      console.error(`[seed] ${seed.slug} FAILED:`, err);
    }
  }
  console.log('[seed] done.');
}

void main();
