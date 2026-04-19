import { claudeJson, type ImageInput } from '@/lib/providers/anthropic';
import type { SiteStructure, SiteSection } from '@/features/pipeline/types';
import { LAYOUT_LIST } from '@/features/studio/layouts';

// ─── Deterministic guardrails ────────────────────────────────────────────────
// the model's tool-use treats JSON schema string lengths as guidelines, not
// enforcement. We clamp every user-facing field after the API returns so
// downstream code and exports are always in range.

const LIMITS = {
  brandName: 40,
  heroHeadline: 80,
  heroSubheadline: 160,
  heroCta: 30,
  sectionTitle: 70,
  sectionBody: 350,
  sectionCta: 30,
  itemName: 80,
  itemDescription: 240,
  itemValue: 40,
  itemRole: 80,
  itemBio: 300,
  itemQuote: 280,
  itemFeature: 120,
} as const;

function trimToSentence(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  const window = t.slice(0, maxLen);
  const lastPeriod = Math.max(
    window.lastIndexOf('.'),
    window.lastIndexOf('!'),
    window.lastIndexOf('?'),
  );
  if (lastPeriod >= maxLen * 0.5) {
    return window.slice(0, lastPeriod + 1);
  }
  const lastSpace = window.lastIndexOf(' ');
  if (lastSpace >= maxLen * 0.5) {
    return `${window.slice(0, lastSpace)}…`;
  }
  return `${window}…`;
}

function clamp(s: string | undefined, n: number): string | undefined {
  if (s === undefined) return undefined;
  return s.length <= n ? s : s.slice(0, n);
}

function normalizeSection(s: SiteSection): SiteSection {
  return {
    layout: s.layout,
    title: (s.title ?? '').slice(0, LIMITS.sectionTitle),
    body: trimToSentence(s.body ?? '', LIMITS.sectionBody),
    cta: clamp(s.cta, LIMITS.sectionCta),
    items: s.items?.map((item) => ({
      name: (item.name ?? '').slice(0, LIMITS.itemName),
      description: clamp(item.description, LIMITS.itemDescription),
      value: clamp(item.value, LIMITS.itemValue),
      role: clamp(item.role, LIMITS.itemRole),
      bio: item.bio ? trimToSentence(item.bio, LIMITS.itemBio) : undefined,
      quote: clamp(item.quote, LIMITS.itemQuote),
      avatarUrl: item.avatarUrl,
      features: item.features?.map((f) => f.slice(0, LIMITS.itemFeature)).slice(0, 8),
      cta: clamp(item.cta, LIMITS.sectionCta),
      highlighted: item.highlighted,
    })),
  };
}

function normalizeSiteStructure(site: SiteStructure): SiteStructure {
  const sections = (site.sections ?? []).slice(0, 10).map(normalizeSection);
  return {
    brandName: (site.brandName ?? '').slice(0, LIMITS.brandName),
    hero: {
      headline: (site.hero?.headline ?? '').slice(0, LIMITS.heroHeadline),
      subheadline: (site.hero?.subheadline ?? '').slice(0, LIMITS.heroSubheadline),
      ctaPrimary: (site.hero?.ctaPrimary ?? '').slice(0, LIMITS.heroCta),
      ctaSecondary: clamp(site.hero?.ctaSecondary, LIMITS.heroCta),
    },
    sections,
  };
}

// ─── System prompt ──────────────────────────────────────────────────────────

const LAYOUT_CATALOG = LAYOUT_LIST.map(
  (l) => `  - ${l.id}: ${l.purpose}\n     FIELDS: ${l.sampleFields}`,
).join('\n');

