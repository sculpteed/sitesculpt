/**
 * Generate "full website theme" template heros — these read as actual
 * website screenshots (nav bar, hero, sections visible below the fold)
 * rather than isolated product-UI illustrations.
 *
 * Prompt strategy after the prior pass:
 * - Include explicit "full webpage screenshot view" framing
 * - Specify the nav bar contents (logo + 4-5 named tabs + button)
 * - Specify hero structure (headline + subtext + 2 CTAs)
 * - Specify the scroll-below section visible at the bottom
 * - Use realistic web typography proportions
 * - Keep nav labels short and common ('Menu', 'Reserve', 'Pricing',
 *   'Docs') — Ideogram renders these reliably; long text gets garbled
 *
 * Run:  set -a && source .env.local && set +a && npx tsx scripts/gen-website-themes.ts
 *
 * Cost: 6 * ~$0.10 ≈ $0.60.
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
    id: 'restaurant-site',
    prompt: [
      'Modern restaurant website landing page, full webpage screenshot view, vertical page composition.',
      'TOP NAV BAR: warm dark navigation bar across the top with a small serif italic restaurant wordmark logo on the left, four short text nav links spelled out clearly ("Menu", "Reserve", "Wine", "About"), and a small rounded "Reserve" button on the right.',
      'HERO SECTION below nav: a beautifully styled large food photograph of a single elegantly plated tasting-menu dish under warm golden lighting on a dark stoneware plate, occupying most of the hero area. Subtle hero text overlay top-left in serif italic: "A table for two." Below the headline a short body line and one small rounded CTA button labeled "Reserve a table".',
      'SCROLL-VISIBLE SECTION below the hero: at the bottom edge of the frame, a strip of three small horizontal menu-item cards is just barely visible, each card showing a small placeholder dish thumbnail + dish name placeholder line + a small price placeholder.',
      'Style: warm fine-dining editorial aesthetic. Color palette: deep plum / aubergine background (#1a0f12), rich gold accents (#d4a574), warm cream type. Realistic web typography proportions, premium hospitality website. Refined, photorealistic, depth.',
      'CRITICAL: NO real brand logos. NO long body text — short labels and placeholder lines only. NO faces. 16:9 aspect ratio.',
    ].join(' '),
  },
  {
    id: 'law-firm-site',
    prompt: [
      'Modern law firm professional-services website landing page, full webpage screenshot view, vertical page composition.',
      'TOP NAV BAR: clean cream-colored navigation bar across the top with a small serif wordmark logo on the left ("Caldwell"), four short text nav links spelled out clearly ("Practice", "Attorneys", "Insights", "Contact"), and a small dark navy rounded "Schedule" button on the right.',
      'HERO SECTION: large serif italic headline on the left "Counsel for the complex." Below it three short placeholder body lines and two small buttons ("Schedule a call" filled navy, and "Read insights" outlined). On the right side: a clean three-column attorney card grid showing three placeholder attorney portrait silhouettes (no faces, just abstract suit-and-shoulders silhouettes), each card with a name placeholder line and a one-line role placeholder.',
      'SCROLL-VISIBLE SECTION at bottom edge: a horizontal strip of four small practice-area cards, each with a tiny abstract icon (gavel, scales, document, building) and a single placeholder word.',
      'Style: editorial premium professional-services website aesthetic. Color palette: warm cream background (#f5f1ea), deep navy (#1a2540), gold accents (#c9a574). Realistic web typography proportions.',
      'CRITICAL: NO real attorney faces — abstract silhouettes only. NO real brand logos. Short labels and placeholder lines only. 16:9 aspect ratio.',
    ].join(' '),
  },
  {
    id: 'dental-site',
    prompt: [
      'Modern dental practice website landing page, full webpage screenshot view, vertical page composition.',
      'TOP NAV BAR: clean white navigation bar across the top with a small sans-serif wordmark logo on the left ("Harbor"), four short text nav links spelled clearly ("Services", "Team", "Insurance", "Book"), and a small sage-green rounded "Book a visit" button on the right.',
      'HERO SECTION split layout: LEFT SIDE — large sans-serif headline "Calm dentistry, in Brooklyn." below it two short placeholder body lines, then a sage-green rounded "Book a visit" button and a small "Insurance accepted" badge. RIGHT SIDE — a clean stylized 3D illustration of a modern dental office interior: a single dental chair, an articulating overhead lamp, a small side table with a tray, and one potted plant. Soft natural light coming from one side.',
      'SCROLL-VISIBLE SECTION at bottom edge: a horizontal row of four service cards, each with a simple icon shape and a short word placeholder ("Cleaning", "Whitening", "Implants", "Pediatric").',
      'Style: editorial healthcare website aesthetic, soothing premium feel. Color palette: clean off-white background (#fbfaf7), sage green accents (#5d7c5e), warm coral highlights (#e08c6c). Realistic web layout proportions.',
      'CRITICAL: NO patient faces. NO real brand logos. Realistic but stylized illustration on the right side. 16:9 aspect ratio.',
    ].join(' '),
  },
  {
    id: 'online-academy-site',
    prompt: [
      'Modern online writing-school / academy website landing page, full webpage screenshot view.',
      'TOP NAV BAR: cream-colored navigation bar across the top with a small serif italic wordmark "Field Notes" on the left, four short text nav links ("Cohorts", "Faculty", "Curriculum", "Apply"), and a small dark "Apply now" rounded button on the right.',
      'HERO SECTION split layout: LEFT — large serif headline "A craft, taught honestly." below it two short placeholder body lines, then two buttons ("Browse cohorts" filled deep ink, "Watch intro" outlined). RIGHT — a stylized warm illustration of an open hardcover book at a slight angle on a wooden desk, with a vintage fountain pen resting beside it and a small ceramic cup of black coffee. Soft golden window light from the side. NO writing on the open book pages — just blank cream paper.',
      'SCROLL-VISIBLE SECTION at bottom edge: three horizontal "cohort" cards in a row, each with a small placeholder cohort label ("Spring 26"), course title placeholder line, dates placeholder line, price placeholder ($X,XXX format), and a small "Enroll" button.',
      'Style: editorial educational website aesthetic, magazine-layout feel. Color palette: warm cream (#f5f1ea), deep ink (#1a1812), burnt orange accent (#c9633e). Realistic webpage proportions.',
      'CRITICAL: NO writing visible on the book. NO instructor faces. NO real brand logos. 16:9 aspect ratio.',
    ].join(' '),
  },
  {
    id: 'real-estate-site',
    prompt: [
      'Modern real estate brokerage website listings page, full webpage screenshot view.',
      'TOP NAV BAR: cream-colored navigation bar across the top with a small serif wordmark "Thornhill" on the left, five short text nav links ("Buy", "Sell", "Agents", "Neighborhoods", "About"), and a small dark cognac rounded "Find a home" button on the right.',
      'BELOW NAV: a full-width search bar with three small dropdown chips visible inside it ("Location", "Price", "Beds") and a small dark "Search" button at the right end.',
      'BELOW SEARCH: a three-column property-listing grid with six visible cards arranged in two rows of three. Each card shows: a placeholder property photo (just a colored rectangle representing a brownstone or townhouse silhouette), a placeholder address line ("123 [Street]"), a placeholder price line ("$X,XXX,XXX"), and three tiny stat icons (beds / baths / square feet) with placeholder numbers.',
      'Style: editorial real-estate website aesthetic similar to Compass or Sotheby\'s. Color palette: warm cream background (#f5f1ea), dark cognac browns (#5a3a23), sage green accents on the search button. Realistic web layout proportions.',
      'CRITICAL: NO real photos of houses (use stylized solid-color silhouettes). NO real street addresses. NO real brand logos. 16:9 aspect ratio.',
    ].join(' '),
  },
  {
    id: 'dev-tool-site',
    prompt: [
      'Modern developer-tool / SaaS website landing page, full webpage screenshot view, dark theme.',
      'TOP NAV BAR: dark charcoal navigation bar across the top with a small geometric wordmark logo on the left ("Polaris"), five short text nav links ("Product", "Pricing", "Customers", "Docs", "Sign in"), and a small bright-green rounded "Get started" button on the right.',
      'HERO SECTION split layout: LEFT — large geometric sans-serif headline "Ship faster." below it two short placeholder body lines, then two buttons ("Start free" filled bright-green, "View docs" outlined). RIGHT — a stylized 3D rendered floating laptop showing a dark code editor / dashboard split-screen — left pane has syntax-highlighted color blocks (no readable code, just colored line shapes simulating code), right pane has a small chart and a few stat tiles.',
      'SCROLL-VISIBLE SECTION at bottom edge: a horizontal customer-logo strip with five monochrome placeholder wordmark shapes (no real brand names — just stylized abstract logo shapes), then a hint of a three-card feature grid below the logo strip.',
      'Style: premium developer-tool aesthetic similar to Linear or Vercel. Color palette: deep charcoal background (#0d0d10), bright signal green accent (#52e89e), white text, soft purple highlights on the dashboard chart.',
      'CRITICAL: NO actual code text — just colored lines simulating syntax-highlighted code. NO real brand names in the logo strip. NO real brand logos. 16:9 aspect ratio.',
    ].join(' '),
  },
];

async function generateOne(spec: Spec): Promise<{ id: string; ok: boolean; error?: string }> {
  const { id, prompt } = spec;
  try {
    console.log(`[${id}] generating webpage hero...`);
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
  console.log(`generating ${SPECS.length} website-theme heros (parallel)\n`);
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
