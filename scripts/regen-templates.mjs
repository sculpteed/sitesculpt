import { fal } from '@fal-ai/client';
import fs from 'fs';

fal.config({ credentials: process.env.FAL_API_KEY });

const templates = [
  {
    id: 'saas-landing',
    prompt: 'Premium SaaS landing page hero section. Floating centered nav pill with gradient #1a1a1a to #0d0d0d, 1px border rgba(255,255,255,0.1), rounded-full. Brand wordmark VERTEX in bold sans-serif, micro caps. Nav links: Features, Pricing, Docs, Changelog — uppercase, letter-spacing 0.22em, muted white/70. Primary CTA pill: Get Started. Hero eyebrow row: thin cyan accent line + uppercase micro label AI-POWERED AUTOMATION PLATFORM (letter-spacing 0.3em, tiny). H1 large bold sans-serif headline: Automation That Thinks Ahead — two lines, tight leading. Subparagraph below: The next generation of workflows — built for teams who ship faster than the competition. CTAs: primary filled button Request Access + secondary link See Demo with play icon. Bottom stats row: three columns — 10,000+ Teams, 99.9% Uptime, 50M+ Workflows. Hero background: dark navy deep space with subtle glowing cyan wireframe grid, floating geometric 3D nodes connected by thin light trails, depth fog. Cream text on dark ink. Design style: clean developer-focused, premium enterprise. Fonts: Inter, Geist Mono. Colors: dark navy #0d0d14, cream #F4EFE6 text, cyan #00d4ff accents.'
  },
  {
    id: 'creative-agency',
    prompt: 'Premium creative agency landing page hero. Floating centered nav pill — gradient #1a1a1a to #0d0d0d, 1px border rgba(255,255,255,0.1), rounded-full. Brand wordmark STUDIO NOIR in Cinzel serif, micro caps. Nav links: Work, Services, About, Contact — uppercase, letter-spacing 0.22em, muted white/70. Primary CTA pill: Start a project. Hero eyebrow row: thin gold accent line + uppercase micro label AWARD-WINNING BRAND STUDIO SINCE 2019 (letter-spacing 0.3em, 0.65rem). H1 display serif Cormorant Garamond large editorial headline: Identity crafted for the ambitious — two lines, tight leading, italic accent on "ambitious". Subparagraph 0.85rem cream/60%: We design brand identities and digital experiences for companies that refuse to blend in. CTAs: chamfer-style primary View Our Work + text link Philosophy with circle play icon. Bottom stats row: three columns — 200+ Brands launched, 15 Years crafting identity, 40+ Awards. Hero background: dramatic dark moody scene with floating 3D metallic gold spheres, translucent glass cubes, and polished chrome rings in elegant asymmetric composition, warm rim lighting against deep black. Cream #F4EFE6 text on ink #141210. Design style: editorial fashion-magazine luxury. Fonts: Cinzel, Cormorant Garamond, Inter. Colors: ink black, cream, warm gold.'
  },
  {
    id: 'app-landing',
    prompt: 'Modern mobile app landing page hero inside glass container. Navigation pill: Logo FLOWBOARD with icon, Menu items: Features, Pricing, Download, Help, Button: Get the App. Centered hero layout. Eyebrow: NEW · PROJECT MANAGEMENT REIMAGINED. H1 Headline: Projects that actually flow. Word "flow" highlighted with purple-to-pink gradient. Subheading: Boards, collaboration, and smart nudges — all in one delightfully simple workspace. Primary CTA: Download Free + secondary: Watch Demo. Hero background: vibrant gradient aurora sky (blue to magenta to pink), floating 3D iPhone on right showing colorful productivity app UI with task cards, charts, notifications. Small floating UI cards scattered with soft drop shadows. Design style: playful SaaS interface with glass morphism, floating cards, soft shadows. Fonts: Inter, Poppins. Colors: aurora gradient background, white UI cards, purple/pink gradient highlights, dark text.'
  },
  {
    id: 'ecommerce-brand',
    prompt: 'Luxury DTC brand landing page hero. Minimal top nav: Wordmark MAISON in serif, Menu: Shop, Collection, Journal, About, Account icon, Cart icon with count badge. Left-aligned hero layout. Eyebrow: SMALL-BATCH · CERTIFIED ORGANIC. H1 display serif headline: Essentials. Nothing more. Large editorial serif, italic accent on "more". Subparagraph: Thoughtfully designed everyday objects made from sustainable materials and minimal packaging. CTAs: Primary Shop the Collection + secondary Our Story. Featured product pricing: From $48. Right side: editorial product still life — 3D rendered ceramic vase, glass bottle, folded linen textile on warm stone pedestal. Warm natural window light, soft shadows. Design style: Apple-style minimal product photography, generous whitespace. Fonts: Cormorant Garamond serif headlines, Inter body. Colors: warm cream #F4EFE6 background, dark charcoal text, muted gold accent.'
  },
  {
    id: 'restaurant',
    prompt: 'Fine dining restaurant landing page hero section. Floating nav bar: Logo EMBER & VINE in elegant serif with ampersand, Menu: Menu, Reservations, About, Wine, Events, Button: Book a Table. Centered hero layout over full-bleed food photography. Eyebrow: A SEASONAL TASTING EXPERIENCE · BROOKLYN. H1 display serif in Cormorant Garamond: Where the season comes to the table. Italic accent on "the season". Subparagraph: An intimate 14-seat tasting menu rooted in what the land provides, paired with an extraordinary natural wine program. Primary CTA: Reserve Your Evening + secondary: View Menu. Small info row bottom: OPEN WED–SUN 6PM–11PM · 127 MAIN ST, BROOKLYN. Hero background: dramatic overhead shot of an artfully plated dish with microgreens, edible flowers, artistic sauce work on handmade ceramic plate, warm ambient candlelight, dark walnut wood surface, wine glass edge, linen napkin. Design style: luxury Michelin editorial with moody atmospheric lighting. Fonts: Cormorant Garamond, Inter. Colors: dark warm brown #1a0f0a, cream text, warm amber accent.'
  },
  {
    id: 'portfolio',
    prompt: 'Independent designer portfolio hero section. Minimal top nav: wordmark name in serif caps, Menu: Work, About, Journal, Contact, all uppercase micro type. Left-aligned hero. Eyebrow: INDEPENDENT BRAND DESIGNER · SINCE 2018. H1 display serif headline: Design that earns its place on the page. Large Cormorant Garamond editorial, italic accent on "earns its place". Subparagraph: Working with early-stage startups on brand identity, type systems, and digital products. A small practice focused on doing fewer things exceptionally well. CTAs: Primary View Selected Work + secondary Read the Journal. Selected clients row: NOTION · LINEAR · ARC · FIGMA · RAMP · VERCEL (logos in muted gray). Right side: large editorial portrait of a designer workspace — sketchbook with pencil logo explorations, color palette swatches, vintage typography specimen, cup of espresso on raw concrete desk. Warm studio lighting. Design style: minimal editorial with generous whitespace, Swiss-inspired. Fonts: Cormorant Garamond display, Inter body, mono accents. Colors: warm cream #F4EFE6 background, near-black text, single muted blue accent.'
  },
  {
    id: 'startup-launch',
    prompt: 'Developer tools startup waitlist landing page hero. Floating minimal nav: Logo NEXUS with geometric icon, Menu: Docs, Changelog, Discord, Button: Join Waitlist. Centered hero layout. Eyebrow: EARLY ACCESS · LAUNCHING SOON. H1 bold geometric sans headline: Dev tools. Rebuilt from first principles. Sharp modern typography. Subparagraph: The next-generation toolkit for developers who refuse to accept slow. Open-source core, premium cloud, instant everything. CTAs: Primary Claim Early Access + secondary See the Demo with arrow icon. Social proof row below: Backed by Y Combinator · Used by engineers at Stripe, Figma, Linear. Hero background: deep dark purple cosmic scene with floating translucent 3D crystal prisms and geometric shards, volumetric light beams in violet and cyan, subtle particle nebula effect, lens flare accents. Design style: bold sci-fi startup aesthetic with dramatic lighting. Fonts: JetBrains Mono for code, Geist Sans for headlines, Inter body. Colors: deep dark purple #0f0f23, white text, violet #7c3aed and cyan #06b6d4 accent glows.'
  },
  {
    id: 'nonprofit',
    prompt: 'Ocean conservation nonprofit landing page hero. Floating transparent nav: Logo BLUE HORIZON with wave icon, Menu: Mission, Programs, Impact, Team, Button: Donate Now in accent color. Centered hero layout over full-bleed aerial ocean photography. Eyebrow: OCEAN CONSERVATION · FOUNDED 2020. H1 display serif headline: The ocean needs a few good humans. Italic accent on "good humans". Large editorial Cormorant. Subparagraph: Coastal cleanup programs and marine protection advocacy across three continents — because the sea cannot speak for itself. CTAs: Primary Get Involved + secondary View Our Impact with arrow. Impact stats row: 2.4M lbs plastic removed · 127 beaches restored · 40+ partner organizations. Hero background: breathtaking aerial drone shot of crystal clear turquoise ocean meeting pristine white sand beach, coral reef visible through water, dramatic golden hour sunlight on waves. Design style: environmental documentary cinematography. Fonts: Cormorant Garamond, Inter, DM Sans. Colors: deep teal, ocean turquoise, white text, warm amber accent.'
  },
];

for (const t of templates) {
  console.log('→ ' + t.id);
  try {
    const r = await fal.subscribe('fal-ai/flux-pro/v1.1-ultra', {
      input: { prompt: t.prompt, num_images: 1, aspect_ratio: '16:9', safety_tolerance: '6', output_format: 'jpeg' }
    });
    const url = r.data?.images?.[0]?.url;
    const resp = await fetch(url);
    const buf = Buffer.from(await resp.arrayBuffer());
    fs.writeFileSync('public/templates/' + t.id + '.jpg', buf);
    console.log('  ✓ ' + Math.round(buf.length/1024) + 'KB');
  } catch(e) { console.log('  ✗ ' + e.message?.slice(0,150)); }
}
console.log('Done!');