const SYSTEM = `You are the art director AND copywriter for a premium site-generation studio. You are writing for someone who wants a site that looks like it came from a great agency, not a template generator. Every word earns its place. Every section feels considered.

Your output is a SiteStructure JSON via the emit_site tool.

## WHAT "GOOD" LOOKS LIKE

Good output reads like editorial magazine writing or the copy on a high-end brand site — confident, specific, rhythmic, never filler. Bad output reads like generic SaaS marketing — vague adjectives, "empower", "leverage", "unlock", stacked buzzwords, hedged claims.

Before writing, fix a voice in your head for THIS brand. Then write every string in that voice. A fashion house doesn't say "unlock your style"; it says "the cut, the cloth, the season". A consultancy doesn't say "drive transformation"; it says "we work with four clients at a time. That is the point." A hardware product doesn't list features; it names them.

Aim for copy that feels:
- **Specific over general**: names, numbers, verbs, textures — not adjectives
- **Confident over hedged**: "we do X" not "we strive to do X" or "helping you X"
- **Short over long**: hero.headline under 8 words; section.title under 6 words when possible
- **Rhythmic**: vary sentence length, use fragments where they land, let one-word eyebrow labels breathe
- **Opinionated**: the brand has a point of view. Write from it.

## LAYOUT VOCABULARY

Each section MUST use one of these layouts. Choose the layout that best serves the message, not a default order:

${LAYOUT_CATALOG}

## SECTION ORDER & VARIETY

Two different briefs MUST produce structurally distinct sites. DO NOT default to intro → features → stats → quote → steps → faq → cta. Instead:
- A fashion house might open with split-image → quote → feature-grid (the collection) → contact-block, skipping stats entirely
- A SaaS tool might open with feature-grid → numbered-steps → pricing-tiers → faq, skipping quotes
- A personal portfolio might be quote → split-image (selected work) → team-grid (just the founder) → contact-block

Vary:
- Which LAYOUTS you include (skip ones that don't belong)
- The ORDER (the second section doesn't have to be "features")
- The NUMBER of items per section (3 features vs 6 reads differently)
- The TONE of titles (declaratives vs questions vs single words)

Ship 5–9 sections. Fewer, sharper is better than longer, padded.

## COPY SPECIFICS

- **brandName**: use the user's name if given; otherwise invent something short (1–2 words) that fits the voice
- **hero.headline**: under 8 words, specific to this brand. NEVER "Welcome to X", "The X platform", "Your X, simplified"
- **hero.subheadline**: one sentence under 20 words. Names what you do AND for whom
- **hero.ctaPrimary**: specific verb phrase (max 3 words). NEVER "Learn more", "Click here", "Get started", "Sign up now". Use verbs that fit the brand: "Book a table", "See the collection", "Read the prospectus", "Join the waitlist", "Start sculpting"
- **section.title**: 2–6 words, evocative, not descriptive ("The cut" not "Our process for cutting")
- **section.body**: 60–280 characters of dense prose. Specifics, not adjectives. Every sentence earns its line
- **section labels (eyebrow text)**: tiny uppercase text above the heading. UNIQUE per section, BRAND-specific, never generic. Examples per voice:
  - Privacy app: "On your terms", "The promise", "Zero compromise", "What stays private"
  - Fashion house: "The collection", "Atelier", "Our craft", "Worn by", "The cut"
  - SaaS tool: "The engine", "Under the hood", "Built different", "The stack"
  - Restaurant: "The menu", "Our table", "From the kitchen", "Reserve"
  - Portfolio: "The work", "What I believe", "Clients say", "Let's talk"
  Never reuse the same label set across two different brands.

## TRUTHFULNESS (safety rail)

This studio never fabricates third-party specifics. The brief may include a section called "USER-PROVIDED REAL DATA" — team members, pricing, testimonials, case studies, FAQs, metrics, logos, contacts the user supplied.

- **Real data provided**: use it VERBATIM. Do not paraphrase, do not add fake alternatives
- **Real data NOT provided**: use clearly-bracketed placeholders ("[Your key metric]", "[Founder name]", "[Your testimonial here]", "[Your price]") — never invent specific numbers, real people, or quotes that don't exist

Layout-specific rules:
- **stat-grid**: ONLY if real metrics were provided. Otherwise pick another layout — don't invent numbers
- **logo-strip**: ONLY if real customer names were provided
- **team-grid**: ONLY if real team members were provided. Otherwise use feature-grid with "[Founder name]" placeholders
- **testimonial-wall** / **quote**: ONLY if real testimonials were provided
- **pricing-tiers**: use for any pricing section. If no tiers provided, write placeholder tiers ("[Starter] / [Your price] / [feature]")
- **faq-accordion**: if FAQs provided, use verbatim. Otherwise write 4–6 sensible defaults for the product category (these aren't fabrication — they're starter content the user edits)
- **contact-block**: real contact info if provided, else "[your email]" / "[your phone]" placeholders

## BRIEF ADHERENCE

If the brief says "REQUIRED SECTIONS", include one section for EACH listed page. If you run out of section slots, drop optional sections (intro, logo-strip, quote) before dropping required ones.

Tone should match the brief if specified; otherwise infer the voice from the brand, audience, and category.`;

// ─── Required sections parser ───────────────────────────────────────────────
// Parses the "REQUIRED SECTIONS" block from the compiled brief so we can
// verify adherence post-generation.

function parseRequiredPages(brief: string): string[] {
  const match = brief.match(/REQUIRED SECTIONS[^\n]*\n((?:- .*\n?)+)/);
  if (!match) return [];
  return (match[1] ?? '')
    .split('\n')
    .map((line) => line.match(/^- ([^:]+):/)?.[1]?.trim())
    .filter((x): x is string => Boolean(x));
}

