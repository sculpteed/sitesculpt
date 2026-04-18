// Section dispatcher — renders block-library-quality layouts using shadcn/ui
// primitives + real Tailwind classes. Design tokens resolve via CSS custom
// properties set on the <PreviewSite> wrapper from the scene palette.
//
// Unlike the previous hand-coded inline-style version, this uses:
// - Button, Card, Badge, Accordion primitives from @/components/ui
// - Tailwind utility classes that map to shadcn design tokens
//   (bg-background, text-foreground, bg-primary, text-muted-foreground, etc.)
// - Proper typography hierarchy with font-serif / font-sans / font-mono
// - Generous whitespace, asymmetric grids, editorial rhythm
//
// The exported Next.js project gets a synced copy of this file so the
// downloaded zip matches the preview.

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Check } from 'lucide-react';
import { CountUp, HoverLift, Marquee, Reveal, Stagger, StaggerItem } from './motion';

export type SectionLayout =
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

export interface SectionItem {
  name: string;
  description?: string;
  value?: string;
  role?: string;
  bio?: string;
  quote?: string;
  avatarUrl?: string;
  features?: string[];
  cta?: string;
  highlighted?: boolean;
}

export interface SectionProps {
  layout: SectionLayout;
  /** Brand-specific eyebrow label from the model. Falls back to layout default. */
  label?: string;
  title: string;
  body: string;
  cta?: string;
  items?: SectionItem[];
}

// ─── Shared helpers ─────────────────────────────────────────────────────────

/** Italicize the last sentence of a headline for mixed-weight feel. */
function italicizeLast(headline: string): React.ReactNode {
  const parts = headline.split(/(?<=\.)\s/);
  if (parts.length >= 2) {
    const last = parts[parts.length - 1] ?? '';
    const rest = parts.slice(0, -1).join(' ');
    return (
      <>
        {rest}{' '}
        <em className="italic opacity-95">{last}</em>
      </>
    );
  }
  return headline;
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
      <span className="inline-block h-px w-8 bg-border" />
      {children}
    </div>
  );
}

/** Fallback eyebrow labels per layout — only used if the model  provide one. */
const DEFAULT_LABELS: Partial<Record<SectionLayout, string>> = {
  intro: 'Introduction',
  'feature-grid': 'Capabilities',
  'split-image': 'In depth',
  'stat-grid': 'By the numbers',
  quote: 'In their words',
  'numbered-steps': 'How it works',
  'faq-accordion': 'Questions',
  'logo-strip': 'Trusted by',
  'pricing-tiers': 'Pricing',
  'team-grid': 'The team',
  'testimonial-wall': 'What they say',
  'contact-block': 'Get in touch',
  cta: 'Get started',
};

function getLabel(props: SectionProps): string {
  return props.label ?? DEFAULT_LABELS[props.layout] ?? '';
}

function DisplayHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-4xl leading-[0.95] tracking-[-0.025em] text-foreground sm:text-5xl md:text-6xl">
      {children}
    </h2>
  );
}

function Lede({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
      {children}
    </p>
  );
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────

export function Section(props: SectionProps) {
  // Resolve the eyebrow label — the model  brand-specific labels,
  // fallback to layout defaults if not present.
  const resolved = {
    ...props,
    label: props.label ?? DEFAULT_LABELS[props.layout] ?? '',
  };
  switch (resolved.layout) {
    case 'intro':
      return <IntroLayout {...resolved} />;
    case 'feature-grid':
      return <FeatureGridLayout {...resolved} />;
    case 'split-image':
      return <SplitImageLayout {...resolved} />;
    case 'stat-grid':
      return <StatGridLayout {...resolved} />;
    case 'quote':
      return <QuoteLayout {...resolved} />;
    case 'numbered-steps':
      return <NumberedStepsLayout {...resolved} />;
    case 'faq-accordion':
      return <FaqLayout {...resolved} />;
    case 'logo-strip':
      return <LogoStripLayout {...resolved} />;
    case 'pricing-tiers':
      return <PricingTiersLayout {...resolved} />;
    case 'team-grid':
      return <TeamGridLayout {...resolved} />;
    case 'testimonial-wall':
      return <TestimonialWallLayout {...resolved} />;
    case 'contact-block':
      return <ContactBlockLayout {...resolved} />;
    case 'cta':
      return <CtaLayout {...resolved} />;
    default:
      return <IntroLayout {...resolved} />;
  }
}

// ─── Layouts ────────────────────────────────────────────────────────────────

function IntroLayout({ label, title, body }: SectionProps) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 md:py-36">
      <Reveal>
        <SectionEyebrow>{label}</SectionEyebrow>
        <h2 className="font-serif text-4xl leading-[0.92] tracking-[-0.025em] text-foreground sm:text-6xl md:text-7xl">
          {italicizeLast(title)}
        </h2>
      </Reveal>
      <Reveal delay={0.15}>
        <p className="mt-10 max-w-2xl font-serif text-xl italic leading-[1.5] text-foreground/80 md:text-2xl">
          {body}
        </p>
      </Reveal>
    </section>
  );
}

