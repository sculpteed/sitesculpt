/**
 * Regenerate the 3 functional templates that came back wrong on the
 * first pass. Lessons applied to the rewritten prompts:
 *
 * - "abstract gradient placeholder circles" -> the model renders literal
 *   floating spheres. Ditch that phrasing; describe a flat-illustrated
 *   product mockup instead.
 * - "glass container with X inside" -> the model renders a physical
 *   glass jar. Drop the container metaphor; describe a floating
 *   dashboard panel directly.
 * - "placeholder bars / lines" -> Ideogram tries to fill them with
 *   text and garbles it. Use "solid color blocks", "no text", or
 *   "minimal abstract bars" instead.
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
    id: 'project-mgmt',
    prompt: [
      'Modern team productivity SaaS landing page hero. Centered composition. Soft gradient background, off-white shifting to faint indigo at edges.',
      'Hero illustration: a stylized 3D rendering of a clean kanban product UI on a floating laptop-screen mockup, viewed at a slight 3-degree angle with subtle drop shadow under the device. The kanban shows three vertical columns each containing 2-3 simple white rounded task cards. Each task card has only a colored top stripe (indigo, mint, amber) and 2 thin horizontal grey lines representing text — NO actual text characters anywhere.',
      'Around the laptop, floating with depth: a smaller secondary panel showing a horizontal Gantt-style timeline (3 colored bars at different lengths, no labels), a small notification badge with a numeric counter "3", and a soft vertical sidebar with 4 simple rounded icon shapes.',
      'Design style: flat-illustrated product mockup in the style of Linear / Notion / Asana product pages. Apple-style soft UI. Premium SaaS aesthetic. Clean lines, no clutter.',
      'Colors: warm off-white background (#fafafb), indigo card stripes (#5b6cf0), mint green accent (#52b89c), amber highlight (#e8b874), charcoal text-line placeholders.',
      'CRITICAL: NO text characters. NO letters. NO words. Only colored rectangles and thin grey lines as placeholder content. NO faces. NO avatars. NO floating spherical objects. NO brass or metallic ornaments. 16:9 aspect, premium product hero quality.',
    ].join(' '),
  },
  {
    id: 'analytics-saas',
    prompt: [
      'Modern analytics SaaS landing page hero. Centered composition. Dark navy gradient background.',
      'Hero illustration: a single floating dashboard window panel rendered in 3D, viewed slightly from below at a 5-degree angle, with realistic blur on edges and a soft purple-blue glow underneath. The dashboard panel is a clean rectangular UI with a thin top bar and three sections inside: (1) a vertical bar chart on the left with 6 bars of varying heights in mint-green and electric-blue, (2) a smooth area-chart filling the center showing a wave-like upward trend in soft purple, (3) a circular progress ring on the right at approximately 78% complete. NO numbers, NO text — just abstract chart shapes and the ring.',
      'Floating around the main dashboard panel with depth: 2 smaller secondary widget cards showing only minimal abstract shapes (one thin sparkline, one small donut chart slice). Subtle floating geometric particles (small cubes, faceted gem shapes) in the background giving depth.',
      'Design style: premium SaaS analytics product hero. Flat-illustrated 3D mockup, NOT a glass jar or beaker. Refined sci-fi data-viz aesthetic. Dark mode dominant.',
      'Colors: deep navy background (#0a0a14), electric blue accents (#22d3ee), neon mint (#10b981), soft purple glow (#a78bfa), white panel surfaces.',
      'CRITICAL: NO text characters anywhere. NO letters. NO numbers. NO logos. NO physical glass containers, jars, cylinders or beakers. Only the floating dashboard panel with abstract chart shapes inside. 16:9 aspect, premium product-page hero quality.',
    ].join(' '),
  },
  {
    id: 'med-spa',
    prompt: [
      'Modern luxury medical spa landing page hero. Centered composition with floating product UI elements. Warm cream and dusty rose color palette.',
      'Hero illustration: 3 floating clean white rounded UI cards arranged with subtle depth and soft drop shadows. Card 1: a calendar / appointment booking interface showing a small calendar grid with 2 highlighted day cells in soft rose. Card 2: a treatment menu card with a stack of 4 thin horizontal grey lines (no text) and a soft pink rounded rectangle representing a "book now" button at the bottom. Card 3: a small treatment summary panel with a circular completion ring at 60% in dusty rose. Each card has a thin border and frosted-glass effect.',
      'In the foreground: a small ceramic plant pot with a single succulent. Subtle warm shadows on the cream surface beneath the floating cards.',
      'Design style: premium spa SaaS aesthetic, Apple-style soft UI, glass-morphism on cards, very clean. NOT 3D character avatars.',
      'Colors: warm cream gradient background (#f5e9e3 to #f0d9c4), soft dusty rose accents (#e8c5cf), warm beige (#d4b89e), cream card surfaces.',
      'CRITICAL: NO text characters. NO letters. NO numbers. NO faces. NO human avatars. NO body shapes. Only abstract UI card shapes with placeholder colored blocks and thin grey lines as content. 16:9 aspect, premium photorealistic 3D render.',
    ].join(' '),
  },
];

async function generateOne(spec: Spec): Promise<{ id: string; ok: boolean; error?: string }> {
  const { id, prompt } = spec;
  try {
    console.log(`[${id}] regenerating keyframe...`);
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
  console.log(`regenerating ${SPECS.length} templates with fixed prompts (parallel)\n`);
  const results = await Promise.all(SPECS.map(generateOne));
  const ok = results.filter((r) => r.ok).length;
  console.log(`\nOK ${ok} / ${results.length}`);
  for (const r of results) {
    if (!r.ok) console.log(`  ${r.id}: ${r.error}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
