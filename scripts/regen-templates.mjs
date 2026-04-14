import { fal } from '@fal-ai/client';
import fs from 'fs';

fal.config({ credentials: process.env.FAL_API_KEY });

// Only regenerate the 6 that aren't up to StackForge/TripVault quality
const templates = [
  {
    id: 'creative-agency',
    prompt: 'Modern CRM SaaS landing page hero. Navigation: Logo OrbitCRM with orbit icon, Menu items: Features, Integrations, Pricing, Docs, Button: Start Free Trial. Centered layout. Headline: Run your agency smarter. Word "smarter" highlighted with blue gradient underline. Subheading: All your projects, clients, analytics and invoices — unified into one powerful platform. CTA button: Try it Free for 14 Days. Hero background: soft pastel sky blue gradient with floating 3D CRM dashboard UI cards showing charts, kanban boards, customer profile tiles, invoice panels, all clean and organized with soft drop shadows. Design style: playful SaaS with floating glass cards, soft pastel shadows. Fonts: Inter / DM Sans. Colors: sky blue background, white UI cards, blue and teal accents.',
  },
  {
    id: 'ecommerce-brand',
    prompt: 'Minimal luxury ecommerce brand landing page hero. Navigation: Wordmark "Maison" in large serif on left, Menu items: Shop, Collection, Journal, About, Cart icon with count badge. Left-aligned 60/40 split layout. Left side 60%: Headline: Essentials. Nothing more. Italic serif accent on "more". Subtext: Thoughtfully designed everyday objects made from sustainable materials and minimal packaging — built to outlast trends. CTA button: Shop the Collection + text link: Our Story. Small badge: FROM $48 · FREE SHIPPING. Right side 40%: editorial product still life photography of artisan ceramic vase, handblown glass bottle, folded natural linen textile, small potted succulent on warm stone pedestal with soft natural window light casting gentle shadows. Design style: Apple-style minimal product photography with generous whitespace. Fonts: Cormorant Garamond / Inter. Colors: warm cream background, dark charcoal text, muted warm gold accent.',
  },
  {
    id: 'restaurant',
    prompt: 'Fine dining restaurant landing page hero. Navigation: Centered italic serif wordmark "Ember & Vine" with ampersand, Menu items split on sides: Menu, Reservations, Wine, About, Events, Button: Book a Table on right. Full-bleed food photography hero. Headline centered: Where the season comes to the table. Italic serif accent on "the season". Subtext: An intimate 14-seat tasting menu rooted in what the land provides, paired with an extraordinary natural wine program. CTA buttons: Reserve Your Evening + View Menu. Info line: OPEN WED–SUN · 6PM–11PM · BROOKLYN NY. Hero background: dramatic overhead photography of artfully plated seasonal tasting course — seared protein, microgreens, edible flowers, artistic sauce work on handmade ceramic plate, warm ambient candlelight, dark walnut wood surface, wine glass edge, linen napkin. Design style: luxury Michelin editorial with moody atmospheric candlelight. Fonts: Cormorant Garamond / Inter. Colors: dark warm brown, cream text, warm amber gold accent.',
  },
  {
    id: 'portfolio',
    prompt: 'Independent designer portfolio landing page hero. Navigation: Wordmark "Miles Kaplan" in serif caps on left, Menu items: Work, About, Journal, Contact, Small badge: Available Q2. Left-aligned 55/45 split layout. Left side 55%: Headline: Design that earns its place on the page. Italic serif accent on "earns its place". Subtext: Working with early-stage startups on brand identity, type systems, and digital products. A small practice focused on doing fewer things exceptionally well. CTA button: View Selected Work + text link: Read the Journal. Client logos row: NOTION · LINEAR · ARC · FIGMA · RAMP · VERCEL with subtle dividers. Right side 45%: overhead editorial flat lay photography of designer workspace — leather sketchbook with pencil logo explorations, color palette swatches fanned out, vintage typography specimen book open, small brass ruler, espresso cup on raw concrete desk with soft natural window light. Design style: minimal editorial Swiss-inspired with generous whitespace. Fonts: Cormorant Garamond / Inter. Colors: warm cream background, near-black text, muted dusty blue accent.',
  },
  {
    id: 'startup-launch',
    prompt: 'Premium developer tools startup waitlist landing page hero. Navigation: Logo Nexus with geometric hexagon icon, Menu items: Docs, Changelog, Discord, Pricing, Button: Join Waitlist with subtle violet glow. Centered hero layout. Headline: Dev tools. Rebuilt from first principles. Bold geometric sans display typography in white. Subtext: The next-generation toolkit for developers who refuse to accept slow. Open-source core, premium cloud, instant everything. CTA buttons: Claim Early Access + See the Demo. Social proof row: BACKED BY Y COMBINATOR · USED AT STRIPE, FIGMA, LINEAR, VERCEL. Hero background: deep dark purple cosmic scene with floating translucent 3D crystal prisms and geometric polyhedra in varying sizes, volumetric violet and cyan light beams slicing through space, subtle particle nebula effect, soft lens flare in upper right corner. Design style: bold sci-fi startup aesthetic with dramatic volumetric lighting. Fonts: JetBrains Mono / Geist Sans. Colors: deep dark purple background, white typography, violet and cyan glowing accents.',
  },
  {
    id: 'nonprofit',
    prompt: 'Ocean conservation nonprofit landing page hero. Navigation: Logo Blue Horizon with curved wave icon, Menu items: Mission, Programs, Impact, Team, Stories, Button: Donate Now in warm amber gold. Centered layout over aerial photography. Headline: The ocean needs a few good humans. Italic serif accent on "good humans" in warm amber gold. Subtext: Coastal cleanup programs and marine protection advocacy across three continents — because the sea cannot speak for itself. CTA buttons: Get Involved + View Our Impact. Impact stats row at bottom: 2.4M LBS plastic removed · 127 beaches restored · 40+ partner organizations · 18K volunteers worldwide. Hero background: breathtaking aerial drone photograph from high altitude showing crystal clear turquoise Caribbean ocean meeting pristine white sand coastline, visible coral reef formations through transparent water, dramatic golden hour sunlight reflecting off gentle waves creating light rays. Design style: environmental documentary cinematography with uplifting cinematic tone. Fonts: DM Serif Display / Inter. Colors: deep ocean teal, turquoise highlights, white typography, warm amber gold accent.',
  },
];

for (const t of templates) {
  console.log('→ ' + t.id);
  try {
    const r = await fal.subscribe('fal-ai/ideogram/v3', {
      input: {
        prompt: t.prompt,
        image_size: 'landscape_16_9',
        num_images: 1,
        style: 'DESIGN',
      },
    });
    const url = r.data?.images?.[0]?.url;
    const resp = await fetch(url);
    const buf = Buffer.from(await resp.arrayBuffer());
    fs.writeFileSync('public/templates/' + t.id + '.jpg', buf);
    console.log('  ✓ ' + Math.round(buf.length / 1024) + 'KB');
  } catch (e) {
    console.log('  ✗ ' + e.message?.slice(0, 150));
  }
}
console.log('Done!');
