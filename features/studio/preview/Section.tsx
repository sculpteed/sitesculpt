// Section dispatcher — shadcn/ui + Tailwind layouts. When `editable` is
// true, EditableText wraps each field and postMessages changes to Studio.

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Check } from 'lucide-react';
import { CountUp, HoverLift, Marquee, Reveal, Stagger, StaggerItem } from './motion';
import { EditableText } from './EditableText';
import type { SectionLayout, SectionItem, SiteSection } from '@/features/pipeline/types';

export type { SectionLayout, SectionItem };

export interface SectionProps extends SiteSection {
  editable?: boolean;
  sectionIndex?: number;
}

// ─── Shared helpers ─────────────────────────────────────────────────────────

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

function ELabel({ props }: { props: SectionProps }) {
  const label = getLabel(props);
  if (props.editable && props.sectionIndex !== undefined) {
    return (
      <SectionEyebrow>
        <EditableText
          value={label}
          path={`sections.${props.sectionIndex}.label`}
          editable
          tag="span"
        />
      </SectionEyebrow>
    );
  }
  return <SectionEyebrow>{label}</SectionEyebrow>;
}

function EHeading({ title, props }: { title: string; props: SectionProps }) {
  if (props.editable && props.sectionIndex !== undefined) {
    return (
      <EditableText
        value={title}
        path={`sections.${props.sectionIndex}.title`}
        editable
        tag="h2"
        className="font-serif text-4xl leading-[0.95] tracking-[-0.025em] text-foreground sm:text-5xl md:text-6xl"
      />
    );
  }
  return (
    <h2 className="font-serif text-4xl leading-[0.95] tracking-[-0.025em] text-foreground sm:text-5xl md:text-6xl">
      {italicizeLast(title)}
    </h2>
  );
}

function EBody({ body, props, className }: { body: string; props: SectionProps; className?: string }) {
  const cls = className ?? 'mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg';
  if (props.editable && props.sectionIndex !== undefined) {
    return (
      <EditableText
        value={body}
        path={`sections.${props.sectionIndex}.body`}
        editable
        tag="p"
        className={cls}
      />
    );
  }
  return <p className={cls}>{body}</p>;
}

function ECta({ cta, props }: { cta: string; props: SectionProps }) {
  if (props.editable && props.sectionIndex !== undefined) {
    return (
      <EditableText
        value={cta}
        path={`sections.${props.sectionIndex}.cta`}
        editable
        tag="span"
        className="inline-flex items-center gap-2 text-foreground"
      />
    );
  }
  return (
    <Button variant="link" className="mt-8 h-auto px-0 text-foreground transition-transform hover:translate-x-1">
      {cta}
      <ArrowRight className="size-4 text-primary" />
    </Button>
  );
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────

export function Section(props: SectionProps) {
  const resolved = {
    ...props,
    label: props.label ?? DEFAULT_LABELS[props.layout] ?? '',
  };
  switch (resolved.layout) {
    case 'intro': return <IntroLayout {...resolved} />;
    case 'feature-grid': return <FeatureGridLayout {...resolved} />;
    case 'split-image': return <SplitImageLayout {...resolved} />;
    case 'stat-grid': return <StatGridLayout {...resolved} />;
    case 'quote': return <QuoteLayout {...resolved} />;
    case 'numbered-steps': return <NumberedStepsLayout {...resolved} />;
    case 'faq-accordion': return <FaqLayout {...resolved} />;
    case 'logo-strip': return <LogoStripLayout {...resolved} />;
    case 'pricing-tiers': return <PricingTiersLayout {...resolved} />;
    case 'team-grid': return <TeamGridLayout {...resolved} />;
    case 'testimonial-wall': return <TestimonialWallLayout {...resolved} />;
    case 'contact-block': return <ContactBlockLayout {...resolved} />;
    case 'cta': return <CtaLayout {...resolved} />;
    default: return <IntroLayout {...resolved} />;
  }
}

// ─── Layouts ────────────────────────────────────────────────────────────────

function IntroLayout(props: SectionProps) {
  const { title, body } = props;
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 md:py-36">
      <Reveal>
        <ELabel props={props} />
        {props.editable ? (
          <EHeading title={title} props={props} />
        ) : (
          <h2 className="font-serif text-4xl leading-[0.92] tracking-[-0.025em] text-foreground sm:text-6xl md:text-7xl">
            {italicizeLast(title)}
          </h2>
        )}
      </Reveal>
      <Reveal delay={0.15}>
        <EBody
          body={body}
          props={props}
          className="mt-10 max-w-2xl font-serif text-xl italic leading-[1.5] text-foreground/80 md:text-2xl"
        />
      </Reveal>
    </section>
  );
}

