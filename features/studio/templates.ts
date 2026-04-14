// Pre-built templates that skip the blank-page problem. Each template
// pre-fills the GuidedForm fields so the user can generate in one click.

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
  /** Pre-generated project ID for the live preview page (opens in new tab) */
  livePreviewId?: string;
}

export const TEMPLATES: Template[] = [
  {
    id: 'ai-platform',
    title: 'Aura',
    subtitle: 'AI Enterprise Platform',
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
    id: 'space-research',
    title: 'UNVRS Labs',
    subtitle: 'Space Research',
    category: '3D Cinematic',
    brandName: 'UNVRS Labs',
    description:
      'An advanced deep-space research platform for cosmic explorers, astronomers, and theoretical physicists charting the unknown.',
    toneId: 'technical',
    pages: ['about', 'features', 'team'],
    gradient: ['#0a0420', '#7c3aed'],
    previewUrl: '/templates/space-research.jpg',
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
  {
    id: 'saas-landing',
    title: 'StackForge',
    subtitle: 'Dev Platform',
    category: 'Software',
    brandName: 'StackForge',
    description:
      'A powerful infrastructure platform for developers building modern applications. Build faster, ship smarter with world-class dev tools.',
    toneId: 'technical',
    pages: ['features', 'pricing', 'faq'],
    gradient: ['#0f172a', '#1e40af'],
    previewUrl: '/templates/saas-landing.jpg',
    livePreviewId: 'aba626bcf260a89f',
  },
  {
    id: 'creative-agency',
    title: 'OrbitCRM',
    subtitle: 'Agency CRM',
    category: 'SaaS',
    brandName: 'OrbitCRM',
    description:
      'An all-in-one CRM for creative agencies. Run projects, track clients, manage invoices, and analyze performance in one powerful platform.',
    toneId: 'minimal',
    pages: ['features', 'pricing', 'testimonials', 'faq'],
    gradient: ['#a8d8ea', '#88c9bf'],
    previewUrl: '/templates/creative-agency.jpg',
    livePreviewId: '2b156f2560f7a324',
  },
  {
    id: 'app-landing',
    title: 'TripVault',
    subtitle: 'Travel App',
    category: 'Mobile App',
    brandName: 'TripVault',
    description:
      'A travel planning app that stores tickets, itineraries, bookings and documents — automatically organized for every trip.',
    toneId: 'playful',
    pages: ['features', 'pricing', 'faq'],
    gradient: ['#87CEEB', '#ffd89b'],
    previewUrl: '/templates/app-landing.jpg',
    livePreviewId: '324e52eb6fb864af',
  },
  {
    id: 'ecommerce-brand',
    title: 'Maison',
    subtitle: 'DTC Brand',
    category: 'Ecommerce',
    brandName: 'Maison',
    description:
      'A luxury direct-to-consumer brand selling thoughtfully designed everyday essentials made from sustainable materials with minimal packaging.',
    toneId: 'luxurious',
    pages: ['about', 'features', 'testimonials'],
    gradient: ['#F4EFE6', '#c9a96e'],
    previewUrl: '/templates/ecommerce-brand.jpg',
    livePreviewId: '82ebfcbc7b0d1943',
  },
  {
    id: 'restaurant',
    title: 'Ember & Vine',
    subtitle: 'Fine Dining',
    category: 'Hospitality',
    brandName: 'Ember & Vine',
    description:
      'An intimate 14-seat tasting menu restaurant rooted in seasonal ingredients and paired with an extraordinary natural wine program.',
    toneId: 'luxurious',
    pages: ['about', 'contact'],
    gradient: ['#1a0f0a', '#8b6f47'],
    previewUrl: '/templates/restaurant.jpg',
    livePreviewId: '82cabc99a9c8467c',
  },
  {
    id: 'portfolio',
    title: 'Miles Kaplan',
    subtitle: 'Designer Portfolio',
    category: 'Portfolio',
    brandName: 'Miles Kaplan',
    description:
      'Independent brand designer working with early-stage startups on brand identity, type systems, and digital products. A small practice focused on doing fewer things exceptionally well.',
    toneId: 'editorial',
    pages: ['about', 'case-studies', 'contact'],
    gradient: ['#F4EFE6', '#8b9dc3'],
    previewUrl: '/templates/portfolio.jpg',
    livePreviewId: '4cd841523814c52e',
  },
  {
    id: 'startup-launch',
    title: 'Nexus',
    subtitle: 'Dev Tools Startup',
    category: 'Startup',
    brandName: 'Nexus',
    description:
      'The next-generation developer toolkit. Open-source core, premium cloud, instant everything. Built from first principles for developers who refuse to accept slow.',
    toneId: 'bold',
    pages: ['features', 'team'],
    gradient: ['#0f0f23', '#7c3aed'],
    previewUrl: '/templates/startup-launch.jpg',
    livePreviewId: '6368ae1dacfbb647',
  },
  {
    id: 'nonprofit',
    title: 'Blue Horizon',
    subtitle: 'Ocean Conservation',
    category: 'Non-profit',
    brandName: 'Blue Horizon',
    description:
      'An ocean conservation nonprofit running coastal cleanup programs and marine protection advocacy across three continents — because the sea cannot speak for itself.',
    toneId: 'playful',
    pages: ['about', 'team', 'contact', 'testimonials'],
    gradient: ['#042f2e', '#2dd4bf'],
    previewUrl: '/templates/nonprofit.jpg',
    livePreviewId: '31d8a7a3138f2438',
  },
];
