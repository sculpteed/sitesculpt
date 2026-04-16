// Curated list of optional section/page presets surfaced in the prompt form.
// When the user toggles any of these on, they're passed to composeSite so
// Claude explicitly writes a section for each.

export interface PagePreset {
  id: string; // slug used in URL + Claude instructions
  label: string; // UI chip text
  hint: string; // one-line intent passed to Claude
}

export const PAGE_PRESETS: PagePreset[] = [
  { id: 'about', label: 'About', hint: 'A concise story of the brand and its mission.' },
  { id: 'features', label: 'Features', hint: 'The core product capabilities.' },
  { id: 'pricing', label: 'Pricing', hint: 'Clear pricing tiers with key differentiators.' },
  { id: 'team', label: 'Team', hint: 'The people building the product.' },
  { id: 'testimonials', label: 'Testimonials', hint: 'Social proof from customers.' },
  { id: 'faq', label: 'FAQ', hint: 'Answers to common questions.' },
  { id: 'contact', label: 'Contact', hint: 'How to get in touch.' },
  { id: 'case-studies', label: 'Case studies', hint: 'Real outcomes from real customers.' },
];

