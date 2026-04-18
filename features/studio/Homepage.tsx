'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudioStore } from './store';
import { TEMPLATES, type Template } from './templates';
import {
  FadeIn,
  StaggerGroup,
  StaggerChild,
  ScaleOnHover,
  PageTransition,
} from '@/components/motion';

export function Homepage() {
  const router = useRouter();
  const applyTemplate = useStudioStore((s) => s.applyTemplate);

  const handleTemplateClick = (t: Template): void => {
    applyTemplate(t);
    router.push('/studio');
  };

  const handleGetStarted = (): void => {
    router.push('/pricing?from=hero');
  };

  const featuredTemplates = TEMPLATES.slice(0, 3);
  const restTemplates = TEMPLATES.slice(3);

  return (
    <PageTransition>
    <main className="relative min-h-screen overflow-hidden bg-[#efeae0] text-[#1a1812]">
      {/* ─── Draftly-style cream background ──────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Base warm cream */}
        <div className="absolute inset-0 bg-[#efeae0]" />
        {/* Soft warm radial washes */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(220,188,140,0.28), transparent 70%), radial-gradient(ellipse 60% 40% at 100% 20%, rgba(200,150,100,0.16), transparent 70%), radial-gradient(ellipse 50% 40% at 0% 80%, rgba(160,110,80,0.10), transparent 70%)',
          }}
        />
        {/* Paper grain */}
        <div
          className="absolute inset-0 opacity-[0.35] mix-blend-multiply"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.08  0 0 0 0 0.07  0 0 0 0 0.05  0 0 0 0.32 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            backgroundSize: '220px 220px',
          }}
        />
        {/* Vignette toward bottom for section separation */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, transparent 55%, rgba(40,30,20,0.06) 100%)',
          }}
        />
      </div>

      {/* ─── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="relative z-30 mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex items-center gap-2.5">
          <div className="h-4 w-4 rounded-[3px] bg-[#1a1812]" />
          <span className="text-sm font-medium tracking-tight text-[#1a1812]">sitesculpt</span>
        </div>
        <div className="flex items-center gap-5 text-[12px] text-[#1a1812]/60 sm:gap-8 sm:text-[13px]">
          <a href="#templates" className="hidden transition hover:text-[#1a1812] sm:inline">
            Templates
          </a>
          <a href="#features" className="hidden transition hover:text-[#1a1812] sm:inline">
            Features
          </a>
          <a href="/pricing" className="hidden transition hover:text-[#1a1812] sm:inline">
            Pricing
          </a>
          <a href="/sign-in" className="transition hover:text-[#1a1812]">
            Sign in
          </a>
          <a
            href="/pricing?from=nav"
            className="rounded-full bg-[#1a1812] px-3.5 py-1.5 text-[12px] font-medium text-[#efeae0] transition hover:opacity-85 sm:px-4"
          >
            Get started
          </a>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative z-20 mx-auto flex max-w-5xl flex-col items-center justify-center px-6 pt-16 pb-10 text-center sm:px-8 sm:pt-20">
        <FadeIn delay={0.05}>
          <h1 className="mb-8 font-serif text-[56px] leading-[0.94] tracking-[-0.03em] text-[#1a1812] sm:text-[92px] md:text-[118px]">
            Cinematic sites,{' '}
            <em className="italic text-[#8a5a2b]">
              from a prompt.
            </em>
          </h1>
        </FadeIn>
        <FadeIn delay={0.12}>
          <p className="mx-auto mb-10 max-w-xl text-[15px] leading-relaxed text-[#1a1812]/65 sm:text-[17px]">
            Describe your business. Sitesculpt generates a 3D scroll-driven website with AI copy,
            cinematic motion, and production-ready Next.js code — in about five minutes.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ScaleOnHover>
              <button
                onClick={handleGetStarted}
                className="rounded-full bg-[#1a1812] px-7 py-3.5 text-[14px] font-semibold text-[#efeae0] shadow-[0_20px_50px_-20px_rgba(26,24,18,0.45)] transition hover:opacity-90"
              >
                Start Building &rarr;
              </button>
            </ScaleOnHover>
            <a
              href="#templates"
              className="rounded-full border border-[#1a1812]/15 bg-white/20 px-6 py-3.5 text-[14px] font-medium text-[#1a1812]/80 backdrop-blur-sm transition hover:border-[#1a1812]/30 hover:text-[#1a1812]"
            >
              Explore Templates
            </a>
          </div>
        </FadeIn>

        {/* Stat row */}
        <FadeIn delay={0.3}>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-left">
            {[
              { v: '12', l: 'Templates' },
              { v: '5 min', l: 'Prompt to deploy' },
              { v: 'Next.js', l: 'Real code export' },
              { v: 'Cinematic', l: 'Scroll motion' },
            ].map((s) => (
              <div key={s.l} className="border-l border-[#1a1812]/15 pl-4">
                <div className="font-serif text-xl leading-none tracking-tight text-[#1a1812]">{s.v}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#1a1812]/50">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ─── Cinematic hero showcase ─────────────────────────────────────── */}
      <section className="relative z-20 mx-auto max-w-6xl px-4 pb-20 sm:px-8 sm:pb-28">
        <FadeIn delay={0.4}>
          <HeroShowcase
            templates={featuredTemplates}
            onTemplateClick={handleTemplateClick}
          />
        </FadeIn>
      </section>

      {/* ─── Featured templates showcase ─────────────────────────────────── */}
      <section
        id="templates"
        className="relative z-20 mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-32"
      >
        <FadeIn>
          <div className="mb-12 flex flex-col items-start gap-3">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#1a1812]/50 sm:text-[11px]">
              <span className="inline-block h-px w-6 bg-[#1a1812]/25" />
              <span>Best previews</span>
            </div>
            <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="font-serif text-4xl leading-[0.98] tracking-[-0.025em] text-[#1a1812] sm:text-5xl md:text-6xl">
                Pick a starter.{' '}
                <em className="italic text-[#8a5a2b]">
                  Ship today.
                </em>
              </h2>
              <p className="max-w-sm text-[14px] leading-relaxed text-[#1a1812]/60">
                Each template is a live deployed site. Click preview to open it full-screen, or
                use it as the starting point for yours.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Featured 3 */}
        <StaggerGroup
          className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3"
          stagger={0.08}
        >
          {featuredTemplates.map((t) => (
            <StaggerChild key={t.id}>
              <TemplateCard
                template={t}
                onClick={() => handleTemplateClick(t)}
                variant="featured"
              />
            </StaggerChild>
          ))}
        </StaggerGroup>

        {/* Remaining templates */}
        <StaggerGroup
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.05}
        >
          {restTemplates.map((t) => (
            <StaggerChild key={t.id}>
              <TemplateCard template={t} onClick={() => handleTemplateClick(t)} />
            </StaggerChild>
          ))}
        </StaggerGroup>
      </section>

      {/* ─── Features grid ───────────────────────────────────────────────── */}
      <section
        id="features"
        className="relative z-20 mx-auto max-w-6xl px-6 py-24 sm:px-8 sm:py-32"
      >
        <FadeIn>
          <div className="mb-14 flex flex-col items-start gap-3 sm:mb-20">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#1a1812]/50 sm:text-[11px]">
              <span className="inline-block h-px w-6 bg-[#1a1812]/25" />
              <span>What&rsquo;s inside</span>
            </div>
            <h2 className="font-serif text-4xl leading-[0.98] tracking-[-0.025em] text-[#1a1812] sm:text-5xl md:text-6xl">
              Built for shipping,{' '}
              <em className="italic text-[#8a5a2b]">
                not demoing.
              </em>
            </h2>
          </div>
        </FadeIn>
        <StaggerGroup
          className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[#1a1812]/12 bg-[#1a1812]/10 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.06}
        >
          {[
            {
              t: 'Cinematic scroll motion',
              d: 'Canvas 2D frame flipbook driven by scroll. Every template includes the same mechanism Draftly uses, inlined in your export.',
            },
            {
              t: 'Design-aware copy',
              d: 'The newest vision model writes copy and structure. Drop a reference image and it reads palette and mood.',
            },
            {
              t: 'Multi-step creative funnel',
              d: 'Art direction, keyframe approval, copy review. You steer the creative direction at every checkpoint.',
            },
            {
              t: 'Live inline editing',
              d: 'Click any headline, button, or label on the preview. It rewrites in place and syncs to the export.',
            },
            {
              t: 'Real Next.js export',
              d: 'Ship a real repo: Tailwind, motion primitives, scroll frames, deploy-ready. No vendor lock-in.',
            },
            {
              t: 'Auto-save projects',
              d: 'Close the tab mid-generation, come back later. Every project lives in your dashboard.',
            },
          ].map((x) => (
            <StaggerChild key={x.t}>
              <div className="h-full bg-[#efeae0] p-7 transition hover:bg-[#e8e2d4] sm:p-8">
                <div className="mb-3 text-[15px] font-semibold tracking-tight text-[#1a1812]">
                  {x.t}
                </div>
                <div className="text-[13px] leading-relaxed text-[#1a1812]/60">
                  {x.d}
                </div>
              </div>
            </StaggerChild>
          ))}
        </StaggerGroup>
      </section>

      {/* ─── Pipeline ────────────────────────────────────────────────────── */}
      <section
        id="pipeline"
        className="relative z-20 mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28"
      >
        <FadeIn>
          <div className="mb-12 flex flex-col items-start gap-3 sm:mb-16">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#1a1812]/50 sm:text-[11px]">
              <span className="inline-block h-px w-6 bg-[#1a1812]/25" />
              <span>The pipeline</span>
            </div>
            <h2 className="font-serif text-4xl leading-[0.98] tracking-[-0.025em] text-[#1a1812] sm:text-5xl md:text-6xl">
              Prompt to production.{' '}
              <em className="italic text-[#8a5a2b]">
                In five steps.
              </em>
            </h2>
          </div>
        </FadeIn>
        <StaggerGroup
          className="grid grid-cols-1 divide-y divide-[#1a1812]/12 border-y border-[#1a1812]/12 md:grid-cols-5 md:divide-x md:divide-y-0"
          stagger={0.08}
        >
          {[
            { n: '01', t: 'Describe', d: 'Brand, audience, tone, attached references.' },
            { n: '02', t: 'Generate', d: 'AI picks 3 cinematic directions. You pick one.' },
            { n: '03', t: 'Compose', d: 'Copy and structure written for you. Editable on arrival.' },
            { n: '04', t: 'Animate', d: 'Keyframe becomes a scroll-driven flipbook.' },
            { n: '05', t: 'Export', d: 'Download a real Next.js repo or deploy direct.' },
          ].map((s) => (
            <StaggerChild key={s.n}>
              <div className="group px-6 py-8 transition hover:bg-[#1a1812]/[0.03]">
                <div className="mb-10 font-mono text-[11px] tracking-wider text-[#1a1812]/40">
                  {s.n}
                </div>
                <div className="mb-2 text-[15px] font-semibold text-[#1a1812]">{s.t}</div>
                <div className="text-[13px] leading-relaxed text-[#1a1812]/60">{s.d}</div>
              </div>
            </StaggerChild>
          ))}
        </StaggerGroup>
      </section>

      {/* ─── Closing CTA ─────────────────────────────────────────────────── */}
      <section className="relative z-20 mx-auto max-w-6xl px-6 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28">
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl border border-[#1a1812]/12 bg-[#1a1812] p-10 text-[#efeae0] sm:p-16">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-60"
              style={{
                background:
                  'radial-gradient(ellipse 60% 80% at 20% 100%, rgba(220,180,120,0.18), transparent 60%), radial-gradient(ellipse 40% 60% at 100% 0%, rgba(180,130,80,0.14), transparent 60%)',
              }}
            />
            <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <h3 className="font-serif text-3xl leading-[1] tracking-[-0.025em] sm:text-5xl">
                  Ship a cinematic site.{' '}
                  <em className="italic text-[#e8b874]">Today.</em>
                </h3>
                <p className="mt-4 text-[14px] leading-relaxed text-[#efeae0]/70 sm:text-[15px]">
                  Plans start at $19/month. Cancel any time. Every tier includes full Next.js
                  export and the cinematic scroll flipbook.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ScaleOnHover>
                  <button
                    onClick={handleGetStarted}
                    className="rounded-full bg-[#efeae0] px-6 py-3 text-[13px] font-semibold text-[#1a1812] transition hover:opacity-90"
                  >
                    View plans &rarr;
                  </button>
                </ScaleOnHover>
                <a
                  href="/sign-in"
                  className="text-[12px] text-[#efeae0]/65 transition hover:text-[#efeae0]"
                >
                  Already have an account? Sign in
                </a>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      <footer className="relative z-20 mx-auto max-w-6xl px-6 pb-14 sm:px-8 sm:pb-16">
        <div className="flex flex-col items-start justify-between gap-4 border-t border-[#1a1812]/15 pt-8 text-[11px] uppercase tracking-[0.22em] text-[#1a1812]/45 sm:flex-row sm:items-center">
          <div>sitesculpt</div>
          <div className="flex gap-6">
            <a href="/pricing" className="transition hover:text-[#1a1812]/80">Pricing</a>
            <a href="#features" className="transition hover:text-[#1a1812]/80">Features</a>
            <a href="/sign-in" className="transition hover:text-[#1a1812]/80">Sign in</a>
          </div>
        </div>
      </footer>
    </main>
    </PageTransition>
  );
}

// ─── Hero showcase ───────────────────────────────────────────────────────────
//
// Cycles the featured templates' cinematic loops inside a browser-chrome
// frame. Two stacked <video> layers crossfade between templates so there's
// no jarring cut between clips. Each loop is ~4s; we switch every 6s to let
// the motion breathe before moving on.

const CYCLE_MS = 6000;
const FADE_MS = 900;

function HeroShowcase({
  templates,
  onTemplateClick,
}: {
  templates: Template[];
  onTemplateClick: (t: Template) => void;
}) {
  const [index, setIndex] = useState(0);
  const current = templates[index % templates.length];
  const next = templates[(index + 1) % templates.length];

  useEffect(() => {
    if (templates.length <= 1) return;
    const id = window.setInterval(() => setIndex((i) => i + 1), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [templates.length]);

  // The "current" layer fades out while the "next" layer fades in so the
  // transition stays silky. We flip which layer is rendered each tick via
  // the parity of `index`.
  const showA = index % 2 === 0;

  if (!current || !next) return null;

  return (
    <div className="cinematic-float relative">
      {/* Glow pad behind the frame */}
      <div
        aria-hidden="true"
        className="absolute -inset-x-10 -inset-y-6 rounded-[40px] blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(140,80,40,0.22), transparent 70%)',
        }}
      />
      {/* Browser-chrome frame */}
      <div className="relative overflow-hidden rounded-[22px] border border-[#1a1812]/12 bg-[#1a1812] shadow-[0_60px_120px_-40px_rgba(26,24,18,0.55),0_30px_60px_-20px_rgba(26,24,18,0.35)]">
        <div className="flex items-center gap-2 border-b border-white/5 bg-[#15130e] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <div className="ml-4 flex-1 rounded-md bg-white/5 px-3 py-1 font-mono text-[11px] text-white/50 transition-[color] duration-500">
            {slugFor(current)}
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#28c840]" />
            live
          </div>
        </div>
        <div className="relative aspect-[16/9] overflow-hidden bg-black">
          {/* Layer A */}
          <ShowcaseLayer template={showA ? current : next} visible={showA} />
          {/* Layer B */}
          <ShowcaseLayer template={showA ? next : current} visible={!showA} />

          {/* Film grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.7'/></svg>\")",
              backgroundSize: '220px 220px',
            }}
          />

          {/* Bottom label + CTA overlaid on the video */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.24em] text-white/65">
                  {current.category}
                </div>
                <div className="truncate font-serif text-2xl leading-none tracking-[-0.02em] text-white sm:text-3xl">
                  {current.title}
                  <span className="ml-2 text-white/55">— {current.subtitle}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onTemplateClick(current)}
                className="pointer-events-auto hidden shrink-0 rounded-full bg-white/95 px-5 py-2.5 text-[12px] font-semibold text-[#1a1812] transition hover:bg-white sm:inline-block"
              >
                Use this template &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {templates.map((t, i) => {
          const active = (index % templates.length) === i;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${t.title}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                active
                  ? 'w-10 bg-[#1a1812]'
                  : 'w-4 bg-[#1a1812]/20 hover:bg-[#1a1812]/40'
              }`}
            />
          );
        })}
      </div>

      {/* Caption */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#1a1812]/55">
        <span>{templates.length} featured</span>
        <span className="text-[#1a1812]/25">·</span>
        <span>Real generated sites</span>
        <span className="text-[#1a1812]/25">·</span>
        <span>Tap dots to switch</span>
      </div>
    </div>
  );
}

function ShowcaseLayer({ template, visible }: { template: Template; visible: boolean }) {
  return (
    <div
      className="absolute inset-0 transition-opacity"
      style={{
        opacity: visible ? 1 : 0,
        transitionDuration: `${FADE_MS}ms`,
      }}
    >
      {template.loopUrl ? (
        <video
          key={template.id}
          src={template.loopUrl}
          poster={template.previewUrl}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      ) : template.previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={template.previewUrl}
          alt={template.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${template.gradient[0]}, ${template.gradient[1]})`,
          }}
        />
      )}
    </div>
  );
}

