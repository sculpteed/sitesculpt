/**
 * Draftly-style template compositor.
 *
 * For each template:
 * 1. Generate CLEAN background via Seedream v4.5 (no text/UI)
 * 2. Save to public/templates/bg-{id}.jpg
 * 3. Playwright navigates to /template-render/{id}?bg=/templates/bg-{id}.jpg
 * 4. Screenshot the composite at 1376x768
 * 5. Save final template JPEG to public/templates/{id}.jpg
 *
 * Result: pixel-perfect HTML text over AI backgrounds — exactly
 * what Draftly does.
 */
import { fal } from '@fal-ai/client';
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

fal.config({ credentials: process.env.FAL_API_KEY });

const PORT = 3003;
const BASE_URL = `http://localhost:${PORT}`;
const BG_DIR = 'public/templates/bg';
const OUT_DIR = 'public/templates';

async function loadConfigs() {
  // All 9 non-cinematic templates
  return [
    'saas-landing',
    'creative-agency',
    'app-landing',
    'ecommerce-brand',
    'restaurant',
    'portfolio',
    'startup-launch',
    'nonprofit',
    'space-research',
  ];
}

// Import config via a small fetch to our own dev server — simplest way
async function fetchConfig(id) {
  const r = await fetch(`${BASE_URL}/api/template-config/${id}`);
  if (!r.ok) throw new Error(`Config fetch failed for ${id}: ${r.status}`);
  return r.json();
}

async function generateBg(id, prompt) {
  console.log(`  ↻ generating background (Seedream v4.5)...`);
  const r = await fal.subscribe('fal-ai/bytedance/seedream/v4.5/text-to-image', {
    input: {
      prompt,
      num_images: 1,
      image_size: { width: 2048, height: 1152 },
    },
  });
  const url = r.data?.images?.[0]?.url;
  if (!url) throw new Error('no image URL returned');
  const resp = await fetch(url);
  const buf = Buffer.from(await resp.arrayBuffer());
  const bgPath = path.join(BG_DIR, `${id}.jpg`);
  await fs.writeFile(bgPath, buf);
  console.log(`  ✓ bg saved (${Math.round(buf.length / 1024)}KB)`);
  return `/templates/bg/${id}.jpg`;
}

async function screenshotComposite(browser, id, bgUrl) {
  console.log(`  ↻ compositing HTML overlay + background...`);
  const page = await browser.newPage({
    viewport: { width: 1376, height: 768 },
    deviceScaleFactor: 2, // retina-quality screenshot
  });
  const url = `${BASE_URL}/template-render/${id}?bg=${encodeURIComponent(bgUrl)}`;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  // Give fonts + image a moment to settle
  await page.waitForTimeout(2000);
  const outPath = path.join(OUT_DIR, `${id}.jpg`);
  await page.screenshot({ path: outPath, type: 'jpeg', quality: 90 });
  await page.close();
  const size = (await fs.stat(outPath)).size;
  console.log(`  ✓ composite saved (${Math.round(size / 1024)}KB)`);
}

async function main() {
  await fs.mkdir(BG_DIR, { recursive: true });
  await fs.mkdir(OUT_DIR, { recursive: true });

  const ids = await loadConfigs();
  const browser = await chromium.launch();

  try {
    for (const id of ids) {
      console.log(`\n→ ${id}`);
      try {
        const config = await fetchConfig(id);
        const bgUrl = await generateBg(id, config.bgPrompt);
        await screenshotComposite(browser, id, bgUrl);
      } catch (e) {
        console.log(`  ✗ ${e.message?.slice(0, 200)}`);
      }
    }
  } finally {
    await browser.close();
  }
  console.log('\nDone!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
