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
  // ─── 3D Cinematic ────────────────────────────────────────────────────────
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
  },

  // ─── SaaS / Software ─────────────────────────────────────────────────────
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
    livePreviewId: 'aba626bcf260a89f',
  },

  // ─── Mobile App ──────────────────────────────────────────────────────────
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
    livePreviewId: '324e52eb6fb864af',
  },

  // ─── Professional Services / Consulting ──────────────────────────────────
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
    livePreviewId: '2b156f2560f7a324',
  },

  // ─── Retail / Brick & Mortar ─────────────────────────────────────────────
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
    livePreviewId: '82ebfcbc7b0d1943',
  },

  // ─── Restaurant ──────────────────────────────────────────────────────────
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
    livePreviewId: '82cabc99a9c8467c',
  },

  // ─── Photography / Portfolio ─────────────────────────────────────────────
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
    livePreviewId: '4cd841523814c52e',
  },

  // ─── Hardware / Product ──────────────────────────────────────────────────
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
    livePreviewId: '6368ae1dacfbb647',
  },

  // ─── Wellness / Fitness Studio ───────────────────────────────────────────
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
    livePreviewId: '31d8a7a3138f2438',
  },

  // ─── Research Institute ──────────────────────────────────────────────────
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
  },
];