function slugFor(t: Template): string {
  return `${t.brandName.toLowerCase().replace(/[^a-z0-9]+/g, '')}.com`;
}

// ─── Template card ───────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onClick,
  variant = 'default',
}: {
  template: Template;
  onClick: () => void;
  variant?: 'default' | 'featured';
}) {
  const imageHeight = variant === 'featured' ? 'h-[260px]' : 'h-[220px]';
  return (
    <ScaleOnHover scale={1.015}>
      <div className="group flex flex-col overflow-hidden rounded-xl border border-[#1a1812]/12 bg-white/40 backdrop-blur-sm transition hover:border-[#1a1812]/25 hover:bg-white/60">
        <button
          type="button"
          onClick={onClick}
          className={`relative w-full overflow-hidden ${imageHeight}`}
          style={{
            background: `linear-gradient(135deg, ${template.gradient[0]}, ${template.gradient[1]})`,
          }}
        >
          {template.loopUrl ? (
            <video
              src={template.loopUrl}
              poster={template.previewUrl}
              className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-[1.02]"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-hidden="true"
            />
          ) : (
            template.previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={template.previewUrl}
                alt={template.title}
                className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-[1.04]"
              />
            )
          )}
          {/* Subtle gradient at bottom so the category badge stays readable
              when videos have bright content */}
          {template.loopUrl && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
          )}
        </button>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-[#1a1812]">{template.title}</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#1a1812]/45">
              {template.category}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {template.livePreviewId && (
              <a
                href={`/preview/${template.livePreviewId}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded-md border border-[#1a1812]/20 px-2.5 py-1.5 text-[11px] text-[#1a1812]/65 transition hover:border-[#1a1812]/40 hover:text-[#1a1812]"
              >
                Preview &nearr;
              </a>
            )}
            <button
              type="button"
              onClick={onClick}
              className="rounded-md bg-[#1a1812] px-3 py-1.5 text-[11px] font-medium text-[#efeae0] transition hover:opacity-85"
            >
              Use This
            </button>
          </div>
        </div>
      </div>
    </ScaleOnHover>
  );
}
