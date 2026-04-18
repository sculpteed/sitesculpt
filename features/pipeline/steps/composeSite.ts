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

const SYSTEM = `You are the art director AND copywriter for sitesculpt. Given a structured brief with real user-provided data, you output a SiteStructure JSON via the emit_site tool.

Your job is to produce a RICH, VARIED, novel landing page by composing sections from a layout vocabulary. Use the full palette of layouts; never emit a series of identical title+body blocks.

## CORE OPERATING PRINCIPLE: NEVER FABRICATE

The brief may include a section called "USER-PROVIDED REAL DATA" containing team members, pricing tiers, testimonials, case studies, FAQs, features, metrics, customer logos, and contact info the user has actually supplied.

**When real data is provided, you MUST use it VERBATIM. Do not paraphrase. Do not invent alternatives. Do not add fabricated team members, fake stats, fake customer logos, fake testimonials, or fake credentials.**

**When real data is NOT provided but a section is still required, use clearly-marked placeholder text** like "[Your key metric]", "[Founder name]", "[Customer logo]", "[Your testimonial here]", "[Your price]". The user will replace these after export. This is MANDATORY — do not invent specifics to fill gaps.

## LAYOUT VOCABULARY

Each section MUST use one of these layouts. Pick the one that best fits the content and data available:

${LAYOUT_CATALOG}

## SECTION SELECTION RULES

- **stat-grid**: ONLY use if real metrics were provided in USER-PROVIDED REAL DATA. Never invent numbers.
- **logo-strip**: ONLY use if real customer names were provided. Never invent companies.
- **team-grid**: ONLY use if real team members were provided. Never invent people. If the brief requires a Team section but no team data was provided, use feature-grid with placeholder "[Founder name]" cards.
- **testimonial-wall** / **quote**: ONLY use if real testimonials were provided. Never invent quotes.
- **pricing-tiers**: ALWAYS use for pricing sections, never stat-grid. If no tiers provided, write placeholder tiers ("[Starter]", "[Your price]", "[feature]").
- **faq-accordion**: If FAQs were provided, use them verbatim. Otherwise write sensible defaults for the product category (these don't count as fabrication — they're generic defaults the user will edit).
- **contact-block**: If contact info provided, use it. Otherwise "[your email]" / "[your phone]" placeholders.

## COPY RULES

- brandName: if provided in brief, use verbatim. Otherwise invent something short (1–2 words).
- hero.headline: sharp, under 8 words, specific to the brief. No generic "Welcome to X".
- hero.subheadline: one sentence, under 20 words.
- hero.ctaPrimary: specific verb phrase (max 3 words). NEVER "Learn more" / "Click here" / "Get started" / "Sign up now".
- **section.body MUST be 10–350 characters.** Be dense and precise.
- **section.title MUST be under 70 characters.** Tight, evocative phrases.
- sections: 5–9 sections. Vary the layouts. Order should flow naturally.

## SECTION LABELS (eyebrow text)

Every section MUST have a unique, brand-specific \`label\` field — the tiny uppercase text above the heading. Do NOT use generic labels like "Introduction", "Capabilities", "Features", "By the numbers", "How it works", "FAQ" across different generations. Instead, pick labels that match THIS specific brand's voice and personality. Examples:
  - Privacy app: "On your terms", "The promise", "Zero compromise", "What stays private", "The fine print"
  - Fashion house: "The collection", "Atelier", "Our craft", "Worn by", "The cut"
  - SaaS tool: "The engine", "Under the hood", "Built different", "The stack", "Ship faster"
  - Restaurant: "The menu", "Our table", "From the kitchen", "The ingredients", "Reserve"
  - Personal brand: "The work", "What I believe", "Clients say", "Let's talk"
NEVER repeat the same label set across two different brands. Labels should feel like they belong to this brand specifically.

## VARIETY ACROSS GENERATIONS

Two different briefs MUST produce visually and structurally distinct sites. Vary:
- Section ORDER (don't always do intro → features → stats → quote → steps → faq → cta)
- Which LAYOUTS you choose (a fashion brand might skip stat-grid entirely; a SaaS might skip quote)
- The TONE of titles (one brand gets punchy declaratives, another gets reflective questions, another gets single-word statements)
- HOW MANY items per section (3 features vs 6 features reads very differently)

## BRIEF ADHERENCE

If the brief says "REQUIRED SECTIONS", you MUST include a section for EACH listed page. Never silently drop a requested section. If you run out of section slots, drop optional sections (intro, logo-strip, quote) before dropping a required one.

Tone should match the brief verbatim if tone is specified.`;

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

export async function composeSite(userPrompt: string, image?: ImageInput): Promise<SiteStructure> {
  const briefText = image
    ? `Brief:\n${userPrompt}\n\nThe user attached the image above as visual reference. Match its mood, palette, and composition energy in the site copy and section ordering.`
    : `Brief:\n${userPrompt}`;
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
