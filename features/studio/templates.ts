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
    id: 'saas-landing',
    title: 'SaaS Landing',
    subtitle: 'Clean, conversion-focused product page',
    category: 'Software',
    brandName: '',
    description:
      'A modern SaaS product that helps teams work faster with AI-powered automation. Built for startups and growing companies.',
    toneId: 'minimal',
    pages: ['features', 'pricing', 'faq', 'testimonials'],
    gradient: ['#0f172a', '#1e40af'],
    previewUrl: '/templates/saas-landing.jpg',
    livePreviewId: 'aba626bcf260a89f',
  },
  {
    id: 'creative-agency',
    title: 'Creative Agency',
    subtitle: 'Portfolio-driven with case studies',
    category: 'Agency',
    brandName: '',
    description:
      'A boutique creative agency specializing in brand identity, digital design, and strategic campaigns for ambitious brands.',
    toneId: 'editorial',
    pages: ['about', 'case-studies', 'team', 'contact'],
    gradient: ['#1a1a2e', '#e94560'],
    previewUrl: '/templates/creative-agency.jpg',
    livePreviewId: '2b156f2560f7a324',
  },
  {
    id: 'app-landing',
    title: 'App Landing',
    subtitle: 'Mobile or web app launch page',
    category: 'Product',
    brandName: '',
    description:
      'A productivity app that simplifies project management with intuitive boards, real-time collaboration, and smart notifications.',
    toneId: 'playful',
    pages: ['features', 'pricing', 'faq'],
    gradient: ['#0d1117', '#58a6ff'],
    previewUrl: '/templates/app-landing.jpg',
    livePreviewId: '324e52eb6fb864af',
  },
  {
    id: 'ecommerce-brand',
    title: 'E-commerce Brand',
    subtitle: 'Premium DTC product showcase',
    category: 'Retail',
    brandName: '',
    description:
      'A direct-to-consumer brand selling thoughtfully designed everyday essentials with sustainable materials and minimal packaging.',
    toneId: 'luxurious',
    pages: ['about', 'features', 'testimonials'],
    gradient: ['#1b1b18', '#c9a96e'],
    previewUrl: '/templates/ecommerce-brand.jpg',
    livePreviewId: '82ebfcbc7b0d1943',
  },
  {
    id: 'restaurant',
    title: 'Restaurant',
    subtitle: 'Fine dining or cafe experience',
    category: 'Hospitality',
    brandName: '',
    description:
      'An intimate restaurant focused on seasonal, locally sourced ingredients with a rotating tasting menu and natural wine program.',
    toneId: 'luxurious',
    pages: ['about', 'contact'],
    gradient: ['#1a0f0a', '#8b6f47'],
    previewUrl: '/templates/restaurant.jpg',
    livePreviewId: '82cabc99a9c8467c',
  },
  {
    id: 'portfolio',
    title: 'Personal Portfolio',
    subtitle: 'Designer or developer showcase',
    category: 'Personal',
    brandName: '',
    description:
      'Personal portfolio for an independent designer who works with early-stage startups on brand identity, type systems, and digital products.',
    toneId: 'editorial',
    pages: ['about', 'case-studies', 'contact'],
    gradient: ['#0a0a0a', '#fafafa'],
    previewUrl: '/templates/portfolio.jpg',
    livePreviewId: '4cd841523814c52e',
  },
  {
    id: 'startup-launch',
    title: 'Startup Launch',
    subtitle: 'Waitlist or pre-launch teaser',
    category: 'Startup',
    brandName: '',
    description:
      'A stealth-mode startup building the next generation of developer tools. Launching soon with early access for design partners.',
    toneId: 'bold',
    pages: ['features', 'team'],
    gradient: ['#0f0f23', '#7c3aed'],
    previewUrl: '/templates/startup-launch.jpg',
    livePreviewId: '6368ae1dacfbb647',
  },
  {
    id: 'nonprofit',
    title: 'Non-profit',
    subtitle: 'Mission-driven organization',
    category: 'Cause',
    brandName: '',
    description:
      'A non-profit focused on ocean conservation, running coastal cleanup programs and advocating for marine protection policies worldwide.',
    toneId: 'playful',
    pages: ['about', 'team', 'contact', 'testimonials'],
    gradient: ['#042f2e', '#2dd4bf'],
    previewUrl: '/templates/nonprofit.jpg',
    livePreviewId: '31d8a7a3138f2438',
  },
];