function FeatureGridLayout(props: SectionProps) {
  if (props.variant === 'alt') return <FeatureGridAltLayout {...props} />;
  const { title, body, items = [] } = props;
  const heroFeature = items[0];
  const restFeatures = items.slice(1);
  return (
    <section className="mx-auto max-w-6xl px-6 py-[var(--sec-y-sm,6rem)] md:py-[var(--sec-y-md,8rem)]">
      <Reveal>
        <ELabel props={props} />
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-end">
          <EHeading title={title} props={props} />
          <EBody body={body} props={props} className="max-w-xl text-base leading-relaxed text-muted-foreground" />
        </div>
      </Reveal>
      <Separator className="mt-16 mb-12 bg-border" />
      {heroFeature ? (
        <Reveal>
          <HoverLift className="group mb-12 rounded-2xl border border-border bg-card/30 px-8 py-10 transition-colors hover:border-primary/30">
            <div className="grid gap-6 md:grid-cols-[auto_1fr]">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">01</div>
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
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              ) : null}
            </HoverLift>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function FeatureGridAltLayout(props: SectionProps) {
  // Alternating-side full-width rows. Each feature is its own editorial
  // row with a giant serif numeral on the alternating side and the
  // name+description filling the rest. Use this variant when there are
  // 3-5 narrative-rich features that deserve breathing room — bento
  // grid would crush them.
  const { title, body, items = [] } = props;
  return (
    <section className="mx-auto max-w-6xl px-6 py-[var(--sec-y-sm,6rem)] md:py-[var(--sec-y-md,8rem)]">
      <Reveal>
        <ELabel props={props} />
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-end">
          <EHeading title={title} props={props} />
          <EBody body={body} props={props} className="max-w-xl text-base leading-relaxed text-muted-foreground" />
        </div>
      </Reveal>
      <Separator className="mt-16 mb-16 bg-border" />
      <div className="space-y-16 md:space-y-24">
        {items.map((item, i) => {
          const isOdd = i % 2 === 1;
          return (
            <Reveal key={i} delay={i * 0.05}>
              <div
                className={`grid items-start gap-8 md:gap-16 md:grid-cols-[6rem_1fr] ${
                  isOdd ? 'md:grid-cols-[1fr_6rem]' : ''
                }`}
              >
                <div
                  className={`font-serif text-7xl leading-none tracking-tighter text-primary md:text-8xl lg:text-9xl ${
                    isOdd ? 'md:order-2 md:text-right' : ''
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className={isOdd ? 'md:order-1' : ''}>
                  <div className="mb-4 font-serif text-3xl leading-tight tracking-tight text-foreground md:text-4xl">
                    {item.name}
                  </div>
                  {item.description ? (
                    <p className="max-w-xl text-base leading-[1.65] text-muted-foreground md:text-[17px]">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function SplitImageLayout(props: SectionProps) {
  const { title, body, cta } = props;
  return (
    <section className="mx-auto max-w-6xl px-6 py-32 md:py-40">
      <div className="grid gap-12 md:grid-cols-[1.4fr_1fr] md:items-start">
        <Reveal>
          <ELabel props={props} />
          {props.editable ? (
            <EHeading title={title} props={props} />
          ) : (
            <h2 className="font-serif text-5xl leading-[0.92] tracking-[-0.025em] text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
              {italicizeLast(title)}
            </h2>
          )}
        </Reveal>
        <Reveal delay={0.2}>
          <div className="md:pt-8">
            <EBody body={body} props={props} className="text-[17px] leading-[1.65] text-muted-foreground" />
            {cta ? <ECta cta={cta} props={props} /> : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function StatGridLayout(props: SectionProps) {
  const { title, body, items = [] } = props;
  return (
    <section className="mx-auto max-w-6xl px-6 py-[var(--sec-y-sm,6rem)] md:py-[var(--sec-y-md,8rem)]">
      <Reveal>
        <ELabel props={props} />
        <EHeading title={title} props={props} />
        <EBody body={body} props={props} />
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

function QuoteLayout(props: SectionProps) {
  const { body, items = [] } = props;
  const attribution = items[0];
  return (
    <section className="mx-auto max-w-3xl px-6 py-28 md:py-40">
      <Reveal>
        <div className="font-serif text-6xl leading-none text-primary">&ldquo;</div>
        {props.editable && props.sectionIndex !== undefined ? (
          <EditableText
            value={body}
            path={`sections.${props.sectionIndex}.body`}
            editable
            tag="blockquote"
            className="mt-4 font-serif text-3xl leading-[1.2] tracking-tight text-foreground md:text-5xl"
          />
        ) : (
          <blockquote className="mt-4 font-serif text-3xl leading-[1.2] tracking-tight text-foreground md:text-5xl">
            <em className="italic">{body}</em>
          </blockquote>
        )}
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

function NumberedStepsLayout(props: SectionProps) {
  const { title, body, items = [] } = props;
  return (
    <section className="mx-auto max-w-6xl px-6 py-[var(--sec-y-sm,6rem)] md:py-[var(--sec-y-md,8rem)]">
      <Reveal>
        <ELabel props={props} />
        <EHeading title={title} props={props} />
        <EBody body={body} props={props} />
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
                <span className="text-[15px] leading-relaxed text-muted-foreground">{item.description}</span>
              ) : null}
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function FaqLayout(props: SectionProps) {
  const { title, body, items = [] } = props;
  return (
    <section className="mx-auto max-w-6xl px-6 py-[var(--sec-y-sm,6rem)] md:py-[var(--sec-y-md,8rem)]">
      <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <ELabel props={props} />
          <EHeading title={title} props={props} />
          {body ? <EBody body={body} props={props} className="mt-6 max-w-sm text-[15px] leading-relaxed text-muted-foreground" /> : null}
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

function LogoStripLayout(props: SectionProps) {
  if (props.variant === 'alt') return <LogoGridLayout {...props} />;
  const { title, items = [] } = props;
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
            <div key={i} className="font-serif text-2xl italic leading-none tracking-tight text-foreground/50">
              {item.name}
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

function LogoGridLayout(props: SectionProps) {
  // 4-column justified grid. Use when there are 4-12 named logos that
  // should read as a curated client list ("we've worked with these")
  // rather than a marquee of social proof ("we have many customers").
  const { title, items = [] } = props;
  const cols = items.length <= 4 ? 'sm:grid-cols-2 md:grid-cols-4' : 'sm:grid-cols-3 md:grid-cols-4';
  return (
    <section className="border-y border-border py-16">
      <div className="mx-auto max-w-6xl px-6">
        {title ? (
          <Reveal>
            <div className="mb-10 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              {title}
            </div>
          </Reveal>
        ) : null}
        <Stagger className={`grid gap-x-12 gap-y-10 ${cols}`} stagger={0.06}>
          {items.map((item, i) => (
            <StaggerItem key={i}>
              <div className="flex h-12 items-center justify-center font-serif text-xl italic leading-none tracking-tight text-foreground/55 transition-opacity hover:text-foreground/85">
                {item.name}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function PricingTiersLayout(props: SectionProps) {
  const { title, body, items = [] } = props;
  const gridCols =
    items.length === 1 ? 'md:grid-cols-1' :
    items.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';
  return (
    <section className="mx-auto max-w-6xl px-6 py-[var(--sec-y-sm,6rem)] md:py-[var(--sec-y-md,8rem)]">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow>
            <span className="mx-auto">{getLabel(props)}</span>
          </SectionEyebrow>
          <EHeading title={title} props={props} />
          {body ? <EBody body={body} props={props} className="mt-6 text-base leading-relaxed text-muted-foreground" /> : null}
        </div>
      </Reveal>
      <Stagger className={`mt-16 grid gap-5 ${gridCols}`} stagger={0.1} amount={0.1}>
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
                  <p className="mb-7 text-sm leading-relaxed text-muted-foreground">{tier.description}</p>
                ) : <div className="mb-7" />}
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

function TeamGridLayout(props: SectionProps) {
  const { title, body, items = [] } = props;
  return (
    <section className="mx-auto max-w-6xl px-6 py-[var(--sec-y-sm,6rem)] md:py-[var(--sec-y-md,8rem)]">
      <Reveal>
        <ELabel props={props} />
        <EHeading title={title} props={props} />
        <EBody body={body} props={props} />
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
                    <div aria-hidden="true" className="font-serif text-[7rem] leading-none tracking-[-0.04em] text-primary">
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
                  <p className="mt-5 text-[14px] leading-[1.65] text-muted-foreground">{person.bio}</p>
                ) : null}
              </HoverLift>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}

function TestimonialWallLayout(props: SectionProps) {
  if (props.variant === 'alt') return <TestimonialTallLayout {...props} />;
  const { title, body, items = [] } = props;
  return (
    <section className="mx-auto max-w-6xl px-6 py-[var(--sec-y-sm,6rem)] md:py-[var(--sec-y-md,8rem)]">
      <Reveal>
        <ELabel props={props} />
        <EHeading title={title} props={props} />
        <EBody body={body} props={props} />
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

function TestimonialTallLayout(props: SectionProps) {
  // 1-col stacked oversize pull-quotes. Use when there are 1-3 deep
  // case-study quotes that each deserve full editorial weight, instead
  // of being squeezed into a 2-col card grid.
  const { title, body, items = [] } = props;
  return (
    <section className="mx-auto max-w-4xl px-6 py-[var(--sec-y-sm,6rem)] md:py-[var(--sec-y-md,8rem)]">
      <Reveal>
        <ELabel props={props} />
        <EHeading title={title} props={props} />
        {body ? <EBody body={body} props={props} /> : null}
      </Reveal>
      <Stagger className="mt-16 space-y-20" stagger={0.15}>
        {items.slice(0, 3).map((t, i) => (
          <StaggerItem key={i}>
            <figure className="border-l-2 border-primary pl-8 md:pl-12">
              <div className="mb-4 font-serif text-5xl leading-none text-primary">&ldquo;</div>
              <blockquote className="font-serif text-2xl italic leading-[1.35] tracking-[-0.01em] text-foreground md:text-3xl lg:text-4xl">
                {t.quote ?? t.name}
              </blockquote>
              <figcaption className="mt-8 flex items-baseline gap-3">
                <span className="font-serif text-xl tracking-tight text-foreground">
                  {t.quote ? t.name : ''}
                </span>
                {(t.description || t.role) ? (
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {t.description ?? t.role}
                  </span>
                ) : null}
              </figcaption>
            </figure>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function ContactBlockLayout(props: SectionProps) {
  const { title, body, items = [] } = props;
  return (
    <section className="mx-auto max-w-6xl px-6 py-[var(--sec-y-sm,6rem)] md:py-[var(--sec-y-md,8rem)]">
      <div className="grid gap-16 md:grid-cols-2 md:items-end">
        <Reveal>
          <ELabel props={props} />
          <EHeading title={title} props={props} />
          {body ? <EBody body={body} props={props} className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground" /> : null}
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

function CtaLayout(props: SectionProps) {
  const { title, body, cta } = props;
  return (
    <section className="mx-auto max-w-3xl px-6 py-28 text-center md:py-40">
      <Reveal>
        <SectionEyebrow>
          <span className="mx-auto">{getLabel(props)}</span>
        </SectionEyebrow>
        {props.editable ? (
          <EHeading title={title} props={props} />
        ) : (
          <h2 className="mx-auto max-w-xl font-serif text-5xl leading-[0.92] tracking-[-0.025em] text-foreground md:text-7xl">
            {italicizeLast(title)}
          </h2>
        )}
        <EBody body={body} props={props} className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-foreground/70" />
      </Reveal>
      {cta ? (
        <Reveal delay={0.2}>
          {props.editable ? (
            <EditableText
              value={cta}
              path={`sections.${props.sectionIndex}.cta`}
              editable
              tag="span"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3 text-background"
            />
          ) : (
            <Button
              size="xl"
              className="mt-10 rounded-full bg-foreground px-8 text-background transition-transform hover:scale-105 hover:bg-foreground/85"
            >
              {cta}
              <ArrowRight className="size-4" />
            </Button>
          )}
        </Reveal>
      ) : null}
    </section>
  );
}
