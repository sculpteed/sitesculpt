/**
 * Generate Draftly-style functional template hero illustrations.
 *
 * Each prompt is modelled on what Draftly puts on their template-detail
 * page (SyncBase, Shopnest, OrbitCRM): explicit hero illustration brief
 * showing PRODUCT UI (kanban cards, glass containers, dashboard widgets,
 * input fields) — not atmospheric scenery.
 *
 * Output: /public/templates/<id>.jpg per template.
 *
 * Run:  set -a && source .env.local && set +a && npx tsx scripts/gen-functional-template-heros.ts
 *
 * Cost: ~$0.10 per Ideogram-v3 image  6 ≈ $0.60.
 * Time: ~30s per image, runs in parallel.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { generateFluxImage } from '../lib/providers/fal-image';

interface Spec {
  id: string;
  prompt: string;
}

const SPECS: Spec[] = [
  {
    id: 'med-spa',
    prompt: [
      'Modern luxury medical spa landing page hero. Centered composition with floating product UI elements. Off-white cream background gradient with subtle dusty rose accents.',
      'Hero illustration: 3D-rendered floating glass UI cards arranged with depth — one card showing an appointment time-slot picker (placeholder time blocks, no readable text), one card showing a stylized treatment menu list with placeholder lines, one card showing a "Book Now" button shape in soft rose pink. Beside the cards: 3-4 small circular avatar bubbles (no faces, abstract gradient placeholders) representing aestheticians. A small ceramic plant pot in the lower foreground.',
      'Design style: Apple-style soft UI, glass-morphism, premium clean spa aesthetic. Subtle drop shadows, frosted glass surfaces. Fonts visible as rendered placeholder lines.',
      'Colors: warm cream background (#f5f0e8), soft dusty rose accents (#e8c5cf), warm beige (#d4b89e), single muted sage element.',
      'Calm, premium, clinical-but-warm. NO readable text anywhere in UI elements — only placeholder bars and lines. NO faces. NO logos. 16:9 aspect ratio. Photorealistic high-quality 3D render.',
    ].join(' '),
  },
  {
    id: 'real-estate',
    prompt: [
      'Modern boutique real estate brokerage landing page hero. Layout: text-left empty space, illustration on the right side of frame. Warm cream background with editorial aesthetic.',
      'Hero illustration: stylized 3D rendering of a single brownstone facade at golden-hour light — ornate stone cornice, tall stoop with worn stone steps, wrought-iron railings, one mature tree in front. Beside the brownstone: floating glass UI property-listing cards showing small placeholder property thumbnails (rectangle blocks), placeholder lines for address/price, and one card with a search input field shape and magnifying-glass icon.',
      'Design style: editorial premium architecture photography meets Apple-style soft UI cards. Warm sunlight, long shadows, atmospheric depth.',
      'Colors: warm cream background (#f5f0e8), dark cognac browns (#5a3a23), single soft sage green accent.',
      'Premium boutique brokerage feel. NO readable text in UI cards (placeholder lines only). NO street numbers. NO logos. NO faces. 16:9 aspect.',
    ].join(' '),
  },
  {
    id: 'project-mgmt',
    prompt: [
      'Modern team productivity SaaS landing page hero. Centered composition with floating product UI elements arranged in shallow depth. Off-white background.',
      'Hero illustration: 3D-rendered productivity workspace UI floating in space. Visible elements: a kanban-board card with 3 columns and placeholder task cards inside each (no readable text — just placeholder bars), a circular team avatar group cluster (5 abstract gradient circles, no faces), a horizontal calendar/timeline strip with milestone markers, a chat conversation bubble cluster with placeholder message lines. Each card has soft drop shadow and subtle frosted glass effect with thin border. Arranged so the kanban is centered and the other elements orbit it.',
      'Design style: Apple-style soft UI similar to Linear / Notion / Asana product page hero. Glass-morphism, premium SaaS aesthetic. Subtle indigo and mint-green color highlights on UI accents.',
      'Colors: warm white background (#fafafb), indigo primary (#5b6cf0), mint green accents (#52b89c), amber highlights on a small notification dot.',
      'Premium productivity SaaS aesthetic. NO readable text anywhere — only placeholder bars and lines for content. NO faces. NO logos. 16:9 aspect ratio.',
    ].join(' '),
  },
  {
    id: 'analytics-saas',
    prompt: [
      'Modern analytics SaaS landing page hero. Centered composition with a large glass container as the focal point.',
      'Hero illustration: a large rectangular glass container floating in center frame with blur and soft shadow. Inside the glass: a stylized 3D analytics dashboard with abstract chart shapes — vertical bar chart (no numbers), line graph going up-right with a soft glow, a circular metric ring at ~78% completion, vertical sidebar with placeholder icon shapes, sparkline shapes. Outside the glass: deep navy gradient background with subtle floating geometric shapes (cubes, spheres, faceted gem-like polyhedra) suggesting data and depth.',
      'Design style: glass UI with realistic blur and shadow, abstract premium sci-fi data-viz aesthetic, dark-mode dominant.',
      'Colors: deep navy / near-black background (#0a0a14), electric blue accents (#22d3ee), neon mint (#10b981) on chart highlights, soft purple (#a78bfa) glow.',
      'Premium analytics product aesthetic. NO actual numbers anywhere — only abstract chart shapes and placeholder rings. NO readable text. NO logos. 16:9 aspect, dramatic depth.',
    ].join(' '),
  },
  {
    id: 'boutique-hotel',
    prompt: [
      'Modern boutique hotel landing page hero. Layout: text-left empty space, illustration on the right side. Warm afternoon golden-hour atmosphere.',
      'Hero illustration: 3D-rendered scene of a boutique hotel terrace overlooking a Mediterranean coastline at golden hour. Visible: hand-tiled patio floor in soft terracotta, a striped blue-and-cream patio umbrella casting shadows, a single white linen lounger, a small wooden side table with a glass of white wine, view across the terrace railing of cliffs and Mediterranean sea in distance. Beside this scene, slightly foregrounded: 2-3 small floating glass UI cards — one showing a check-in/check-out date selector (placeholder date blocks), one showing a room type carousel with rectangle thumbnails, one with a "Reserve" button shape.',
      'Design style: editorial luxury hospitality photography meets Apple-style soft UI cards. Warm light, long shadows, depth.',
      'Colors: warm cream and terracotta palette (#e8d5b8, #c4744a), deep Mediterranean blue accents (#2c5b7a), sun-bleached wood tones.',
      'Premium boutique hospitality feel. NO readable text on UI cards (placeholder lines and date blocks only). NO logos. NO faces. NO actual room photographs (placeholder rectangles only). 16:9 aspect.',
    ].join(' '),
  },
  {
    id: 'productivity-app',
    prompt: [
      'Modern personal productivity app landing page hero. Layout: text-left empty space, illustration centered-right. Warm off-white minimalist background.',
      'Hero illustration: realistic 3D rendering of a smartphone standing upright at a slight 8-degree angle. The phone screen shows a minimalist app interface — a clean task list with placeholder rows (3-4 horizontal lines representing tasks, with placeholder checkmark circles), a small focus-timer circular ring at ~67% in dark forest green, a single date stamp at the top (placeholder text). Around the phone: 2-3 floating subtle glass UI cards — one with a small calendar grid (placeholder day cells), one with a streak counter showing dots, one with a placeholder line graph of focus minutes. Soft drop shadow under the phone. Subtle warm paper-texture background.',
      'Design style: refined 3D product rendering similar to Apple-product-hero photography. Editorial calm minimalist aesthetic. Premium quality.',
      'Colors: warm off-white background (#f5f0e8), deep charcoal phone bezel (#1a1715), muted forest green accent (#5d7c5e), warm cream UI surfaces.',
      'Calm, focused, premium personal-software aesthetic. NO readable task names anywhere — only placeholder bars and circle checkmarks. NO logos. 16:9 aspect.',
    ].join(' '),
  },
];

async function generateOne(spec: Spec): Promise<{ id: string; ok: boolean; error?: string }> {
  const { id, prompt } = spec;
  try {
    console.log(`[${id}] generating keyframe...`);
    const pngBytes = await generateFluxImage({ prompt, aspect: '16:9' });

    const jpegPath = path.join(process.cwd(), 'public', 'templates', `${id}.jpg`);
    const jpegBytes = await sharp(pngBytes).jpeg({ quality: 92 }).toBuffer();
    await fs.writeFile(jpegPath, jpegBytes);
    console.log(`[${id}] saved -> ${jpegPath}`);
    return { id, ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`[${id}] FAIL: ${message}`);
    return { id, ok: false, error: message };
  }
}

async function main(): Promise<void> {
  console.log(`generating ${SPECS.length} functional template heros (parallel)\n`);
  const results = await Promise.all(SPECS.map(generateOne));
  const ok = results.filter((r) => r.ok).length;
  const fail = results.length - ok;
  console.log(`\n=== RESULTS ===`);
  console.log(`OK ${ok}, FAIL ${fail}`);
  for (const r of results) {
    if (!r.ok) console.log(`  ${r.id}: ${r.error}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
