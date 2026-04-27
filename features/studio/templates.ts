// Pre-built templates — each one pre-fills the GuidedForm fields.

export interface Template {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  brandName: string;
  description: string;
  toneId: string;
  pages: string[];
  /** Two hex colors for the card gradient background (fallback) */
  gradient: [string, string];
  /** Path to pre-generated screenshot in /public — shown as card bg */
  previewUrl?: string;
  /** Vercel Blob URL for a short cinematic loop. When present the card
   *  autoplays this muted video instead of the static previewUrl. */
  loopUrl?: string;
  /** Pre-generated project ID for the live preview page (opens in new tab) */
  livePreviewId?: string;
}

export const TEMPLATES: Template[] = [
  // ─── 3D Cinematic showcase (top 3) ───────────────────────────────────────
  {
    id: 'ai-platform',
    title: 'Aura',
    subtitle: 'Enterprise AI',
    category: '3D Cinematic',
    brandName: 'Aura',
    description:
      'A futuristic AI platform unifying fragmented data streams to deliver autonomous predictive insights in real-time for modern enterprise teams.',
    toneId: 'bold',
    pages: ['features', 'pricing', 'testimonials'],
    gradient: ['#1a2f4a', '#5b9cde'],
    previewUrl: '/templates/ai-platform.jpg',
    loopUrl: 'https://1sd6xyxycslrxoqp.public.blob.vercel-storage.com/template-loops/ai-platform.mp4',
  },
  {
    id: 'architecture',
    title: 'Meridian',
    subtitle: 'Architecture Studio',
    category: '3D Cinematic',
    brandName: 'Meridian',
    description:
      'A contemporary architecture practice designing residences, cultural institutions, and urban landmarks across North America and Europe.',
    toneId: 'editorial',
    pages: ['about', 'case-studies', 'team', 'contact'],
    gradient: ['#d4b88a', '#3d342c'],
    previewUrl: '/templates/architecture.jpg',
    loopUrl: 'https://1sd6xyxycslrxoqp.public.blob.vercel-storage.com/template-loops/architecture.mp4',
  },
  {
    id: 'creative-3d',
    title: 'Prism',
    subtitle: 'Creative Studio',
    category: '3D Cinematic',
    brandName: 'Prism',
    description:
      'A creative studio crafting brand worlds, immersive digital experiences, and cinematic interactive identity systems for ambitious brands.',
    toneId: 'bold',
    pages: ['case-studies', 'team', 'contact'],
    gradient: ['#1a0a2e', '#ff6ec7'],
    previewUrl: '/templates/creative-3d.jpg',
    loopUrl: 'https://1sd6xyxycslrxoqp.public.blob.vercel-storage.com/template-loops/creative-3d.mp4',
  },

  // ─── Full website themes ─────────────────────────────────────────────────
  // Generated as actual webpage screenshots — top nav with named tabs, hero
  // section with headline + CTA + body, and below-the-fold content visible
  // (cards / forms / listings / logo strips). These read as real businesses
  // you'd actually run, not isolated UI illustrations.

  {
    id: 'restaurant-site',
    title: 'Vesta Tasting Room',
    subtitle: 'Restaurant',
    category: 'Hospitality',
    brandName: 'Vesta',
    description:
      'A 32-seat tasting room with a rotating seasonal menu and a deep natural-wine list. Open Wednesday through Saturday — reservations encouraged.',
    toneId: 'luxurious',
    pages: ['features', 'about', 'contact'],
    gradient: ['#1a0f12', '#d4a574'],
    previewUrl: '/templates/restaurant-site.jpg',
  },
  {
    id: 'dental-site',
    title: 'Harbor Dental',
    subtitle: 'Dental Practice',
    category: 'Healthcare',
    brandName: 'Harbor',
    description:
      'A modern Brooklyn dental practice with five dentists and four hygienists. Cleanings, cosmetic work, pediatric — most insurance accepted.',
    toneId: 'minimal',
    pages: ['features', 'team', 'pricing', 'contact'],
    gradient: ['#fbfaf7', '#5d7c5e'],
    previewUrl: '/templates/dental-site.jpg',
  },
  {
    id: 'law-firm-site',
    title: 'Caldwell & Partners',
    subtitle: 'Law Firm',
    category: 'Professional Services',
    brandName: 'Caldwell',
    description:
      'A law firm advising founders and family-office clients on corporate, tax, and trusts. Offices in New York and Greenwich.',
    toneId: 'editorial',
    pages: ['features', 'team', 'about', 'contact'],
    gradient: ['#f5f1ea', '#1a2540'],
    previewUrl: '/templates/law-firm-site.jpg',
  },
  {
    id: 'online-academy-site',
    title: 'Field Notes',
    subtitle: 'Writing School',
    category: 'Education',
    brandName: 'Field Notes',
    description:
      'A six-week online writing school for working professionals. Live workshops with novelists and journalists, craft-first curriculum.',
    toneId: 'editorial',
    pages: ['features', 'pricing', 'team', 'testimonials'],
    gradient: ['#f5f1ea', '#c9633e'],
    previewUrl: '/templates/online-academy-site.jpg',
  },
  {
    id: 'real-estate-site',
    title: 'Thornhill Realty',
    subtitle: 'Real Estate Brokerage',
    category: 'Real Estate',
    brandName: 'Thornhill',
    description:
      'A boutique brokerage specializing in Brooklyn brownstones and Manhattan lofts. 24 agents, $2B+ in sales since 2003.',
    toneId: 'editorial',
    pages: ['features', 'team', 'about', 'contact'],
    gradient: ['#f5f1ea', '#5a3a23'],
    previewUrl: '/templates/real-estate-site.jpg',
  },
  {
    id: 'dev-tool-site',
    title: 'Polaris Cloud',
    subtitle: 'Developer Platform',
    category: 'Software',
    brandName: 'Polaris',
    description:
      'Ship faster with one platform for deploys, monitoring, and rollbacks. Built for engineering teams of 5 to 500.',
    toneId: 'technical',
    pages: ['features', 'pricing', 'faq', 'testimonials'],
    gradient: ['#0d0d10', '#52e89e'],
    previewUrl: '/templates/dev-tool-site.jpg',
  },

  // ─── Functional product templates ────────────────────────────────────────
  // Hero illustrations show product UI (kanban cards, dashboards, booking
  // widgets) — closer to a marketing-page feature shot than a full website.
  // Static keyframes; no autoplay video.

  {
    id: 'med-spa',
    title: 'Soren Aesthetics',
    subtitle: 'Med Spa & Wellness Clinic',
    category: 'Healthcare',
    brandName: 'Soren',
    description:
      'A luxury medical spa offering personalized aesthetic treatments — botox, laser therapy, microneedling — administered by board-certified specialists in Los Angeles.',
    toneId: 'luxurious',
    pages: ['features', 'pricing', 'team', 'contact'],
    gradient: ['#f5e6e8', '#c9a584'],
    previewUrl: '/templates/med-spa.jpg',
  },
  {
    id: 'project-mgmt',
    title: 'Stratus',
    subtitle: 'Team Project Management',
    category: 'Productivity SaaS',
    brandName: 'Stratus',
    description:
      'One workspace for projects, files, conversations and milestones. Built for teams of 5–50 who need clarity without overhead.',
    toneId: 'minimal',
    pages: ['features', 'pricing', 'testimonials', 'faq'],
    gradient: ['#fafafb', '#5b6cf0'],
    previewUrl: '/templates/project-mgmt.jpg',
  },
  {
    id: 'analytics-saas',
    title: 'Mira',
    subtitle: 'Product Analytics',
    category: 'Analytics SaaS',
    brandName: 'Mira',
    description:
      "Real-time product analytics for product teams who don't have time to dig. See what's working — right now.",
    toneId: 'technical',
    pages: ['features', 'pricing', 'testimonials', 'faq'],
    gradient: ['#0a0a14', '#22d3ee'],
    previewUrl: '/templates/analytics-saas.jpg',
  },
  {
    id: 'boutique-hotel',
    title: 'Vesper',
    subtitle: 'Boutique Hotel',
    category: 'Hospitality',
    brandName: 'Vesper',
    description:
      'A 14-room boutique hotel on the Amalfi coast. Hand-tiled bathrooms, sea-facing terraces, an honor bar, no televisions.',
    toneId: 'luxurious',
    pages: ['features', 'team', 'testimonials', 'contact'],
    gradient: ['#e8d5b8', '#2c5b7a'],
    previewUrl: '/templates/boutique-hotel.jpg',
  },
  {
    id: 'productivity-app',
    title: 'Apex',
    subtitle: 'Personal Productivity App',
    category: 'Application',
    brandName: 'Apex',
    description:
      'A personal task and project tracker. Daily focus blocks, weekly reviews, year-long goals — in one calm app.',
    toneId: 'minimal',
    pages: ['features', 'pricing', 'testimonials'],
    gradient: ['#f5f0e8', '#5d7c5e'],
    previewUrl: '/templates/productivity-app.jpg',
  },

  // ─── Atmospheric / cinematic templates ───────────────────────────────────
  // Earlier templates that lead with cinematic atmosphere over UI density.
  // Useful for art-direction-led briefs (architecture, creative work,
  // luxury hospitality) but won't read as "real product website" the way
  // the website-theme set above does.

  {
    id: 'saas-landing',
    title: 'StackForge',
    subtitle: 'SaaS Platform',
    category: 'Software',
    brandName: 'StackForge',
    description:
      'The all-in-one platform for modern teams — deploys, monitoring, analytics. Ship software your users love, faster than the competition.',
    toneId: 'technical',
    pages: ['features', 'pricing', 'faq'],
    gradient: ['#0f172a', '#22d3ee'],
    previewUrl: '/templates/saas-landing.jpg',
    loopUrl: 'https://1sd6xyxycslrxoqp.public.blob.vercel-storage.com/template-loops/saas-landing.mp4',
    livePreviewId: 'aba626bcf260a89f',
  },
  {
    id: 'app-landing',
    title: 'TripVault',
    subtitle: 'Mobile App',
    category: 'Mobile App',
    brandName: 'TripVault',
    description:
      'A travel planning app that stores tickets, itineraries, bookings and documents — automatically organized for every trip.',
    toneId: 'playful',
    pages: ['features', 'pricing', 'faq'],
    gradient: ['#87CEEB', '#3b82f6'],
    previewUrl: '/templates/app-landing.jpg',
    loopUrl: 'https://1sd6xyxycslrxoqp.public.blob.vercel-storage.com/template-loops/app-landing.mp4',
    livePreviewId: '324e52eb6fb864af',
  },
  {
    id: 'creative-agency',
    title: 'Atlas & Co',
    subtitle: 'Consultancy',
    category: 'Professional Services',
    brandName: 'Atlas & Co',
    description:
      'A modern consultancy helping founders and executives navigate growth, strategy, and change. Strategic counsel for ambitious companies.',
    toneId: 'editorial',
    pages: ['about', 'case-studies', 'team', 'contact'],
    gradient: ['#F4EFE6', '#1f2937'],
    previewUrl: '/templates/creative-agency.jpg',
    loopUrl: 'https://1sd6xyxycslrxoqp.public.blob.vercel-storage.com/template-loops/creative-agency.mp4',
    livePreviewId: '2b156f2560f7a324',
  },
  {
    id: 'ecommerce-brand',
    title: 'Maison',
    subtitle: 'Boutique & Shop',
    category: 'Retail',
    brandName: 'Maison',
    description:
      'A studio and shop of quiet objects. Thoughtfully made ceramics, textiles, and small goods. Flagship store in Brooklyn, online everywhere.',
    toneId: 'luxurious',
    pages: ['about', 'features', 'testimonials'],
    gradient: ['#F4EFE6', '#c9a96e'],
    previewUrl: '/templates/ecommerce-brand.jpg',
    loopUrl: 'https://1sd6xyxycslrxoqp.public.blob.vercel-storage.com/template-loops/ecommerce-brand.mp4',
    livePreviewId: '82ebfcbc7b0d1943',
  },
  {
    id: 'restaurant',
    title: 'Ember & Vine',
    subtitle: 'Restaurant',
    category: 'Hospitality',
    brandName: 'Ember & Vine',
    description:
      'An intimate 32-seat tasting room with an open kitchen, a rotating seasonal menu, and a deep natural wine list.',
    toneId: 'luxurious',
    pages: ['about', 'contact'],
    gradient: ['#1a0f0a', '#d4a574'],
    previewUrl: '/templates/restaurant.jpg',
    loopUrl: 'https://1sd6xyxycslrxoqp.public.blob.vercel-storage.com/template-loops/restaurant.mp4',
    livePreviewId: '82cabc99a9c8467c',
  },
  {
    id: 'portfolio',
    title: 'Miles Kaplan',
    subtitle: 'Photography Studio',
    category: 'Portfolio',
    brandName: 'Miles Kaplan',
    description:
      'Commercial and editorial photography for brands who care about light, story, and craft. Photographs that earn their place on the wall.',
    toneId: 'editorial',
    pages: ['about', 'case-studies', 'contact'],
    gradient: ['#F4EFE6', '#5a7db8'],
    previewUrl: '/templates/portfolio.jpg',
    loopUrl: 'https://1sd6xyxycslrxoqp.public.blob.vercel-storage.com/template-loops/portfolio.mp4',
    livePreviewId: '4cd841523814c52e',
  },
  {
    id: 'startup-launch',
    title: 'Nexus',
    subtitle: 'Hardware Product',
    category: 'Consumer Hardware',
    brandName: 'Nexus',
    description:
      'Computing, reimagined. A single device that replaces everything on your desk. Designed in Brooklyn, manufactured in Switzerland.',
    toneId: 'bold',
    pages: ['features', 'team'],
    gradient: ['#0f0f23', '#a78bfa'],
    previewUrl: '/templates/startup-launch.jpg',
    loopUrl: 'https://1sd6xyxycslrxoqp.public.blob.vercel-storage.com/template-loops/startup-launch.mp4',
    livePreviewId: '6368ae1dacfbb647',
  },
  {
    id: 'nonprofit',
    title: 'Onda',
    subtitle: 'Wellness Studio',
    category: 'Wellness & Fitness',
    brandName: 'Onda',
    description:
      'A movement and breathwork studio in Brooklyn. Daily classes, monthly retreats, community every day. Come as you are.',
    toneId: 'minimal',
    pages: ['about', 'team', 'contact', 'testimonials'],
    gradient: ['#e8f0ec', '#5e9b8a'],
    previewUrl: '/templates/nonprofit.jpg',
    loopUrl: 'https://1sd6xyxycslrxoqp.public.blob.vercel-storage.com/template-loops/nonprofit.mp4',
    livePreviewId: '31d8a7a3138f2438',
  },
  {
    id: 'space-research',
    title: 'Ortelius',
    subtitle: 'Research Institute',
    category: 'Research & Academia',
    brandName: 'Ortelius',
    description:
      'An independent research institute studying cosmology, deep-space imaging, and the origins of galaxies. The oldest questions, the newest instruments.',
    toneId: 'editorial',
    pages: ['about', 'features', 'team'],
    gradient: ['#0a0420', '#a78bfa'],
    previewUrl: '/templates/space-research.jpg',
    loopUrl: 'https://1sd6xyxycslrxoqp.public.blob.vercel-storage.com/template-loops/space-research.mp4',
  },
];
