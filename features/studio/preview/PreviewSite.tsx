'use client';

import type { CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Section } from './Section';
import { HeroFlipbook } from './HeroFlipbook';
import { SmoothScroll } from './SmoothScroll';
import { HeroParallax, Reveal } from './motion';
import { EditableText } from './EditableText';
import type { Scene, SiteStructure } from '@/features/pipeline/types';

interface PreviewSiteProps {
  projectId: string;
  scene: Scene;
  site: SiteStructure;
  frameCount: number;
  hasKeyframe: boolean;
  /** When true, all text is contentEditable and changes postMessage to parent */
  editable?: boolean;
}

export function PreviewSite({
  projectId,
  scene,
  site,
  frameCount,
  hasKeyframe,
  editable = false,
}: PreviewSiteProps) {
  const palette = scene.palette;
  const density = scene.style?.density ?? 'balanced';

  // Section vertical padding scales with the brief's density token. Sections
  // read --sec-y-sm / --sec-y-md via Tailwind arbitrary values; defaults
  // (6rem/8rem) match historical balanced behavior so legacy generations
  // without scene.style render identically.
  const densityVars: Record<string, string> =
    density === 'spacious'
      ? { '--sec-y-sm': '8rem', '--sec-y-md': '11rem' }
      : density === 'compact'
        ? { '--sec-y-sm': '4rem', '--sec-y-md': '6rem' }
        : { '--sec-y-sm': '6rem', '--sec-y-md': '8rem' };

  const tokens: CSSProperties = {
    '--color-background': palette.background,
    '--color-foreground': palette.foreground,
    '--color-card': `color-mix(in oklab, ${palette.foreground} 4%, ${palette.background})`,
    '--color-card-foreground': palette.foreground,
    '--color-popover': palette.background,
    '--color-popover-foreground': palette.foreground,
    '--color-primary': palette.accent,
    '--color-primary-foreground': palette.background,
    '--color-secondary': `color-mix(in oklab, ${palette.foreground} 8%, ${palette.background})`,
    '--color-secondary-foreground': palette.foreground,
    '--color-muted': `color-mix(in oklab, ${palette.foreground} 6%, ${palette.background})`,
    '--color-muted-foreground': `color-mix(in oklab, ${palette.foreground} 60%, transparent)`,
    '--color-input': `color-mix(in oklab, ${palette.foreground} 12%, transparent)`,
    '--color-ring': palette.accent,
    '--color-border': `color-mix(in oklab, ${palette.foreground} 10%, transparent)`,
    ...densityVars,
    backgroundColor: palette.background,
    color: palette.foreground,
    fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    WebkitFontSmoothing: 'antialiased',
    letterSpacing: '-0.011em',
  } as CSSProperties;

  return (
    <SmoothScroll>
    <main style={tokens} className="min-h-screen">
      {/* Top nav */}
      <nav className="absolute inset-x-0 top-0 z-30 mx-auto flex max-w-6xl items-center justify-between px-6 py-7 md:px-12">
        <EditableText
          value={site.brandName}
          path="brandName"
          editable={editable}
          tag="span"
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/95"
        />
        <div className="hidden items-center gap-8 text-xs text-foreground/70 md:flex">
          {site.sections.slice(0, 4).map((s, i) => (
            <a key={i} href={`#section-${i}`} className="transition hover:text-foreground">
              {s.title.split(/[.,—]/)[0]?.trim().slice(0, 20)}
            </a>
          ))}
        </div>
      </nav>

      {/* Hero — scroll-driven flipbook (Draftly-style) when frames exist,
           else Ken Burns on keyframe, else gradient */}
      {frameCount > 0 ? (
        <HeroFlipbook
          projectId={projectId}
          frameCount={frameCount}
          scrollVh={250}
          backgroundColor={palette.background}
        >
          <HeroOverlay site={site} editable={editable} />
        </HeroFlipbook>
      ) : hasKeyframe ? (
        <div className="relative h-screen w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/preview/${projectId}/keyframe`}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              animation: 'kenBurns 30s ease-in-out infinite alternate',
              transformOrigin: 'center center',
            }}
          />
          <HeroOverlay site={site} editable={editable} />
        </div>
      ) : (
        <div
          className="relative h-screen w-full"
          style={{
            background: `linear-gradient(135deg, ${palette.background}, color-mix(in oklab, ${palette.accent} 20%, ${palette.background}))`,
          }}
        >
          <HeroOverlay site={site} editable={editable} />
        </div>
      )}

      {/* Sections */}
      {site.sections.map((section, i) => {
        const zone = getZone(section.layout, i);
        return (
          <div
            key={i}
            id={`section-${i}`}
            className={zone.className}
            style={zone.style}
          >
            <Section
              layout={section.layout}
              label={section.label}
              title={section.title}
              body={section.body}
              cta={section.cta}
              items={section.items}
              editable={editable}
              sectionIndex={i}
            />
          </div>
        );
      })}

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-baseline justify-between px-6 py-12 md:px-12">
          <EditableText
            value={site.brandName}
            path="brandName"
            editable={editable}
            tag="div"
            className="font-serif text-2xl italic text-foreground/90"
          />
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            &copy; {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </main>
    </SmoothScroll>
  );
}

