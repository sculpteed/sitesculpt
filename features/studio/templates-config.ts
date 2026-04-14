// Template compositor config — drives the HTML overlay rendered at
// /template-render/[id]. Each entry specifies the background prompt
// (AI-generated) AND the HTML overlay content (nav + headline + CTAs).

export interface TemplateConfig {
  id: string;
  brandName: string;
  logoIcon?: string; // lucide icon name or initial
  nav: string[];
  navCta: string;
  headline: string;
  headlineAccent?: string; // word(s) inside headline to highlight with gradient
  subtext: string;
  primaryCta: string;
  secondaryCta?: string;
  smallLabel?: string; // "FROM $48 · FREE SHIPPING" style
  stats?: Array<{ value: string; label: string }>;
  theme: 'dark' | 'light' | 'cream';
  accentColor: string; // hex
  headlineFont: 'sans' | 'serif' | 'display';
  layout: 'centered' | 'split-left' | 'split-right';
  /** The AI background prompt — no UI/text/logos in scene */
  bgPrompt: string;
}

export const TEMPLATE_CONFIGS: TemplateConfig[] = [
  // ─── 3D Cinematic (the 3 kept) ──────────────────────────────────────────
  {
    id: 'ai-platform',
    brandName: 'Aura',
    nav: ['Overview', 'Infrastructure', 'Agents', 'Scale', 'Deploy'],
    navCta: 'Deploy Now',
    headline: 'The intelligence layer for modern enterprise.',
    subtext: 'Unify your fragmented data streams. Aura processes billions of events in real-time.',
    primaryCta: 'Request Access',
    secondaryCta: 'Explore Architecture',
    theme: 'dark',
    accentColor: '#34d399',
    headlineFont: 'sans',
    layout: 'centered',
    bgPrompt: 'Ultra-clean composition, premium color grading, full-bleed website hero background. Breathtaking cinematic 3D render of floating sky islands connected by cascading waterfalls disappearing into soft clouds below, snow-capped mountains in distance, dramatic volumetric god rays piercing atmospheric mist, Unreal Engine quality Ghibli-meets-Inception aesthetic with epic scale and depth. No text, no logos, no watermarks in-frame. Aspect ratio 16:9.',
  },
  {
    id: 'architecture',
    brandName: 'Meridian',
    nav: ['Projects', 'Practice', 'Awards', 'Journal', 'Contact'],
    navCta: 'Commission',
    headline: 'Where vision meets form.',
    headlineAccent: 'form.',
    subtext: 'A contemporary architecture practice designing residences, cultural institutions, and urban landmarks.',
    primaryCta: 'View Portfolio',
    secondaryCta: 'About Our Practice',
    theme: 'dark',
    accentColor: '#e8b874',
    headlineFont: 'serif',
    layout: 'centered',
    bgPrompt: 'Ultra-clean composition, premium color grading, full-bleed website hero background. Cinematic 3D architectural visualization of a minimalist modernist building with glass walls and exposed concrete perched on a cliff overlooking ocean at golden hour, dramatic volumetric sunlight streaming horizontally, native coastal landscaping, long shadows, photoreal Unreal Engine render quality. Sophisticated architectural photography with cinematic warm lighting. No text, no logos, no watermarks in-frame. Aspect ratio 16:9.',
  },
  {
    id: 'creative-3d',
    brandName: 'PRISM',
    nav: ['Work', 'Services', 'About', 'Contact'],
    navCta: 'Start a Project',
    headline: 'Design at the speed of imagination.',
    subtext: 'We craft brand worlds, immersive digital experiences, and cinematic interactive identity systems.',
    primaryCta: 'View Our Work',
    secondaryCta: 'Our Process',
    theme: 'dark',
    accentColor: '#ff6ec7',
    headlineFont: 'sans',
    layout: 'centered',
    bgPrompt: 'Ultra-clean composition, premium color grading, full-bleed website hero background. Stunning cinematic 3D abstract scene with floating translucent glass prisms catching rainbow light dispersions, liquid chrome spheres reflecting a warm sunset sky with pink and orange tones, iridescent metallic ribbons flowing through space, volumetric lighting, ultra-high-detail Octane render quality. Bold cinematic 3D concept art. No text, no logos, no watermarks in-frame. Aspect ratio 16:9.',
  },

  // ─── SaaS / Software ─────────────────────────────────────────────────────
  {
    id: 'saas-landing',
    brandName: 'StackForge',
    nav: ['Product', 'Docs', 'Pricing', 'Changelog'],
    navCta: 'Start Free',
    headline: 'Ship software your users love.',
    headlineAccent: 'love.',
    subtext: 'The all-in-one platform for modern teams: deploys, monitoring, analytics — built for speed.',
    primaryCta: 'Start Free Trial',
    secondaryCta: 'See It Live',
    theme: 'dark',
    accentColor: '#22d3ee',
    headlineFont: 'display',
    layout: 'centered',
    bgPrompt: 'Ultra-clean composition, premium color grading, full-bleed website hero background. Multiple floating 3D glass dashboard UI panels suspended in dark cosmic space — one large central analytics dashboard with charts and graphs, smaller surrounding tiles showing notifications and status cards, soft glowing cyan and violet accent lights illuminating the edges, subtle particle effects in the background, shallow depth of field with near panels in focus and distant ones slightly blurred, volumetric lighting. Premium SaaS aesthetic, Octane render quality. No text on the panels, no logos, no readable UI copy, just abstract glowing UI shapes and blurred chart silhouettes. No watermarks in-frame. Aspect ratio 16:9.',
  },

  // ─── Mobile App ──────────────────────────────────────────────────────────
  {
    id: 'app-landing',
    brandName: 'TripVault',
    nav: ['Features', 'Pricing', 'Company', 'Help'],
    navCta: 'Sign In',
    headline: 'All your travel plans. One simple place.',
    subtext: 'Store tickets, itineraries, bookings and documents — automatically organized for every trip.',
    primaryCta: 'Download App',
    theme: 'light',
    accentColor: '#3b82f6',
    headlineFont: 'sans',
    layout: 'centered',
    bgPrompt: 'Ultra-clean composition, premium color grading, full-bleed website hero background. A prominent 3D-rendered iPhone Pro smartphone floating at a cinematic angle in the center of the scene, screen facing viewer but completely off/black or showing only abstract color gradients (no readable UI), tilted with realistic depth and soft shadow beneath, surrounded by a bright dreamy sky backdrop with soft wispy clouds, warm sunset gradient in the background transitioning from soft blue to peach, subtle bokeh, cinematic product render, premium Apple-style photography aesthetic. No text on the screen, no app UI, no watermarks in-frame. Aspect ratio 16:9.',
  },

  // ─── Professional Services / Consulting ──────────────────────────────────
  {
    id: 'creative-agency',
    brandName: 'Atlas & Co',
    nav: ['Practice', 'Insights', 'Clients', 'Team', 'Contact'],
    navCta: 'Start a Conversation',
    headline: 'Strategic counsel for ambitious companies.',
    subtext: 'A modern consultancy helping founders and executives navigate growth, strategy, and change.',
    primaryCta: 'Book Intro Call',
    secondaryCta: 'Our Work',
    smallLabel: 'TRUSTED BY SERIES A–D FOUNDERS',
    theme: 'cream',
    accentColor: '#1f2937',
    headlineFont: 'serif',
    layout: 'split-left',
    bgPrompt: 'Ultra-clean composition, premium color grading, full-bleed website hero background. Modern minimalist consulting firm office interior, floor-to-ceiling windows overlooking a city skyline at golden hour, a long sculptural oak conference table with two leather chairs, warm sunlight casting dramatic long shadows across the wood floor, a single abstract art piece on the far wall, subtle potted plant, curated editorial architectural photography, shallow depth of field, warm cream tones. Premium architectural interior photography aesthetic. No text, no logos, no watermarks in-frame. Aspect ratio 16:9.',
  },

  // ─── Retail / Brick & Mortar ─────────────────────────────────────────────
  {
    id: 'ecommerce-brand',
    brandName: 'Maison',
    nav: ['Shop', 'Stores', 'Journal', 'About'],
    navCta: 'Visit Store',
    headline: 'A studio and shop of quiet objects.',
    headlineAccent: 'quiet objects.',
    subtext: 'Thoughtfully made ceramics, textiles, and small goods. Flagship in Brooklyn, online everywhere.',
    primaryCta: 'Shop the Collection',
    secondaryCta: 'Visit Our Store',
    smallLabel: '127 ATLANTIC AVE · BROOKLYN · OPEN DAILY',
    theme: 'cream',
    accentColor: '#8b6f47',
    headlineFont: 'serif',
    layout: 'split-left',
    bgPrompt: 'Ultra-clean composition, premium color grading, full-bleed website hero background. Beautiful brick-and-mortar boutique storefront exterior viewed at a slight angle — warm brick facade, large arched glass window displaying curated ceramic vases and linen textiles beautifully arranged on raw wooden pedestals, soft brass pendant lighting visible through the glass, slate sidewalk in foreground with small potted olive tree beside an elegant dark door, soft early evening golden light, gentle reflections in the window, cinematic editorial photography with warm muted palette. No signage text visible, no readable shop name on window, no watermarks in-frame. Aspect ratio 16:9.',
  },

  // ─── Restaurant Interior ─────────────────────────────────────────────────
  {
    id: 'restaurant',
    brandName: 'Ember & Vine',
    nav: ['Menu', 'Reservations', 'Wine', 'Events'],
    navCta: 'Book a Table',
    headline: 'A room built for the long dinner.',
    subtext: 'An intimate 32-seat tasting room with an open kitchen, a rotating seasonal menu, and a deep natural wine list.',
    primaryCta: 'Reserve a Table',
    secondaryCta: 'View the Menu',
    smallLabel: 'OPEN WED–SUN · 6PM–11PM · BROOKLYN NY',
    theme: 'dark',
    accentColor: '#d4a574',
    headlineFont: 'serif',
    layout: 'centered',
    bgPrompt: 'Ultra-clean composition, premium color grading, full-bleed website hero background. Intimate fine-dining restaurant interior at night — warm amber pendant lights hanging over a long wooden bar in the foreground, soft candles on tables, a blurred open kitchen with brass hood and glowing flame visible in the background, dark walnut wood, copper accents, exposed brick on walls, bottles of natural wine on oak shelves, rich atmospheric shadows, moody cinematic warmth, editorial hospitality photography with dramatic depth of field. Luxury Michelin aesthetic. No text, no menu boards, no signage, no watermarks in-frame. Aspect ratio 16:9.',
  },

  // ─── Creative / Photography Studio ───────────────────────────────────────
  {
    id: 'portfolio',
    brandName: 'Miles Kaplan',
    nav: ['Work', 'About', 'Journal', 'Contact'],
    navCta: 'Available Q2',
    headline: 'Photographs that earn their place on the wall.',
    headlineAccent: 'earn their place',
    subtext: 'Commercial and editorial photography for brands who care about light, story, and craft.',
    primaryCta: 'View Portfolio',
    secondaryCta: 'Recent Projects',
    smallLabel: 'KINFOLK · APARTAMENTO · CEREAL · NYT MAG',
    theme: 'cream',
    accentColor: '#5a7db8',
    headlineFont: 'serif',
    layout: 'split-left',
    bgPrompt: 'Ultra-clean composition, premium color grading, full-bleed website hero background. Professional photography studio interior — large softbox lights on C-stands, vintage medium-format Hasselblad camera on a sturdy tripod in center, gentle white seamless paper backdrop, polaroid prints pinned on a cork wall to the side, a wooden stool, a roll of analog film on a side table, warm natural light from a tall window mixing with studio strobes, raw concrete floor, minimal and curated, editorial photography aesthetic. No text, no logos, no watermarks in-frame. Aspect ratio 16:9.',
  },

  // ─── Hardware / Physical Product ─────────────────────────────────────────
  {
    id: 'startup-launch',
    brandName: 'Nexus',
    nav: ['Product', 'Story', 'Specs', 'Press'],
    navCta: 'Join Waitlist',
    headline: 'Computing, reimagined.',
    subtext: 'A single device that replaces everything on your desk. Shipping fall 2026.',
    primaryCta: 'Reserve Yours',
    secondaryCta: 'Watch the Film',
    smallLabel: 'DESIGNED IN BROOKLYN · MANUFACTURED IN SWITZERLAND',
    theme: 'dark',
    accentColor: '#a78bfa',
    headlineFont: 'sans',
    layout: 'centered',
    bgPrompt: 'Ultra-clean composition, premium color grading, full-bleed website hero background. A sleek minimalist consumer hardware product sitting on a single illuminated white pedestal in a completely dark studio space — the product is an abstract sculptural metal and glass device with subtle rounded edges and a dark anodized finish, dramatic single key light from above catching the edges creating soft highlights, deep shadows surrounding the pedestal, moody Apple-keynote product reveal aesthetic, cinematic product photography with shallow depth of field. Premium consumer tech launch look. No text, no branding visible on the device, no logos, no watermarks in-frame. Aspect ratio 16:9.',
  },

  // ─── Wellness / Fitness Studio ───────────────────────────────────────────
  {
    id: 'nonprofit',
    brandName: 'Onda',
    nav: ['Classes', 'Schedule', 'Teachers', 'Retreats'],
    navCta: 'Book a Class',
    headline: 'Come as you are. Leave lighter.',
    headlineAccent: 'lighter.',
    subtext: 'A movement and breathwork studio in Brooklyn. Daily classes, monthly retreats, community every day.',
    primaryCta: 'See This Week',
    secondaryCta: 'Intro Offer — 3 Classes $39',
    smallLabel: '128 WYTHE AVE · BROOKLYN · EST 2021',
    theme: 'cream',
    accentColor: '#5e9b8a',
    headlineFont: 'serif',
    layout: 'centered',
    bgPrompt: 'Ultra-clean composition, premium color grading, full-bleed website hero background. Serene minimalist wellness and yoga studio interior — warm natural morning light streaming through large arched wood-frame windows, polished blonde hardwood floor, a row of sage-green yoga mats rolled and standing upright against a plastered cream wall, a single potted fiddle leaf fig plant beside a wooden bench, a brass singing bowl on a low shelf, a linen meditation cushion on the floor, soft dreamy atmosphere with visible dust motes in the light rays, editorial wellness photography aesthetic. No text, no logos, no watermarks in-frame. Aspect ratio 16:9.',
  },

  // ─── Research / Observatory ──────────────────────────────────────────────
  {
    id: 'space-research',
    brandName: 'Ortelius',
    nav: ['Research', 'Missions', 'Team', 'Press', 'Donate'],
    navCta: 'Start Building',
    headline: 'The oldest questions. The newest instruments.',
    subtext: 'An independent research institute studying cosmology, deep-space imaging, and the origins of galaxies.',
    primaryCta: 'Read Our Work',
    secondaryCta: 'Support the Institute',
    stats: [
      { value: '14', label: 'Published papers' },
      { value: '3.8m', label: 'Objects catalogued' },
      { value: '6', label: 'Partner observatories' },
    ],
    theme: 'dark',
    accentColor: '#a78bfa',
    headlineFont: 'serif',
    layout: 'centered',
    bgPrompt: 'Ultra-clean composition, premium color grading, full-bleed website hero background. Mountaintop astronomy observatory at night with its huge white telescope dome open, pointed toward a dramatic Milky Way galaxy spread across the sky, subtle nebula colors in shades of deep violet and soft teal, a few small figures silhouetted against warm tungsten light inside the dome visible through the opening, rocky desert terrain with distant mountain ridges on the horizon, dramatic long exposure astrophotography feel, Carl Sagan cosmic aesthetic with cinematic grandeur. No text, no logos, no watermarks in-frame. Aspect ratio 16:9.',
  },
];
