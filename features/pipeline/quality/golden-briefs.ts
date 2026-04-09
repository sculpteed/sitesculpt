// Curated brief set for quality testing. Covers the breadth of realistic
// user intents without cherry-picking easy prompts. Each brief should be
// representative of a real user's first-time submission.

export interface GoldenBrief {
  id: string;
  category: string;
  compiled: string; // already in the format compilePrompt produces
}

export const GOLDEN_BRIEFS: GoldenBrief[] = [
  {
    id: 'saas-dev-tool',
    category: 'SaaS · Developer tool',
    compiled: `Brand name: Graphite.

What it is: A code review platform for engineering teams that ship continuously, with stacked PRs and zero-merge-conflict workflows.

Tone: Technical & precise. Direct, specific, engineer-to-engineer. No marketing fluff. Facts and specs.

Color palette: art-director's choice. Derive a palette that best matches the brand, tone, audience, and any attached reference media.

Must include these sections (one per item):
- Features: The core product capabilities.
- Pricing: Clear pricing tiers with key differentiators.
- FAQ: Answers to common questions.`,
  },
  {
    id: 'saas-ai-startup',
    category: 'SaaS · AI startup',
    compiled: `What it is: An AI scheduling tool that protects deep work time for remote engineering teams across timezones.

Tone: Minimal & confident. Restrained typography, short copy, lots of whitespace.

Color palette: art-director's choice. Derive a palette that best matches the brand, tone, audience, and any attached reference media.

Must include these sections (one per item):
- Features: The core product capabilities.
- Team: The people building the product.
- Testimonials: Social proof from customers.`,
  },
  {
    id: 'luxury-fashion',
    category: 'E-commerce · Luxury fashion',
    compiled: `Brand name: Oblique.

What it is: A minimalist fashion house selling hand-tailored black garments for people who care about cut and fall, not logos.

Tone: Luxurious. High-end, aspirational, understated prestige. Less is more.

Color palette: art-director's choice.`,
  },
  {
    id: 'creative-portfolio',
    category: 'Portfolio · Designer',
    compiled: `What it is: Personal portfolio for an independent brand designer who works with early-stage startups on identity and type systems.

Tone: Editorial & elegant. Fashion-magazine aesthetic. Serif headlines, considered pacing.

Color palette: art-director's choice.

Must include these sections:
- About: A concise story of the brand and its mission.
- Case studies: Real outcomes from real customers.
- Contact: How to get in touch.`,
  },
  {
    id: 'restaurant-fine-dining',
    category: 'Hospitality · Fine dining',
    compiled: `Brand name: Maison Thirteen.

What it is: A 14-seat tasting-menu restaurant in Brooklyn, ingredient-driven, natural wine focus, no reservations.

Tone: Luxurious.

Color palette: art-director's choice.`,
  },
  {
    id: 'nonprofit-climate',
    category: 'Non-profit · Climate',
    compiled: `Brand name: Verdant.

What it is: A climate non-profit restoring coastal wetlands across the Gulf Coast through community-led land trusts.

Tone: Editorial & elegant.

Color palette: art-director's choice. Use warm earth tones and greens.

Must include these sections:
- About: A concise story of the brand and its mission.
- Team: The people building the product.
- Contact: How to get in touch.`,
  },
  {
    id: 'product-waitlist',
    category: 'Launch · Product waitlist',
    compiled: `What it is: Pre-launch waitlist for a privacy-first habit tracker that runs entirely on-device with no cloud sync, no accounts.

Tone: Minimal & confident.

Color palette: user-locked. Use these EXACT hex values in the scene palette and throughout the visual prompt: background #0a0a0a, foreground #f5f5f5, accent #ff5f1f. The cinematic keyframe must read as this palette.`,
  },
  {
    id: 'agency-studio',
    category: 'Agency · Creative studio',
    compiled: `Brand name: Void Work.

What it is: A 6-person brand studio in Lisbon building identities and websites for technical founders.

Tone: Bold & loud. Confident, opinionated, declarative. Strong stance, short statements.

Color palette: art-director's choice.

Must include these sections:
- Case studies: Real outcomes from real customers.
- Team: The people building the product.
- Contact: How to get in touch.`,
  },
  {
    id: 'editorial-publication',
    category: 'Media · Editorial',
    compiled: `Brand name: Slow.

What it is: A longform quarterly magazine about craftsmanship, repair culture, and the value of things that last.

Tone: Editorial & elegant.

Color palette: art-director's choice.`,
  },
  {
    id: 'productivity-note',
    category: 'SaaS · Note-taking',
    compiled: `What it is: A keyboard-first note app for writers that syncs markdown files directly to a local folder, no database, no lock-in.

Tone: Technical & precise.

Color palette: art-director's choice.

Must include these sections:
- Features: The core product capabilities.
- Pricing: Clear pricing tiers with key differentiators.
- FAQ: Answers to common questions.`,
  },
  {
    id: 'personal-brand-coach',
    category: 'Personal brand · Coach',
    compiled: `Brand name: Mira Okoye.

What it is: Executive coach for first-time founders navigating their series A. 12-week cohorts, small groups, no DMs.

Tone: Playful & warm. Friendly, approachable, a little cheeky.

Color palette: art-director's choice.

Must include these sections:
- About: A concise story of the brand and its mission.
- Testimonials: Social proof from customers.
- Contact: How to get in touch.`,
  },
  {
    id: 'hardware-product',
    category: 'Hardware · Consumer product',
    compiled: `Brand name: Halo.

What it is: A ceramic smart lamp that turns itself on at sunset, adjusts to your circadian rhythm, and hides a microphone-free ambient music speaker.

Tone: Minimal & confident.

Color palette: art-director's choice. Favor warm neutrals.

Must include these sections:
- Features: The core product capabilities.
- Pricing: Clear pricing tiers with key differentiators.
- Testimonials: Social proof from customers.`,
  },
];