function FeatureGridLayout({ label, title, body, items = [] }: SectionProps) {
  // Bento-style: first item spans the full width as a "hero feature",
  // remaining items in a 2- or 3-col grid. Creates visual asymmetry.
  const heroFeature = items[0];
  const restFeatures = items.slice(1);
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Reveal>
        <SectionEyebrow>{label}</SectionEyebrow>
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-end">
          <DisplayHeading>{italicizeLast(title)}</DisplayHeading>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">{body}</p>
        </div>
      </Reveal>
      <Separator className="mt-16 mb-12 bg-border" />
      {heroFeature ? (
        <Reveal>
          <HoverLift className="group mb-12 rounded-2xl border border-border bg-card/30 px-8 py-10 transition-colors hover:border-primary/30">
            <div className="grid gap-6 md:grid-cols-[auto_1fr]">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                01
              </div>
              <div>
                <div className="font-serif text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
                  {heroFeature.name}
                </div>
                {heroFeature.description ? (
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                    {heroFeature.description}
                  </p>
                ) : null}
              </div>
            </div>
          </HoverLift>
        </Reveal>
      ) : null}
      <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {restFeatures.map((item, i) => (
          <StaggerItem key={i}>
            <HoverLift className="group h-full rounded-xl border border-border bg-card/20 p-6 transition-colors hover:border-primary/30">
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                {String(i + 2).padStart(2, '0')}
              </div>
              <div className="font-serif text-xl leading-tight tracking-tight text-foreground">
                {item.name}
              </div>
              {item.description ? (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </HoverLift>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function SplitImageLayout({ label, title, body, cta }: SectionProps) {
  // Typography-first editorial pull statement — no placeholder image box.
  return (
    <section className="mx-auto max-w-6xl px-6 py-32 md:py-40">
      <div className="grid gap-12 md:grid-cols-[1.4fr_1fr] md:items-start">
        <Reveal>
          <SectionEyebrow>{label}</SectionEyebrow>
          <h2 className="font-serif text-5xl leading-[0.92] tracking-[-0.025em] text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
            {italicizeLast(title)}
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="md:pt-8">
            <p className="text-[17px] leading-[1.65] text-muted-foreground">{body}</p>
            {cta ? (
              <Button variant="link" className="mt-8 h-auto px-0 text-foreground transition-transform hover:translate-x-1">
                {cta}
                <ArrowRight className="size-4 text-primary" />
              </Button>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function StatGridLayout({ label, title, body, items = [] }: SectionProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Reveal>
        <SectionEyebrow>{label}</SectionEyebrow>
        <DisplayHeading>{italicizeLast(title)}</DisplayHeading>
        <Lede>{body}</Lede>
      </Reveal>
      <Separator className="mt-14 mb-14 bg-border" />
      <Stagger className="grid gap-12 sm:grid-cols-2 md:grid-cols-4" stagger={0.12}>
        {items.slice(0, 4).map((item, i) => (
          <StaggerItem key={i}>
            <div className="font-serif text-5xl leading-none tracking-tighter text-primary md:text-6xl">
              <CountUp value={item.value ?? item.name} />
            </div>
            <div className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {item.description ?? item.name}
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function QuoteLayout({ body, items = [] }: SectionProps) {
  const attribution = items[0];
  return (
    <section className="mx-auto max-w-3xl px-6 py-28 md:py-40">
      <Reveal>
        <div className="font-serif text-6xl leading-none text-primary">&ldquo;</div>
        <blockquote className="mt-4 font-serif text-3xl leading-[1.2] tracking-tight text-foreground md:text-5xl">
          <em className="italic">{body}</em>
        </blockquote>
        {attribution ? (
          <footer className="mt-12 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="inline-block h-px w-8 bg-border" />
            <span>
              {attribution.name}
              {attribution.description ? ` · ${attribution.description}` : null}
            </span>
          </footer>
        ) : null}
      </Reveal>
    </section>
  );
}

function NumberedStepsLayout({ label, title, body, items = [] }: SectionProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Reveal>
        <SectionEyebrow>{label}</SectionEyebrow>
        <DisplayHeading>{italicizeLast(title)}</DisplayHeading>
        <Lede>{body}</Lede>
      </Reveal>
      <Stagger className="mt-14 border-t border-border" stagger={0.1}>
        {items.map((item, i) => (
          <StaggerItem key={i}>
            <div className="grid gap-8 border-b border-border py-8 md:grid-cols-[4rem_minmax(0,16rem)_1fr]">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-serif text-2xl leading-tight tracking-tight text-foreground">
                {item.name}
              </span>
              {item.description ? (
                <span className="text-[15px] leading-relaxed text-muted-foreground">
                  {item.description}
                </span>
              ) : null}
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function FaqLayout({ label, title, body, items = [] }: SectionProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <SectionEyebrow>{label}</SectionEyebrow>
          <DisplayHeading>{italicizeLast(title)}</DisplayHeading>
          {body ? (
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
              {body}
            </p>
          ) : null}
        </Reveal>
        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="w-full">
            {items.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="font-serif text-xl leading-snug tracking-tight text-foreground hover:no-underline [&[data-state=open]>svg]:text-primary">
                  {item.name}
                </AccordionTrigger>
                {item.description ? (
                  <AccordionContent className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                    {item.description}
                  </AccordionContent>
                ) : null}
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

function LogoStripLayout({ title, items = [] }: SectionProps) {
  return (
    <section className="border-y border-border py-16">
      <div className="mx-auto max-w-6xl">
        {title ? (
          <Reveal>
            <div className="mb-10 px-6 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              {title}
            </div>
          </Reveal>
        ) : null}
        <Marquee speed={38}>
          {items.map((item, i) => (
            <div
              key={i}
              className="font-serif text-2xl italic leading-none tracking-tight text-foreground/50"
            >
              {item.name}
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

function PricingTiersLayout({ label, title, body, items = [] }: SectionProps) {
  const gridCols =
    items.length === 1
      ? 'md:grid-cols-1'
      : items.length === 2
        ? 'md:grid-cols-2'
        : 'md:grid-cols-3';
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow>
            <span className="mx-auto">{label}</span>
          </SectionEyebrow>
          <DisplayHeading>{italicizeLast(title)}</DisplayHeading>
          {body ? (
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">{body}</p>
          ) : null}
        </div>
      </Reveal>
      <Stagger
        className={`mt-16 grid gap-5 ${gridCols}`}
        stagger={0.1}
        amount={0.1}
      >
        {items.map((tier, i) => {
          const highlighted = tier.highlighted;
          return (
            <StaggerItem key={i}>
              <HoverLift
                scale={1.01}
                className={
                  highlighted
                    ? 'relative flex h-full flex-col rounded-2xl border border-primary bg-primary/[0.05] p-8'
                    : 'relative flex h-full flex-col rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/40'
                }
              >
                {highlighted ? (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-primary-foreground">
                    Recommended
                  </Badge>
                ) : null}
                <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {tier.name}
                </div>
                <div className="mb-2 font-serif text-5xl leading-none tracking-tight text-foreground">
                  {tier.value ?? '—'}
                </div>
                {tier.description ? (
                  <p className="mb-7 text-sm leading-relaxed text-muted-foreground">
                    {tier.description}
                  </p>
                ) : (
                  <div className="mb-7" />
                )}
                {tier.features && tier.features.length > 0 ? (
                  <ul className="mb-8 flex-1 space-y-3">
                    {tier.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm text-foreground/85">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <Button
                  variant={highlighted ? 'default' : 'outline'}
                  className={highlighted ? '' : 'border-border text-foreground'}
                >
                  {tier.cta ?? `Choose ${tier.name}`}
                </Button>
              </HoverLift>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}

function TeamGridLayout({ label, title, body, items = [] }: SectionProps) {
  // Typography-first team cards with staggered fade-in + subtle hover lift.
  // Real photos when provided; otherwise oversized serif initials as the
  // identity mark.
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Reveal>
        <SectionEyebrow>{label}</SectionEyebrow>
        <DisplayHeading>{italicizeLast(title)}</DisplayHeading>
        <Lede>{body}</Lede>
        <Separator className="mt-14 mb-14 bg-border" />
      </Reveal>
      <Stagger className="grid gap-x-12 gap-y-16 sm:grid-cols-2 md:grid-cols-3" stagger={0.1}>
        {items.map((person, i) => {
          const initial = (person.name ?? '?').trim().charAt(0).toUpperCase();
          return (
            <StaggerItem key={i}>
              <HoverLift scale={1.02} className="flex flex-col">
                {person.avatarUrl ? (
                  <div
                    className="mb-6 aspect-[4/5] w-full rounded-lg border border-border bg-cover bg-center"
                    style={{ backgroundImage: `url(${person.avatarUrl})` }}
                  />
                ) : (
                  <div className="mb-6 flex h-24 items-center">
                    <div
                      aria-hidden="true"
                      className="font-serif text-[7rem] leading-none tracking-[-0.04em] text-primary"
                    >
                      {initial}
                    </div>
                  </div>
                )}
                <div className="font-serif text-[1.75rem] leading-[1.1] tracking-[-0.01em] text-foreground">
                  {person.name}
                </div>
                {(person.role || person.description) && (
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                    {person.role ?? person.description}
                  </div>
                )}
                {person.bio ? (
                  <p className="mt-5 text-[14px] leading-[1.65] text-muted-foreground">
                    {person.bio}
                  </p>
                ) : null}
              </HoverLift>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}

function TestimonialWallLayout({ label, title, body, items = [] }: SectionProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Reveal>
        <SectionEyebrow>{label}</SectionEyebrow>
        <DisplayHeading>{italicizeLast(title)}</DisplayHeading>
        <Lede>{body}</Lede>
      </Reveal>
      <Stagger className="mt-12 grid gap-5 md:grid-cols-2" stagger={0.12}>
        {items.map((t, i) => (
          <StaggerItem key={i}>
            <HoverLift
              scale={1.015}
              className="flex h-full flex-col rounded-2xl border border-border bg-card/40 p-8 transition-colors hover:border-primary/30"
            >
              <div className="mb-3 font-serif text-4xl leading-none text-primary">&ldquo;</div>
              <blockquote className="mb-8 flex-1 font-serif text-xl italic leading-[1.4] tracking-tight text-foreground">
                {t.quote ?? t.name}
              </blockquote>
              <figcaption className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {t.quote ? t.name : ''}
                {(t.description || t.role) && ` · ${t.description ?? t.role}`}
              </figcaption>
            </HoverLift>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function ContactBlockLayout({ label, title, body, items = [] }: SectionProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="grid gap-16 md:grid-cols-2 md:items-end">
        <Reveal>
          <SectionEyebrow>{label}</SectionEyebrow>
          <DisplayHeading>{italicizeLast(title)}</DisplayHeading>
          {body ? (
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              {body}
            </p>
          ) : null}
        </Reveal>
        <Stagger stagger={0.08}>
          {items.map((item, i) => (
            <StaggerItem key={i}>
              <div className="grid grid-cols-[8rem_1fr] items-baseline gap-6 border-b border-border py-5 transition-colors hover:border-primary/40">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {item.name}
                </div>
                <div className="font-serif text-xl tracking-tight text-primary">
                  {item.value ?? item.description ?? '—'}
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function CtaLayout({ label, title, body, cta }: SectionProps) {
  // CTA sits on the accent-colored zone from PreviewSite's getZone().
  // Zone overrides --color-foreground to primary-foreground (dark) and
  // --color-background to primary (green). Button uses bg-foreground
  // text-background = dark button with green text. Clean contrast.
  return (
    <section className="mx-auto max-w-3xl px-6 py-28 text-center md:py-40">
      <Reveal>
        <SectionEyebrow>
          <span className="mx-auto">{label}</span>
        </SectionEyebrow>
        <h2 className="mx-auto max-w-xl font-serif text-5xl leading-[0.92] tracking-[-0.025em] text-foreground md:text-7xl">
          {italicizeLast(title)}
        </h2>
        <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-foreground/70">
          {body}
        </p>
      </Reveal>
      {cta ? (
        <Reveal delay={0.2}>
          <Button
            size="xl"
            className="mt-10 rounded-full bg-foreground px-8 text-background transition-transform hover:scale-105"
          >
            {cta}
            <ArrowRight className="size-4" />
          </Button>
        </Reveal>
      ) : null}
    </section>
  );
}
