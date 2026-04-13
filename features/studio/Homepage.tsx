'use client';

import { useRouter } from 'next/navigation';
import { useStudioStore } from './store';
import {
  SmoothScroll,
  FadeIn,
  StaggerGroup,
  StaggerChild,
  ScaleOnHover,
  PageTransition,
  ParallaxScroll,
  TextReveal,
  GlowPulse,
} from '@/components/motion';

/**
 * Homepage — editorial / premium aesthetic with a looping Sora-generated
 * drone-style hero video. Palette is warm (cream on warm near-black) to
 * harmonize with the golden-hour footage rather than fight it with cold black.
 */
export function Homepage() {
  const router = useRouter();
  const setDescription = useStudioStore((s) => s.setDescription);

  const handleChipClick = (text: string): void => {
    setDescription(text);
    router.push('/studio');
  };

  const handleGetStarted = (): void => {
    router.push('/studio');
  };

  return (
    <SmoothScroll>
    <PageTransition>
    <main className="relative min-h-screen overflow-hidden">
      {/* Background: looping Sora-generated footage, subtle warm overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-warm">
        <video
          className="bg-video"
          src="/homepage-bg.mp4?v=sora-2"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        {/* Gentle atmospheric darken — minimal, preserves footage crispness */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(13,10,8,0.08) 0%, rgba(13,10,8,0.18) 55%, rgba(13,10,8,0.32) 100%)',
          }}
        />
        {/* Very light grain — film-like, not noise */}
        <div className="grain absolute inset-0 opacity-[0.08]" />
      </div>

      {/* Nav */}
      <nav className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex items-center gap-2.5">
          <div className="h-4 w-4 rounded-[3px]" style={{ backgroundColor: '#f3ead9' }} />
          <span className="text-sm font-medium tracking-tight text-warm">sitesculpt</span>
        </div>
        <div className="flex items-center gap-4 text-[12px] text-warm-muted sm:gap-7 sm:text-[13px]">
          <a href="#pipeline" className="hidden transition hover:text-warm sm:inline">
            Pipeline
          </a>
          <a href="#principles" className="hidden transition hover:text-warm sm:inline">
            Principles
          </a>
          <a
            href="/get-started"
            className="rounded-full border border-[rgba(243,234,217,0.2)] px-3.5 py-1.5 text-warm transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] sm:px-4"
          >
            Get started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-20 mx-auto flex min-h-[82vh] max-w-4xl flex-col items-center justify-center px-6 py-20 text-center sm:px-8">
        <FadeIn delay={0.2} y={30}>
          <h1 className="mb-10 font-serif text-[56px] leading-[0.95] tracking-[-0.02em] text-warm sm:mb-12 sm:text-[88px] sm:leading-[0.92] md:text-[128px]">
            Start{' '}
            <em className="italic" style={{ color: '#f5d9a8' }}>
              sculpting.
            </em>
          </h1>
        </FadeIn>

        <FadeIn delay={0.5} y={20}>
          <div className="flex flex-col items-center gap-6">
            <GlowPulse color="#e8b874">
              <ScaleOnHover>
                <button
                  onClick={handleGetStarted}
                  className="rounded-full px-7 py-3.5 text-[14px] font-medium text-[#0d0a08] transition"
                  style={{ backgroundColor: '#e8b874' }}
                >
                  Start your project →
                </button>
              </ScaleOnHover>
            </GlowPulse>
            <StaggerGroup className="flex flex-wrap justify-center gap-2" stagger={0.05}>
              {[
                'Editorial fashion house',
                'Restrained SaaS landing',
                'Art gallery portfolio',
                'AI research lab',
              ].map((chip) => (
                <StaggerChild key={chip}>
                  <ScaleOnHover scale={1.05}>
                    <button
                      onClick={() => handleChipClick(chip)}
                      className="rounded-full border border-[rgba(243,234,217,0.12)] bg-[rgba(243,234,217,0.025)] px-3 py-1.5 text-[11px] text-warm-muted backdrop-blur transition hover:border-[rgba(243,234,217,0.25)] hover:text-warm"
                    >
                      {chip}
                    </button>
                  </ScaleOnHover>
                </StaggerChild>
              ))}
            </StaggerGroup>
          </div>
        </FadeIn>
      </section>

      {/* Reading surface — everything below the hero sits on warm near-black,
          with a soft gradient fade that reaches UP into the hero for a smooth
          handoff from the video to the editorial sections. */}
      <div className="relative z-10 bg-warm">
        {/* Fade overlay — long generous gradient reaching up into the hero
            for a silky handoff from the video to the reading surface. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-80 h-80"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, rgba(13,10,8,0.1) 25%, rgba(13,10,8,0.3) 50%, rgba(13,10,8,0.65) 75%, rgba(13,10,8,0.92) 92%, #0d0a08 100%)',
          }}
        />

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
                  <div className="mb-10 text-[11px] font-mono tracking-wider text-warm-subtle">
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
    </SmoothScroll>
  );
}
