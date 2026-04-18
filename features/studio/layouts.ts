// Layout vocabulary — the art-director's kit. Each layout is a distinct
// visual pattern that the export template renders as its own component.
// composeSite picks a layout per section based on the content, so the
// exported site has real visual variety instead of N identical title/body
// blocks.

export type LayoutType =
  | 'intro'
  | 'feature-grid'
  | 'split-image'
  | 'stat-grid'
  | 'quote'
  | 'numbered-steps'
  | 'faq-accordion'
  | 'logo-strip'
  | 'pricing-tiers'
  | 'team-grid'
  | 'testimonial-wall'
  | 'contact-block'
  | 'cta';

export interface LayoutMeta {
  id: LayoutType;
  label: string;
  purpose: string; // explanation given to the model so it picks the right layout
  sampleFields: string; // fields the model should populate for this layout
}

export const LAYOUTS: Record<LayoutType, LayoutMeta> = {
  intro: {
    id: 'intro',
    label: 'Editorial intro',
    purpose:
      'A long-form editorial statement that sets up the brand mission. Text-heavy, serif, centered.',
    sampleFields: 'title (short), body (3–5 sentences).',
  },
  'feature-grid': {
    id: 'feature-grid',
    label: 'Feature grid',
    purpose:
      'A grid of 3–6 discrete product capabilities. Each item has a name + short description.',
    sampleFields: 'title, body, items (array of { name, description }).',
  },
  'split-image': {
    id: 'split-image',
    label: 'Split image + text',
    purpose: 'A major single point, given space to breathe with an accompanying visual.',
    sampleFields: 'title, body (2–3 sentences), cta (optional).',
  },
  'stat-grid': {
    id: 'stat-grid',
    label: 'Stat grid',
    purpose:
      'Big impressive numbers that prove traction. 3–4 stats across. ONLY use when the user has provided real stats in the brief — NEVER fabricate numbers.',
    sampleFields:
      'title, body (intro), items (array of { value, name (label) }) with 3–4 entries. value MUST come from user-provided data.',
  },
  quote: {
    id: 'quote',
    label: 'Pull quote',
    purpose:
      'A single oversized testimonial or manifesto quote. One line, powerful. Use the user-provided testimonial if present; otherwise a placeholder.',
    sampleFields: 'body (the quote itself, under 140 chars), items[0] = { name, description (role) } for attribution.',
  },
  'numbered-steps': {
    id: 'numbered-steps',
    label: 'Numbered steps',
    purpose: 'How it works, a process, or a timeline. 3–5 numbered items.',
    sampleFields: 'title, body (intro), items (array of { name, description }) with 3–5 entries.',
  },
  'faq-accordion': {
    id: 'faq-accordion',
    label: 'FAQ',
    purpose:
      'Answers to common questions. 4–6 Q&A pairs. Use user-provided FAQs if present; otherwise write sensible defaults for the product category.',
    sampleFields:
      'title, body (short intro), items (array of { name (question), description (answer) }).',
  },
  'logo-strip': {
    id: 'logo-strip',
    label: 'Logo strip',
    purpose:
      'Social proof bar with 5–8 company names. ONLY use when the user has provided real customer names in the brief — NEVER invent company names.',
    sampleFields: 'title, body, items (array of { name } only).',
  },
  'pricing-tiers': {
    id: 'pricing-tiers',
    label: 'Pricing tiers',
    purpose:
      'Dedicated pricing comparison: 2–4 tier cards side-by-side. Each tier has name, price, period, feature list, and CTA. Use the user-provided tiers if supplied; otherwise write 2–3 placeholder tiers with "[Your price]" markers.',
    sampleFields:
      'title, body, items (array of { name (tier name), value (price string like "$19/mo"), description (tagline), features (string[]), cta (button label), highlighted (bool for recommended) }).',
  },
  'team-grid': {
    id: 'team-grid',
    label: 'Team grid',
    purpose:
      'Grid of team members with name, role, and short bio. ONLY use when the user has provided real team members — NEVER invent people, credentials, or titles.',
    sampleFields:
      'title, body (team intro), items (array of { name, role (as description), bio, avatarUrl }).',
  },
  'testimonial-wall': {
    id: 'testimonial-wall',
    label: 'Testimonial wall',
    purpose:
      'Grid of 2–4 customer quotes with attribution. ONLY use when the user has provided real testimonials — NEVER fabricate quotes or customer names.',
    sampleFields:
      'title, body, items (array of { quote, name, description (role / company), avatarUrl }).',
  },
  'contact-block': {
    id: 'contact-block',
    label: 'Contact block',
    purpose:
      'A simple contact section with email, optional address, optional phone. Uses the user-provided contact info if present; otherwise placeholder text.',
    sampleFields:
      'title, body (short intro), items (array of { name (label like "Email"), value (the actual email / phone / address) }).',
  },
  cta: {
    id: 'cta',
    label: 'Call to action',
    purpose: 'A bold closing block that asks for the action. Single headline + button.',
    sampleFields: 'title, body (1 sentence), cta (button label).',
  },
};

export const LAYOUT_LIST: LayoutMeta[] = Object.values(LAYOUTS);
