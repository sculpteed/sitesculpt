'use client';

import { useRouter } from 'next/navigation';
import { useStudioStore } from './store';
import { TEMPLATES, type Template } from './templates';
import {
  FadeIn,
  StaggerGroup,
  StaggerChild,
  ScaleOnHover,
  PageTransition,
  GlowPulse,
} from '@/components/motion';

export function Homepage() {
  const router = useRouter();
  const applyTemplate = useStudioStore((s) => s.applyTemplate);

  const handleTemplateClick = (t: Template): void => {
    applyTemplate(t);
    router.push('/studio');
  };

  const handleGetStarted = (): void => {
    router.push('/studio');
  };

  return (
    <PageTransition>
    <main className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0d0a08]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-bg.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
          style={{
            animation: 'kenBurns 30s ease-in-out infinite alternate',
            transformOrigin: 'center center',
          }}
        />
        {/* Darken overlay for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(13,10,8,0.3) 0%, rgba(13,10,8,0.15) 40%, rgba(13,10,8,0.5) 100%)',
          }}
        />
        <div className="grain absolute inset-0 opacity-[0.06]" />
      </div>

      {/* Nav */}
      <nav className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex items-center gap-2.5">
          <div className="h-4 w-4 rounded-[3px]" style={{ backgroundColor: '#f3ead9' }} />
          <span className="text-sm font-medium tracking-tight text-warm">sitesculpt</span>
        </div>
        <div className="flex items-center gap-4 text-[12px] text-warm-muted sm:gap-7 sm:text-[13px]">
          <a href="#templates" className="hidden transition hover:text-warm sm:inline">
            Templates
          </a>
          <a href="#pipeline" className="hidden transition hover:text-warm sm:inline">
            Pipeline
          </a>
          <a
            href="/get-started"
            className="rounded-full border border-[rgba(243,234,217,0.2)] px-3.5 py-1.5 text-warm transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] sm:px-4"
          >
            Get started
          </a>
        </div>
      </nav>

      {/* Hero — no FadeIn wrappers, renders immediately */}
      <section className="relative z-20 mx-auto flex min-h-[72vh] max-w-4xl flex-col items-center justify-center px-6 py-20 text-center sm:px-8">
        <h1 className="mb-6 font-serif text-[56px] leading-[0.95] tracking-[-0.02em] text-warm sm:mb-8 sm:text-[88px] sm:leading-[0.92] md:text-[128px]">
          Start{' '}
          <em className="italic" style={{ color: '#f5d9a8' }}>
            sculpting.
          </em>
        </h1>

        <p className="mb-8 max-w-md text-[14px] leading-relaxed text-warm-muted sm:text-[15px]">
          Describe your business. Get a cinematic, production-ready website in minutes.
        </p>

        <div className="flex flex-col items-center gap-4">
          <GlowPulse color="#e8b874">
            <ScaleOnHover>
              <button
                onClick={handleGetStarted}
                className="rounded-full px-7 py-3.5 text-[14px] font-medium text-[#0d0a08] transition"
                style={{ backgroundColor: '#e8b874' }}
              >
                Start from scratch
              </button>
            </ScaleOnHover>
          </GlowPulse>
          <a
            href="#templates"
            className="text-[12px] text-warm-subtle transition hover:text-warm"
          >
            or pick a template below
          </a>
        </div>
      </section>

      {/* Reading surface */}
      <div className="relative z-10 bg-warm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-80 h-80"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, rgba(13,10,8,0.1) 25%, rgba(13,10,8,0.3) 50%, rgba(13,10,8,0.65) 75%, rgba(13,10,8,0.92) 92%, #0d0a08 100%)',
          }}
        />

        {/* Templates */}
        <section id="templates" className="relative z-20 mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
          <FadeIn>
            <div className="mb-12 flex flex-col items-start gap-3 sm:mb-16">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-warm-subtle sm:text-[11px]">
                <span className="inline-block h-px w-5 bg-[var(--color-border-strong)] sm:w-6" />
                <span>Start here</span>
              </div>
              <h2 className="font-serif text-4xl leading-[0.98] tracking-[-0.02em] text-warm sm:text-5xl md:text-6xl">
                Pick a{' '}
                <em className="italic" style={{ color: '#f5d9a8' }}>
                  template.
                </em>
              </h2>
              <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-warm-muted">
                Each template pre-fills the brief with smart defaults. You can customize everything before generating.
              </p>
            </div>
          </FadeIn>

          <StaggerGroup
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            stagger={0.06}
          >
            {TEMPLATES.map((t) => (
              <StaggerChild key={t.id}>
                <TemplateCard template={t} onClick={() => handleTemplateClick(t)} />
              </StaggerChild>
            ))}
          </StaggerGroup>

          <FadeIn delay={0.4}>
            <div className="mt-10 text-center">
              <button
                onClick={handleGetStarted}
                className="text-[13px] text-warm-muted transition hover:text-warm"
              >
                Or describe your own from scratch &rarr;
              </button>
            </div>
          </FadeIn>
        </section>

        {/* Pipeline */}
        <section id="pipeline" className="relative z-20 mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
          <FadeIn>
            <div className="mb-12 flex flex-col items-start gap-3 sm:mb-16">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-warm-subtle sm:text-[11px]">
                <span className="inline-block h-px w-5 bg-[var(--color-border-strong)] sm:w-6" />
                <span>The pipeline</span>
              </div>
              <h2 className="font-serif text-4xl leading-[0.98] tracking-[-0.02em] text-warm sm:text-5xl md:text-6xl">
                From prompt to{' '}
                <em className="italic" style={{ color: '#f5d9a8' }}>
                  production.
                </em>
              </h2>
            </div>
          </FadeIn>
          <StaggerGroup className="grid grid-cols-1 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)] md:grid-cols-5 md:divide-x md:divide-y-0" stagger={0.08}>
            {[
              { n: '01', t: 'Describe', d: 'Your subject, your mood, your tone.' },
              { n: '02', t: 'Generate', d: 'A high-resolution keyframe lands in seconds.' },
              { n: '03', t: 'Compose', d: 'Hero copy + sections, editable on arrival.' },
              { n: '04', t: 'Animate', d: 'Motion synthesised from the keyframe.' },
              { n: '05', t: 'Export', d: 'A real Next.js project. Free, on any plan.' },
            ].map((s) => (
              <StaggerChild key={s.n}>
                <ScaleOnHover scale={1.01} className="group px-6 py-8 transition hover:bg-[rgba(243,234,217,0.015)]">
                  <div className="mb-10 font-mono text-[11px] tracking-wider text-warm-subtle">
                    {s.n}
                  </div>
                  <div className="mb-2 text-base font-medium text-warm">{s.t}</div>
                  <div className="text-[13px] leading-relaxed text-warm-muted">{s.d}</div>
                </ScaleOnHover>
              </StaggerChild>
            ))}
          </StaggerGroup>
        </section>

        {/* Principles */}
        <section id="principles" className="relative z-20 mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
          <FadeIn>
            <div className="mb-12 flex flex-col items-start gap-3 sm:mb-16">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-warm-subtle sm:text-[11px]">
                <span className="inline-block h-px w-5 bg-[var(--color-border-strong)] sm:w-6" />
                <span>Principles</span>
              </div>
              <h2 className="font-serif text-4xl leading-[0.98] tracking-[-0.02em] text-warm sm:text-5xl md:text-6xl">
                No friction.{' '}
                <em className="italic" style={{ color: '#f5d9a8' }}>
                  Ever.
                </em>
              </h2>
            </div>
          </FadeIn>
          <StaggerGroup className="grid gap-px bg-[var(--color-border)] md:grid-cols-3" stagger={0.1}>
            {[
              {
                t: 'No paywall to try',
                d: 'Others gate the builder behind $25/mo. We give you a free generation. No signup required.',
              },
              {
                t: 'Free code export',
                d: 'A real Next.js project on any plan. Not locked behind a premium tier.',
              },
              {
                t: 'Work never lost',
                d: 'Auto-save from the first keystroke. Close the tab, come back, pick up where you left off.',
              },
            ].map((x) => (
              <StaggerChild key={x.t}>
                <ScaleOnHover scale={1.01} className="h-full bg-warm p-8 transition-colors hover:bg-[rgba(243,234,217,0.02)] sm:p-10">
                  <div className="mb-3 font-serif text-xl italic text-warm sm:text-2xl">{x.t}</div>
                  <div className="text-[13px] leading-relaxed text-warm-muted sm:text-[14px]">
                    {x.d}
                  </div>
                </ScaleOnHover>
              </StaggerChild>
            ))}
          </StaggerGroup>
        </section>

        <FadeIn>
          <footer className="relative z-20 mx-auto max-w-6xl px-6 py-14 sm:px-8 sm:py-16">
            <div className="border-t border-[var(--color-border)] pt-8 text-center text-[11px] uppercase tracking-[0.22em] text-warm-subtle">
              sitesculpt
            </div>
          </footer>
        </FadeIn>
      </div>
    </main>
    </PageTransition>
  );
}

