import { fal } from '@fal-ai/client';
import fs from 'fs';

fal.config({ credentials: process.env.FAL_API_KEY });

const templates = [
  {
    id: 'saas-landing',
    prompt: 'Minimal developer infrastructure platform landing page hero. Navigation bar: Logo StackForge, Menu items: Docs, SDK, Community, Pricing, Primary button: Start Building. Centered layout. Headline: Build Faster. Ship Smarter. Subtext: A powerful infrastructure platform for developers building modern applications. CTA button: Start Building for Free. Hero background: abstract digital grid landscape with floating terminal windows and code fragments. Design style: dark developer aesthetic similar to modern dev platforms. Fonts: IBM Plex Sans / Inter. Colors: deep navy background, neon blue and purple grid lines, white typography.',
  },
  {
    id: 'creative-agency',
    prompt: 'Modern CRM SaaS landing page hero inside glass container. Navigation: Logo OrbitCRM, Menu: Features, Integrations, Pricing, Docs, Button: Start Free Trial. Centered hero layout. Headline: Run Your Agency Smarter. Word Smarter highlighted with blue gradient. Subheading: All your projects, clients, analytics and invoices — unified into one powerful platform. CTA: Try it Free for 14 Days. Hero background: hand painted countryside landscape with rolling hills, birds and soft sunlight. Design style: glass UI container with blur and shadows. Fonts: Inter / DM Sans. Colors: soft blues and greens, white container.',
  },
  {
    id: 'app-landing',
    prompt: 'Modern travel planning app landing page hero. Navigation: Logo TripVault, Menu items: Features, Pricing, Company, Help, Button: Sign In. Centered layout. Headline: All Your Travel Plans. One Simple Place. Subtext: Store tickets, itineraries, bookings and documents — automatically organized for every trip. CTA button: Download App. Hero background: bright sky with floating travel UI cards including airline tickets, boarding pass and itinerary panels. Design style: playful SaaS interface with floating cards and soft shadows. Fonts: Inter / Poppins. Colors: sky blue background, white UI cards, soft gradient highlights.',
  },
  {
    id: 'ecommerce-brand',
    prompt: 'Luxury DTC commerce brand landing page hero. Navigation: Wordmark Maison in serif, Menu items: Shop, Collection, Journal, About, Cart icon with count. Left-aligned 60/40 split layout. Headline: Essentials. Nothing more. Word "more" in italic serif accent. Subtext: Thoughtfully designed everyday objects made from sustainable materials and minimal packaging — built to outlast trends. CTA button: Shop the Collection + secondary link Our Story. Small badge: FROM $48 · FREE SHIPPING. Hero background right side: editorial product still life — artisan ceramic vase, handblown glass bottle, folded linen textile, potted succulent on warm stone pedestal with soft natural window light. Design style: Apple-style minimal product photography with generous whitespace. Fonts: Cormorant Garamond / Inter. Colors: warm cream background, dark charcoal text, muted warm gold accent.',
  },
  {
    id: 'restaurant',
    prompt: 'Fine dining tasting menu restaurant landing page hero. Navigation: Centered wordmark "Ember & Vine" in italic serif, Menu items split on sides: Menu, Reservations, Wine, Events, About, Button: Book a Table. Centered hero over full-bleed food photography. Headline: Where the season comes to the table. Italic accent on "the season". Subtext: An intimate 14-seat tasting menu rooted in what the land provides, paired with an extraordinary natural wine program. CTA button: Reserve Your Evening + secondary View Menu. Info row at bottom: OPEN WED–SUN · 6PM–11PM · BROOKLYN NY. Hero background: dramatic overhead shot of artfully plated seasonal dish with microgreens, edible flowers and artistic sauce work on handmade ceramic plate, warm ambient candlelight, dark walnut wood surface, wine glass edge. Design style: luxury Michelin editorial with moody atmospheric lighting. Fonts: Cormorant Garamond / Inter. Colors: dark warm brown, cream text, warm amber gold accent.',
  },
  {
    id: 'portfolio',
    prompt: 'Independent designer portfolio landing page hero. Navigation: Wordmark "Miles Kaplan" in serif caps, Menu items: Work, About, Journal, Contact, Small badge: Available for Q2. Left-aligned 55/45 split layout. Headline: Design that earns its place on the page. Italic serif accent on "earns its place". Subtext: Working with early-stage startups on brand identity, type systems, and digital products. A small practice focused on doing fewer things exceptionally well. CTA button: View Selected Work + secondary Read the Journal. Selected clients row: NOTION · LINEAR · ARC · FIGMA · RAMP · VERCEL with subtle dividers. Hero background right side: editorial flat lay photography of designer workspace with leather sketchbook, color palette swatches, typography specimen book, vintage pencils and espresso cup on raw concrete desk with natural window light. Design style: minimal editorial Swiss-inspired with generous whitespace. Fonts: Cormorant Garamond / Inter. Colors: warm cream background, near-black text, muted dusty blue accent.',
  },
  {
    id: 'startup-launch',
    prompt: 'Developer tools startup waitlist landing page hero. Navigation: Logo Nexus with geometric hexagon icon, Menu items: Docs, Changelog, Discord, Pricing, Button: Join Waitlist with subtle glow. Centered hero layout. Headline: Dev tools. Rebuilt from first principles. Bold geometric sans display typography. Subtext: The next-generation toolkit for developers who refuse to accept slow. Open-source core, premium cloud, instant everything. CTA button: Claim Early Access + secondary See the Demo. Social proof row: BACKED BY Y COMBINATOR · USED AT STRIPE, FIGMA, LINEAR, VERCEL. Hero background: deep dark purple cosmic scene with floating translucent 3D crystal prisms and geometric shards in varying sizes, volumetric violet and cyan light beams, subtle particle nebula effect, lens flare. Design style: bold sci-fi startup aesthetic with dramatic volumetric lighting. Fonts: JetBrains Mono / Geist Sans. Colors: deep dark purple background, white typography, violet and cyan glowing accents.',
  },
  {
    id: 'nonprofit',
    prompt: 'Ocean conservation nonprofit landing page hero. Navigation: Logo Blue Horizon with curved wave icon, Menu items: Mission, Programs, Impact, Team, Stories, Button: Donate Now in warm amber. Centered layout over full-bleed aerial photography. Headline: The ocean needs a few good humans. Italic serif accent on "good humans". Subtext: Coastal cleanup programs and marine protection advocacy across three continents — because the sea cannot speak for itself. CTA button: Get Involved + secondary View Our Impact. Impact stats row at bottom: 2.4M LBS Plastic removed · 127 Beaches restored · 40+ Partner organizations · 18K Volunteers worldwide. Hero background: breathtaking aerial drone photograph of crystal clear turquoise Caribbean ocean meeting pristine white sand coastline, coral reef formations visible through transparent water, dramatic golden hour sunlight reflecting off gentle waves. Design style: environmental documentary cinematography with uplifting tone. Fonts: DM Serif Display / Inter. Colors: deep ocean teal, turquoise highlights, white typography, warm amber gold accent.',
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
