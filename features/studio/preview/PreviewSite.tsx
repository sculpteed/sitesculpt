'use client';

import type { CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Section } from './Section';
import { HeroFlipbook } from './HeroFlipbook';
import { SmoothScroll } from './SmoothScroll';
import { HeroParallax, Reveal } from './motion';
import type { Scene, SiteStructure } from '@/features/pipeline/types';

interface PreviewSiteProps {
  projectId: string;
  scene: Scene;
  site: SiteStructure;
  frameCount: number;
  hasKeyframe: boolean;
}

/**
 * Full-bleed preview that sets shadcn design tokens from the scene palette
 * via CSS custom properties. Every child component uses semantic classes
 * (bg-background, text-foreground, bg-primary, etc.) that resolve through
 * the @theme block in globals.css.
 *
 * This is how v0 / shadcn projects render — semantic tokens + design
 * primitives. No inline styles, no hand-written CSS, no 2000s WordPress.
 */
export function PreviewSite({
  projectId,
  scene,
  site,
  frameCount,
  hasKeyframe,
}: PreviewSiteProps) {
  const palette = scene.palette;

  // Override shadcn design tokens directly on the preview wrapper. These
  // cascade to every child component using `bg-background`, `text-foreground`,
  // `bg-primary`, etc. Derived variants (card, muted, etc.) use color-mix.
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
    // border-border reads from --color-border, which in the studio is the
    // warm palette hairline. Override here to a subtle foreground tint.
    '--color-border': `color-mix(in oklab, ${palette.foreground} 10%, transparent)`,
    backgroundColor: palette.background,
    color: palette.foreground,
    fontFamily: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    WebkitFontSmoothing: 'antialiased',
    letterSpacing: '-0.011em',
  } as CSSProperties;

  return (
    <SmoothScroll>
    <main style={tokens} className="min-h-screen">
      {/* Top nav — editorial, small, out of the way */}
      <nav className="absolute inset-x-0 top-0 z-30 mx-auto flex max-w-6xl items-center justify-between px-6 py-7 md:px-12">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/95">
          {site.brandName}
        </span>
        <div className="hidden items-center gap-8 text-xs text-foreground/70 md:flex">
          {site.sections.slice(0, 4).map((s, i) => (
            <a key={i} href={`#section-${i}`} className="transition hover:text-foreground">
              {s.title.split(/[.,—]/)[0]?.trim().slice(0, 20)}
            </a>
          ))}
        </div>
      </nav>

      {/* Hero — keyframe image with Ken Burns CSS animation by default.
           The keyframe is 1536×1024 (sharp), while Sora video is 1280×720
           (720p upscaled to full viewport = blurry). Keyframe + Ken Burns
           looks better and costs $0 extra. Sora flipbook is available as
           an optional premium upgrade for users who want real video motion. */}
      {hasKeyframe ? (
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
          <HeroOverlay site={site} />
        </div>
      ) : (
        <div
          className="relative h-screen w-full"
          style={{
            background: `linear-gradient(135deg, ${palette.background}, color-mix(in oklab, ${palette.accent} 20%, ${palette.background}))`,
          }}
        >
          <HeroOverlay site={site} />
        </div>
      )}

      {/* Sections — with visual zone treatments for variety */}
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
            />
          </div>
        );
      })}

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-baseline justify-between px-6 py-12 md:px-12">
          <div className="font-serif text-2xl italic text-foreground/90">{site.brandName}</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            © {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </main>
    </SmoothScroll>
  );
}

// Visual zone system — breaks the monotony of same-background sections by
// assigning different background treatments based on layout type + position.
function getZone(
  layout: string,
  index: number,
): { className: string; style?: React.CSSProperties } {
  // Accent-inverted sections (dramatic contrast)
  if (layout === 'cta') {
    return {
      className: 'relative overflow-hidden',
      style: {
        background:
          'linear-gradient(135deg, var(--color-primary), color-mix(in oklab, var(--color-primary) 70%, var(--color-background)))',
        // Full palette inversion for the accent zone — foreground becomes
        // primary-foreground (dark), background becomes the accent itself
        // so buttons using bg-background render as green, and buttons
        // using bg-foreground render as dark.
        '--color-foreground': 'var(--color-primary-foreground)',
        '--color-background': 'var(--color-primary)',
        '--color-muted-foreground': 'color-mix(in oklab, var(--color-primary-foreground) 70%, transparent)',
        '--color-border': 'color-mix(in oklab, var(--color-primary-foreground) 20%, transparent)',
      } as React.CSSProperties,
    };
  }

  // Tinted surface sections (subtle lift off the base background)
  if (layout === 'stat-grid' || layout === 'pricing-tiers' || layout === 'testimonial-wall') {
    return {
      className: 'relative',
      style: {
        background:
          'color-mix(in oklab, var(--color-foreground) 3%, var(--color-background))',
      },
    };
  }

  // Quote gets a subtle accent wash
  if (layout === 'quote') {
    return {
      className: 'relative',
      style: {
        background:
          'color-mix(in oklab, var(--color-primary) 5%, var(--color-background))',
      },
    };
  }

  // Logo strip is already border-y, keep clean
  if (layout === 'logo-strip') {
    return { className: '' };
  }

  // Every other "normal" section — alternate subtle surface
  if (index % 3 === 2) {
    return {
      className: 'relative',
      style: {
        background:
          'color-mix(in oklab, var(--color-foreground) 2%, var(--color-background))',
      },
    };
  }

  // Default: no treatment (base background shows through)
  return { className: '' };
}

function HeroOverlay({ site }: { site: SiteStructure }) {
  return (
    <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-6xl flex-col justify-end px-6 pb-24 md:px-12 md:pb-32">
      {/* Darken at the bottom for legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />

      <HeroParallax className="pointer-events-auto relative max-w-3xl">
        {/* Editorial eyebrow */}
        <div className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/70">
          <span className="inline-block h-px w-8 bg-foreground/40" />
          <span>{truncateEyebrow(site.hero.subheadline)}</span>
        </div>

        {/* Display headline with italicized last sentence */}
        <h1
          className="font-serif text-5xl leading-[0.92] tracking-[-0.025em] text-foreground sm:text-7xl md:text-8xl"
          style={{ textShadow: '0 2px 60px rgba(0,0,0,0.5)' }}
        >
          {renderHeadline(site.hero.headline)}
        </h1>

        {/* Subheadline */}
        <p
          className="mt-6 max-w-xl text-base leading-relaxed text-foreground/85 md:text-lg"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
        >
          {site.hero.subheadline}
        </p>

        {/* CTA row — primary pill button + secondary text link */}
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <Button size="lg" className="rounded-full px-7 transition-transform hover:scale-105">
            {site.hero.ctaPrimary}
            <ArrowRight className="size-4" />
          </Button>
          {site.hero.ctaSecondary ? (
            <a
              href="#section-0"
              className="text-sm text-foreground/80 transition hover:translate-x-1 hover:text-foreground"
            >
              {site.hero.ctaSecondary} →
            </a>
          ) : null}
        </div>
      </HeroParallax>
    </div>
  );
}

function truncateEyebrow(text: string): string {
  const first = text.split(/[.—,]/)[0]?.trim() ?? text;
  if (first.length <= 42) return first.toLowerCase();
  return first.slice(0, 40).toLowerCase() + '…';
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
