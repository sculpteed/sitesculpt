import { fal } from '@fal-ai/client';
import fs from 'fs';

fal.config({ credentials: process.env.FAL_API_KEY });

const templates = [
  {
    id: 'saas-landing',
    prompt: 'Modern SaaS landing page hero. Navigation: Logo Vertex, Menu items: Features, Pricing, Docs, Changelog, Button: Get Started. Centered layout. Headline: Automation that thinks ahead. Subtext: AI-powered workflows built for teams who ship faster than the competition. CTA button: Request Access + secondary text link: See Demo. Stats row at bottom: 10,000+ Teams, 99.9% Uptime, 50M+ Workflows. Hero background: dark navy deep space with subtle glowing cyan wireframe grid, floating geometric 3D nodes connected by thin light trails. Design style: clean premium enterprise developer tools. Colors: dark navy background, white text, cyan accent highlights.',
  },
  {
    id: 'creative-agency',
    prompt: 'Premium creative agency landing page hero. Navigation: Logo Studio Noir, Menu items: Work, Services, About, Contact, Button: Start a Project. Centered layout. Headline: Identity crafted for the ambitious. Subtext: We design brand identities and digital experiences for companies that refuse to blend in. CTA button: View Our Work + secondary text link: Our Philosophy. Stats row: 200+ Brands launched, 15 Years crafting identity, 40+ Awards. Hero background: dramatic dark moody scene with floating 3D metallic gold spheres, translucent glass cubes, polished chrome rings in elegant asymmetric composition, warm rim lighting against deep black. Design style: editorial fashion-magazine luxury. Colors: ink black background, cream text, warm gold accents.',
  },
  {
    id: 'app-landing',
    prompt: 'Modern mobile app landing page hero. Navigation: Logo Flowboard, Menu items: Features, Pricing, Download, Help, Button: Get the App. Centered layout. Headline: Projects that actually flow. Subtext: Boards, collaboration, and smart nudges — all in one delightfully simple workspace. CTA button: Download Free + secondary text: Watch Demo. Hero background: vibrant gradient aurora sky (blue to magenta to pink) with floating 3D iPhone showing colorful productivity app UI with task cards. Floating app icons scattered around with soft shadows. Design style: playful SaaS interface with glass morphism and floating cards. Colors: aurora gradient background, white UI cards, purple and pink highlights.',
  },
  {
    id: 'ecommerce-brand',
    prompt: 'Luxury DTC brand landing page hero. Navigation: Wordmark Maison in serif, Menu: Shop, Collection, Journal, About, Cart icon. Left-aligned hero layout. Headline: Essentials. Nothing more. Subtext: Thoughtfully designed everyday objects made from sustainable materials and minimal packaging. CTA button: Shop the Collection + secondary text: Our Story. Featured product price: From $48. Right side: editorial product still life with ceramic vase, glass bottle, folded linen textile on warm stone pedestal, soft natural window light. Design style: Apple-style minimal product photography, generous whitespace. Colors: warm cream background, dark charcoal text, muted gold accent.',
  },
  {
    id: 'restaurant',
    prompt: 'Fine dining restaurant landing page hero. Navigation: Logo Ember and Vine, Menu: Menu, Reservations, About, Wine, Events, Button: Book a Table. Centered hero layout over full-bleed food photography. Headline: Where the season comes to the table. Subtext: An intimate 14-seat tasting menu rooted in what the land provides, paired with an extraordinary natural wine program. CTA button: Reserve Your Evening + secondary text: View Menu. Small info row: OPEN WED–SUN 6PM–11PM · BROOKLYN. Hero background: dramatic overhead shot of artfully plated dish with microgreens, edible flowers, artistic sauce work on handmade ceramic plate, warm ambient candlelight, dark walnut wood. Design style: luxury Michelin editorial. Colors: dark warm brown, cream text, warm amber accent.',
  },
  {
    id: 'portfolio',
    prompt: 'Independent designer portfolio hero section. Navigation: Wordmark name in serif, Menu: Work, About, Journal, Contact. Left-aligned hero layout. Headline: Design that earns its place on the page. Subtext: Working with early-stage startups on brand identity, type systems, and digital products. A small practice focused on doing fewer things exceptionally well. CTA button: View Selected Work + secondary text: Read the Journal. Client logos row: Notion, Linear, Arc, Figma, Ramp, Vercel. Right side: editorial portrait of a designer workspace with sketchbook, color swatches, typography specimen, espresso cup on raw concrete desk. Design style: minimal editorial Swiss-inspired. Colors: warm cream background, near-black text, muted blue accent.',
  },
  {
    id: 'startup-launch',
    prompt: 'Developer tools startup waitlist landing page. Navigation: Logo Nexus, Menu: Docs, Changelog, Discord, Button: Join Waitlist. Centered layout. Headline: Dev tools. Rebuilt from first principles. Subtext: The next-generation toolkit for developers who refuse to accept slow. Open-source core, premium cloud, instant everything. CTA button: Claim Early Access + secondary text: See the Demo. Social proof: Backed by Y Combinator. Used by engineers at Stripe, Figma, Linear. Hero background: deep dark purple cosmic scene with floating translucent 3D crystal prisms and geometric shards, volumetric light beams in violet and cyan, particle nebula effect. Design style: bold sci-fi startup aesthetic. Colors: deep dark purple background, white text, violet and cyan accent glows.',
  },
  {
    id: 'nonprofit',
    prompt: 'Ocean conservation nonprofit landing page hero. Navigation: Logo Blue Horizon with wave icon, Menu: Mission, Programs, Impact, Team, Button: Donate Now. Centered layout over aerial ocean photography. Headline: The ocean needs a few good humans. Subtext: Coastal cleanup programs and marine protection advocacy across three continents because the sea cannot speak for itself. CTA button: Get Involved + secondary text: View Our Impact. Impact stats row: 2.4M lbs plastic removed, 127 beaches restored, 40+ partner organizations. Hero background: breathtaking aerial drone shot of crystal clear turquoise ocean meeting pristine white sand beach, coral reef visible through water, golden hour sunlight. Design style: environmental documentary cinematography. Colors: deep teal, ocean turquoise, white text, warm amber accent.',
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
