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
    bgPrompt: 'Ultra-clean composition, premium color grading, full-bleed website hero background. Multiple floating 3D glass dashboard UI panels arranged in a BORDER FRAME composition — panels ONLY on the far left edge and far right edge of the frame, NOT in the center. Completely empty dark cosmic space in the large CENTER AREA of the image (where text will be placed), soft glowing cyan and violet accent lights along the edges only, subtle particle effects at the edges, depth fog filling the center vignette. The CENTER 60% of the frame must be dark empty space for text readability. Panels show abstract glowing UI shapes with no readable text. Octane render quality. No text, no logos, no watermarks in-frame. Aspect ratio 16:9.',
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
    bgPrompt: 'Full-bleed website hero background, wide 16:9 aspect. Bright dreamy sky with soft wispy clouds drifting across the entire frame, warm pastel gradient transitioning from soft blue to peach and cream, subtle bokeh depth, cinematic cloud photography. A small 3D-rendered smartphone is tucked into the FAR RIGHT EDGE of the frame, only partially visible (cut off at the right edge) — its black glass screen is completely off (pure black reflection, no UI, no graphics, no gradients on screen), tilted at a soft angle with subtle shadow. The LEFT 75% of the frame is PURE EMPTY SKY with clouds only, zero objects, zero text, zero labels, zero UI. ABSOLUTELY NO TEXT ANYWHERE IN IMAGE, NO BRAND LABELS, NO APP NAMES, NO IPHONE LOGO, NO WORDS OF ANY KIND, NO WATERMARK. Just pure dreamy sky with a sliver of a phone on the right edge. Apple-style product photography aesthetic.',
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
    bgPrompt: 'Ultra-clean composition, premium color grading, full-bleed website hero background. Modern minimalist consulting firm office interior composed with HEAVY NEGATIVE SPACE on the LEFT HALF of the frame (for text overlay). The RIGHT HALF shows a sculptural oak conference table with leather chairs beside floor-to-ceiling windows overlooking a city skyline at golden hour, warm sunlight casting long shadows. The LEFT HALF is a simple soft wall or floor area with warm diffused light, completely clean uncluttered space with no objects. Curated editorial architectural photography, shallow depth of field, warm cream tones. No text, no logos, no watermarks in-frame. Aspect ratio 16:9.',
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
    bgPrompt: 'Ultra-clean composition, premium color grading, full-bleed website hero background. Brick-and-mortar boutique storefront composed with the WHOLE SCENE PUSHED TO THE RIGHT HALF of the frame. Right half: warm brick facade with large arched glass window displaying curated ceramic vases and linen textiles on raw wooden pedestals, brass pendant lighting, slate sidewalk, small potted olive tree, elegant dark door. LEFT HALF: soft blurred warm neutral background, shadowed brick wall surface, clean empty space suitable for text overlay, no objects or detail in left half. Soft early evening golden light on the right side. Cinematic editorial photography. No signage text, no shop name visible, no watermarks in-frame. Aspect ratio 16:9.',
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
    bgPrompt: 'Ultra-clean composition, premium color grading, full-bleed website hero background. Intimate fine-dining restaurant interior at night shot from a WIDE low angle. The foreground bottom-third shows a blurred wooden bar with candles and wine glasses, the background around the edges shows soft amber pendant lights and distant blurred kitchen warmth, but the CENTER of the frame is a SOFT DARK VIGNETTE with heavy shadow and minimal detail — warm dark walnut wall area, out-of-focus candlelight bokeh, deep atmospheric shadows. Large dark calm area in the center of the image for text overlay. Luxury Michelin aesthetic with heavy depth of field, dramatic central darkness. No text, no menu boards, no signage, no watermarks in-frame. Aspect ratio 16:9.',
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
    bgPrompt: 'Ultra-clean composition, premium color grading, full-bleed website hero background. Professional photography studio composed with heavy NEGATIVE SPACE on the LEFT HALF of the frame. The RIGHT HALF of the frame shows: vintage medium-format Hasselblad camera on a tripod, a softbox light on a C-stand, polaroid prints pinned on a cork board, wooden stool, warm natural window light. The LEFT HALF of the frame is a clean white seamless paper backdrop with soft natural light gradient, completely empty space suitable for text overlay, no objects on the left. Raw concrete floor visible in foreground. Editorial photography aesthetic. No text, no logos, no watermarks in-frame. Aspect ratio 16:9.',
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
    bgPrompt: 'Ultra-clean composition, premium color grading, full-bleed website hero background. A sleek minimalist consumer hardware product sitting on an illuminated pedestal in the LOWER THIRD of the frame, positioned toward the bottom center. The UPPER TWO-THIRDS of the frame is completely dark empty studio space — deep void, subtle radial vignette of soft light glow from the product rising upward, completely clean dark space for text overlay above the product. The product is an abstract sculptural metal and glass device with rounded edges and dark anodized finish, dramatic single key light from above catching its edges. Moody Apple-keynote product reveal aesthetic with the product occupying only the bottom section. Cinematic product photography. No text, no branding on the device, no logos, no watermarks in-frame. Aspect ratio 16:9.',
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
    bgPrompt: 'Ultra-clean composition, premium color grading, full-bleed website hero background. Serene minimalist yoga studio with objects arranged ONLY on the bottom edge of the frame and FAR LEFT / FAR RIGHT edges. Bottom left: a row of sage-green rolled yoga mats standing upright against a plastered cream wall. Bottom right: a single potted fiddle leaf fig plant beside a wooden bench, a brass singing bowl. The entire UPPER TWO-THIRDS of the frame is a simple plastered cream wall with warm natural morning light streaming softly, subtle dust motes, large clean empty wall area above and around the mid-level for text overlay. Polished blonde hardwood floor visible at the very bottom. Dreamy soft atmosphere. Editorial wellness photography. No text, no logos, no watermarks in-frame. Aspect ratio 16:9.',
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
    bgPrompt: 'Full-bleed website hero background, wide 16:9 aspect, mountaintop astronomy observatory at night. A small white observatory dome with a telescope peeking out is positioned in the LOWER LEFT CORNER of the frame, appearing small and distant. Rocky desert terrain stretches along the bottom edge. The ENTIRE UPPER 75% of the frame is a vast pure dark starry sky — a dramatic Milky Way galaxy arches softly across, subtle nebula colors in deep violet and soft teal scattered among thousands of stars, completely clean empty sky with no structures, no text, no banners, no letters. ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS, NO TITLES, NO BANNERS, NO HEADLINES, NO SIGNAGE, NO WATERMARKS ANYWHERE IN THE IMAGE. Just a pure astrophotography cosmic scene with a small observatory in the bottom left. Carl Sagan cosmic aesthetic, long exposure, cinematic grandeur.',
  },
];