// ─── Template Card ──────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onClick,
}: {
  template: Template;
  onClick: () => void;
}) {
  return (
    <ScaleOnHover scale={1.02}>
      <div className="group flex flex-col overflow-hidden rounded-xl border border-[rgba(243,234,217,0.08)] transition-all hover:border-[rgba(243,234,217,0.2)]">
        {/* Preview image area */}
        <button
          type="button"
          onClick={onClick}
          className="relative h-[200px] w-full overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${template.gradient[0]}, ${template.gradient[1]})`,
          }}
        >
          {template.previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={template.previewUrl}
              alt={template.title}
              className="absolute inset-0 h-full w-full object-cover object-top transition group-hover:scale-[1.04]"
              style={{ transformOrigin: 'top center' }}
            />
          )}
          {/* Category badge */}
          <div className="absolute left-3 top-3 z-10">
            <span className="rounded-sm bg-[rgba(243,234,217,0.12)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-white/80 backdrop-blur-sm">
              {template.category}
            </span>
          </div>
        </button>

        {/* Info area below the image */}
        <div className="flex flex-col gap-3 bg-[rgba(243,234,217,0.02)] p-4">
          <div className="text-[14px] font-medium text-warm">
            {template.title}
            <span className="ml-1.5 text-warm-muted"> — </span>
            <span className="text-warm-muted">{template.subtitle}</span>
          </div>

          <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium text-[#0d0a08] transition hover:opacity-90"
            style={{ backgroundColor: '#e8b874' }}
          >
            Use This &rarr;
          </button>
        </div>
      </div>
    </ScaleOnHover>
  );
}