// Map page preset labels to layout ids that fit them. A section "fits" a
// requested page if its title/body/layout plausibly covers the intent.
function sectionCoversPage(section: SiteSection, pageLabel: string): boolean {
  const titleLower = section.title.toLowerCase();
  const bodyLower = section.body.toLowerCase();
  const page = pageLabel.toLowerCase();

  const keywords: Record<string, string[]> = {
    about: ['about', 'story', 'mission', 'founded', 'built'],
    features: ['feature', 'capabilit', 'what we', 'what it does', 'product'],
    pricing: ['pricing', 'plans', 'tiers', 'cost', 'price'],
    team: ['team', 'people', 'founders'],
    testimonials: ['testimonial', 'customer', 'loved', 'what people', 'what they say'],
    faq: ['faq', 'frequently', 'questions', 'common'],
    contact: ['contact', 'reach', 'get in touch', 'email us'],
    'case studies': ['case stud', 'client work', 'outcomes', 'results'],
  };
  const needles = keywords[page] ?? [page];

  // Layout-based match: specific layouts strongly imply specific pages
  const layoutMatches: Record<string, string[]> = {
    pricing: ['pricing-tiers'],
    team: ['team-grid'],
    testimonials: ['testimonial-wall', 'quote'],
    faq: ['faq-accordion'],
    contact: ['contact-block'],
  };
  if (layoutMatches[page]?.includes(section.layout)) return true;

  return needles.some((n) => titleLower.includes(n) || bodyLower.includes(n));
}

function checkBriefAdherence(
  site: SiteStructure,
  required: string[],
): { missing: string[] } {
  const missing: string[] = [];
  for (const page of required) {
    const covered = site.sections.some((s) => sectionCoversPage(s, page));
    if (!covered) missing.push(page);
  }
  return { missing };
}

// ─── Main export ────────────────────────────────────────────────────────────

export async function composeSite(
  userPrompt: string,
  image?: ImageInput,
  repairHint?: string,
): Promise<SiteStructure> {
  const imageNote = image
    ? '\n\nThe user attached the image above as visual reference. Match its mood, palette, and composition energy in the site copy and section ordering.'
    : '';
  const repairNote = repairHint
    ? `\n\n---\nThe previous attempt failed these quality checks. Fix them in this output:\n${repairHint}`
    : '';
  const briefText = `Brief:\n${userPrompt}${imageNote}${repairNote}`;
  const raw = await claudeJson<SiteStructure>({
    system: SYSTEM,
    user: briefText,
    image,
    // the model adaptive thinking — deeper reasoning on complex briefs,
    // negligible latency on simple ones
    thinking: true,
    toolName: 'emit_site',
    toolDescription:
      'Emit the SiteStructure JSON — brand, hero, and varied sections with explicit layouts',
    schema: {
      type: 'object',
      required: ['brandName', 'hero', 'sections'],
      properties: {
        brandName: { type: 'string', minLength: 1, maxLength: 40 },
        hero: {
          type: 'object',
          required: ['headline', 'subheadline', 'ctaPrimary'],
          properties: {
            headline: { type: 'string', minLength: 3, maxLength: 80 },
            subheadline: { type: 'string', minLength: 10, maxLength: 160 },
            ctaPrimary: { type: 'string', minLength: 2, maxLength: 30 },
            ctaSecondary: { type: 'string', maxLength: 30 },
          },
        },
        sections: {
          type: 'array',
          minItems: 5,
          maxItems: 10,
          items: {
            type: 'object',
            required: ['layout', 'title', 'body'],
            properties: {
              label: {
                type: 'string',
                maxLength: 30,
                description: 'Short eyebrow label above the heading (e.g. "What we built", "The toolkit", "Our approach"). MUST be unique per section and match the brand voice — never reuse generic labels across generations.',
              },
              layout: {
                type: 'string',
                enum: [
                  'intro',
                  'feature-grid',
                  'split-image',
                  'stat-grid',
                  'quote',
                  'numbered-steps',
                  'faq-accordion',
                  'logo-strip',
                  'pricing-tiers',
                  'team-grid',
                  'testimonial-wall',
                  'contact-block',
                  'cta',
                ],
              },
              title: { type: 'string', minLength: 2, maxLength: 70 },
              body: { type: 'string', minLength: 10, maxLength: 350 },
              cta: { type: 'string', maxLength: 30 },
              items: {
                type: 'array',
                maxItems: 8,
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', maxLength: 80 },
                    description: { type: 'string', maxLength: 240 },
                    value: { type: 'string', maxLength: 40 },
                    role: { type: 'string', maxLength: 80 },
                    bio: { type: 'string', maxLength: 300 },
                    quote: { type: 'string', maxLength: 280 },
                    avatarUrl: { type: 'string' },
                    features: {
                      type: 'array',
                      items: { type: 'string', maxLength: 120 },
                      maxItems: 8,
                    },
                    cta: { type: 'string', maxLength: 30 },
                    highlighted: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const normalized = normalizeSiteStructure(raw);

  // Brief adherence repair — if a required page is missing, log it so the
  // quality harness catches it. (Actual retry logic lives in Wave 3.)
  const required = parseRequiredPages(userPrompt);
  if (required.length > 0) {
    const { missing } = checkBriefAdherence(normalized, required);
    if (missing.length > 0) {
      console.warn(
        `[composeSite] brief adherence warning — missing requested sections: ${missing.join(', ')}`,
      );
    }
  }

  return normalized;
}
