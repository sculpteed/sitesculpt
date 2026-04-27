/**
 * Draftly-style template compositor.
 *
 * For each template:
 * 1. Generate CLEAN background via the image model (no text/UI)
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

const PORT = Number(process.env.SITESCULPT_DEV_PORT ?? 3000);
const BASE_URL = `http://localhost:${PORT}`;
const BG_DIR = 'public/templates/bg';
const OUT_DIR = 'public/templates';

async function loadConfigs() {
  // CLI: pass ids explicitly ("npm run regen-templates -- restaurant-site
  // dental-site"), or "all" for everything. With no args, default to the
  // website-theme-only set so a default run regenerates the recently-added
  // templates without touching the older 9.
  const args = process.argv.slice(2);
  const WEBSITE_THEMES = [
    'restaurant-site',
    'dental-site',
    'law-firm-site',
    'online-academy-site',
    'real-estate-site',
    'dev-tool-site',
  ];
  const ATMOSPHERIC = [
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
  if (args.length === 0) return WEBSITE_THEMES;
  if (args.length === 1 && args[0] === 'all') return [...ATMOSPHERIC, ...WEBSITE_THEMES];
  return args;
}

// Import config via a small fetch to our own dev server — simplest way
async function fetchConfig(id) {
  const r = await fetch(`${BASE_URL}/api/template-config/${id}`);
  if (!r.ok) throw new Error(`Config fetch failed for ${id}: ${r.status}`);
  return r.json();
}

async function generateBg(id, prompt, skipIfExists = false) {
  const bgPath = path.join(BG_DIR, `${id}.jpg`);
  if (skipIfExists) {
    try {
      await fs.access(bgPath);
      console.log(`  → bg already exists, reusing`);
      return `/templates/bg/${id}.jpg`;
    } catch {}
  }
  console.log(`  ↻ generating background (the image model)...`);
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
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  // Wait for the bg image to load + fonts
  await page.waitForTimeout(3500);
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
        // Reuse existing bg if available — we're only changing the HTML overlay
        const bgUrl = await generateBg(id, config.bgPrompt, true);
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