function getZone(
  layout: string,
  index: number,
): { className: string; style?: React.CSSProperties } {
  if (layout === 'cta') {
    return {
      className: 'relative overflow-hidden',
      style: {
        background:
          'linear-gradient(135deg, var(--color-primary), color-mix(in oklab, var(--color-primary) 70%, var(--color-background)))',
        '--color-foreground': 'var(--color-primary-foreground)',
        '--color-background': 'var(--color-primary)',
        '--color-muted-foreground': 'color-mix(in oklab, var(--color-primary-foreground) 70%, transparent)',
        '--color-border': 'color-mix(in oklab, var(--color-primary-foreground) 20%, transparent)',
      } as React.CSSProperties,
    };
  }

  if (layout === 'stat-grid' || layout === 'pricing-tiers' || layout === 'testimonial-wall') {
    return {
      className: 'relative',
      style: {
        background: 'color-mix(in oklab, var(--color-foreground) 3%, var(--color-background))',
      },
    };
  }

  if (layout === 'quote') {
    return {
      className: 'relative',
      style: {
        background: 'color-mix(in oklab, var(--color-primary) 5%, var(--color-background))',
      },
    };
  }

  if (layout === 'logo-strip') {
    return { className: '' };
  }

  if (index % 3 === 2) {
    return {
      className: 'relative',
      style: {
        background: 'color-mix(in oklab, var(--color-foreground) 2%, var(--color-background))',
      },
    };
  }

  return { className: '' };
}

function HeroOverlay({ site, editable = false }: { site: SiteStructure; editable?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-6xl flex-col justify-end px-6 pb-24 md:px-12 md:pb-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />

      <HeroParallax className="pointer-events-auto relative max-w-3xl">
        {/* Eyebrow */}
        <div className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/70">
          <span className="inline-block h-px w-8 bg-foreground/40" />
          <EditableText
            value={truncateEyebrow(site.hero.subheadline)}
            path="hero.eyebrow"
            editable={editable}
            tag="span"
          />
        </div>

        {/* Headline */}
        <EditableText
          value={site.hero.headline}
          path="hero.headline"
          editable={editable}
          tag="h1"
          className="font-serif text-5xl leading-[0.92] tracking-[-0.025em] text-foreground sm:text-7xl md:text-8xl"
          style={{ textShadow: '0 2px 60px rgba(0,0,0,0.5)' }}
        >
          {editable ? site.hero.headline : renderHeadline(site.hero.headline)}
        </EditableText>

        {/* Subheadline */}
        <EditableText
          value={site.hero.subheadline}
          path="hero.subheadline"
          editable={editable}
          tag="p"
          className="mt-6 max-w-xl text-base leading-relaxed text-foreground/85 md:text-lg"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
        />

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center gap-6">
          {editable ? (
            <EditableText
              value={site.hero.ctaPrimary}
              path="hero.ctaPrimary"
              editable
              tag="span"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
            />
          ) : (
            <Button size="lg" className="rounded-full px-7 transition-transform hover:scale-105">
              {site.hero.ctaPrimary}
              <ArrowRight className="size-4" />
            </Button>
          )}
          {site.hero.ctaSecondary ? (
            <EditableText
              value={site.hero.ctaSecondary}
              path="hero.ctaSecondary"
              editable={editable}
              tag="span"
              className="text-sm text-foreground/80 transition hover:translate-x-1 hover:text-foreground"
            >
              {editable ? site.hero.ctaSecondary : <>{site.hero.ctaSecondary} &rarr;</>}
            </EditableText>
          ) : null}
        </div>
      </HeroParallax>
    </div>
  );
}

function truncateEyebrow(text: string): string {
  const first = text.split(/[.—,]/)[0]?.trim() ?? text;
  if (first.length <= 42) return first.toLowerCase();
  return first.slice(0, 40).toLowerCase() + '\u2026';
}

function renderHeadline(headline: string): React.ReactNode {
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
