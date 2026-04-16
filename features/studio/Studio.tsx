'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStudioStore, type PaletteOption, type ConceptOption } from './store';
import { GuidedForm } from './GuidedForm';
import { ArtDirection } from './ArtDirection';
import { KeyframeApproval } from './KeyframeApproval';
import { ScrollFlipbook } from './ScrollFlipbook';
import { ExportButton } from './ExportButton';
import { savePersistedProject, debounce } from './persistence';
import { compilePrompt } from './compilePrompt';
import { FunnelNav } from './FunnelNav';
import { SidebarTabs } from './SidebarTabs';
import { errorMessage } from './api-helpers';
import type { Aspect, Scene, SiteStructure } from '@/features/pipeline/types';
import type { ProjectStatus } from '@/lib/cache';

export function Studio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const description = useStudioStore((s) => s.description);
  const aspect = useStudioStore((s) => s.aspect);
  const projectId = useStudioStore((s) => s.projectId);
  const state = useStudioStore((s) => s.state);
  const steps = useStudioStore((s) => s.steps);
  const scene = useStudioStore((s) => s.scene);
  const site = useStudioStore((s) => s.site);
  const frameCount = useStudioStore((s) => s.frameCount);
  const heroOverride = useStudioStore((s) => s.heroOverride);
  const startGeneration = useStudioStore((s) => s.startGeneration);
  const applyStatus = useStudioStore((s) => s.applyStatus);
  const setScene = useStudioStore((s) => s.setScene);
  const setSite = useStudioStore((s) => s.setSite);
  const setFrameCount = useStudioStore((s) => s.setFrameCount);
  const setHeroOverride = useStudioStore((s) => s.setHeroOverride);
  const brandOverride = useStudioStore((s) => s.brandOverride);
  const setBrandOverride = useStudioStore((s) => s.setBrandOverride);
  const sectionOverrides = useStudioStore((s) => s.sectionOverrides);
  const setSectionOverride = useStudioStore((s) => s.setSectionOverride);
  const reset = useStudioStore((s) => s.reset);

  // Funnel state
  const funnelStep = useStudioStore((s) => s.funnelStep);
  const setFunnelStep = useStudioStore((s) => s.setFunnelStep);
  const setPaletteOptions = useStudioStore((s) => s.setPaletteOptions);
  const setConceptOptions = useStudioStore((s) => s.setConceptOptions);
  const selectedPaletteIdx = useStudioStore((s) => s.selectedPaletteIdx);
  const selectedConceptIdx = useStudioStore((s) => s.selectedConceptIdx);
  const paletteOptions = useStudioStore((s) => s.paletteOptions);
  const conceptOptions = useStudioStore((s) => s.conceptOptions);
  const userData = useStudioStore((s) => s.userData);
  const brandName = useStudioStore((s) => s.brandName);
  const toneId = useStudioStore((s) => s.toneId);
  const paletteMode = useStudioStore((s) => s.paletteMode);
  const customPalette = useStudioStore((s) => s.customPalette);
  const includedPages = useStudioStore((s) => s.includedPages);
  const attachedMedia = useStudioStore((s) => s.attachedMedia);

  const [funnelBusy, setFunnelBusy] = useState(false);

  const esRef = useRef<EventSource | null>(null);

  // Listen for inline edits from the preview iframe
  useEffect(() => {
    const handler = (ev: MessageEvent) => {
      if (!ev.data || ev.data.type !== 'sitesculpt-edit') return;
      const { path, value } = ev.data as { path: string; value: string };
      if (!value || !path) return;

      if (path === 'brandName') {
        setBrandOverride(value);
      } else if (path === 'hero.headline') {
        setHeroOverride({ headline: value });
      } else if (path === 'hero.subheadline') {
        setHeroOverride({ subheadline: value });
      } else if (path === 'hero.ctaPrimary') {
        setHeroOverride({ ctaPrimary: value });
      } else if (path === 'hero.ctaSecondary') {
        setHeroOverride({ ctaSecondary: value });
      } else if (path.startsWith('sections.')) {
        const parts = path.split('.');
        const idx = parseInt(parts[1] ?? '', 10);
        const field = parts[2];
        if (!isNaN(idx) && field) {
          setSectionOverride(idx, { [field]: value });
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [setBrandOverride, setHeroOverride, setSectionOverride]);

  // Resume an existing project from ?project=<id> — jobs/[id] sends a
  // snapshot on connect so finished projects rehydrate immediately.
  const resumedRef = useRef(false);
  useEffect(() => {
    if (resumedRef.current) return;
    const urlProjectId = searchParams?.get('project');
    if (!urlProjectId || urlProjectId === projectId) return;
    resumedRef.current = true;
    startGeneration(urlProjectId);
    subscribe(urlProjectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Push project id into URL so reload/share restores state.
  useEffect(() => {
    if (!projectId) return;
    const current = searchParams?.get('project');
    if (current === projectId) return;
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('project', projectId);
    router.replace(`/studio?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Debounced IndexedDB save
  const saveDebounced = useRef(
    debounce((data: { projectId: string; prompt: string; aspect: Aspect; heroOverride: typeof heroOverride }) => {
      void savePersistedProject({
        projectId: data.projectId,
        prompt: data.prompt,
        aspect: data.aspect,
        heroOverride: data.heroOverride,
        updatedAt: Date.now(),
      });
    }, 500),
  ).current;

  useEffect(() => {
    if (!projectId) return;
    saveDebounced({ projectId, prompt: description, aspect, heroOverride });
  }, [projectId, description, aspect, heroOverride, saveDebounced]);

  // ─── Funnel step handlers ─────────────────────────────────────────────

  /** Step 1 → 2: submit brief, get art direction options from Claude */
  const handleBriefSubmit = async (compiledPrompt: string, a: Aspect): Promise<void> => {
    setFunnelBusy(true);
    try {
      const res = await fetch('/api/art-direction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: compiledPrompt }),
      });
      if (!res.ok) {
        alert(`Art direction failed: ${await errorMessage(res, 'Failed')}`);
        return;
      }
      const { options } = (await res.json()) as {
        options: Array<{ palette: PaletteOption; concept: ConceptOption }>;
      };
      setPaletteOptions(options.map((o) => o.palette));
      setConceptOptions(options.map((o) => o.concept));
      setFunnelStep('art-direction');
    } finally {
      setFunnelBusy(false);
    }
  };

  /** Step 2 → 3: generate keyframe from chosen concept + palette */
  const handleArtDirectionContinue = async (): Promise<void> => {
    if (selectedPaletteIdx === null || selectedConceptIdx === null) return;
    if (!conceptOptions || !paletteOptions) return;
    const concept = conceptOptions[selectedConceptIdx];
    const palette = paletteOptions[selectedPaletteIdx];
    if (!concept || !palette) return;

    setFunnelBusy(true);
    setFunnelStep('keyframe');
    try {
      const res = await fetch('/api/generate-keyframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visualPrompt: concept.visualPrompt,
          motionPrompt: concept.motionPrompt,
          concept: concept.title,
          palette,
          aspect,
        }),
      });
      if (!res.ok) {
        alert('Keyframe generation failed');
        setFunnelStep('art-direction');
        return;
      }
      const { projectId: pid } = (await res.json()) as { projectId: string };
      startGeneration(pid);

      setScene({
        visualPrompt: concept.visualPrompt,
        motionPrompt: concept.motionPrompt,
        palette,
        concept: concept.title,
      });
    } finally {
      setFunnelBusy(false);
    }
  };

  /** Step 3 → 4: approve keyframe, generate copy + structure */
  const handleKeyframeApprove = async (): Promise<void> => {
    if (!projectId) return;
    setFunnelBusy(true);
    setFunnelStep('copy-review');
    try {
      const chosenPalette = selectedPaletteIdx !== null ? paletteOptions?.[selectedPaletteIdx] : null;
      const compiled = compilePrompt({
        brandName,
        description,
        toneId,
        paletteMode: chosenPalette ? 'custom' : paletteMode,
        customPalette: chosenPalette ?? customPalette,
        includedPages,
        userData,
        hasAttachedImage: attachedMedia?.kind === 'image',
        hasAttachedVideo: attachedMedia?.kind === 'video',
      });

      // Motion runs 2-4min; don't block copy/structure. Preview picks up
      // frames via SSE when ready.
      const motionPromise = fetch('/api/generate-motion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      }).then(async (r) => {
        if (!r.ok) return;
        const { frameCount } = (await r.json()) as { frameCount: number };
        setFrameCount(frameCount);
      }).catch(() => {
        // Motion failed — preview falls back to Ken Burns on keyframe
      });

      // composeSite returns in ~30s so copy lands before motion finishes.
      const res = await fetch('/api/compose-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: compiled, projectId }),
      });
      if (!res.ok) {
        alert('Copy generation failed');
        setFunnelStep('keyframe');
        return;
      }
      const { site: siteData } = (await res.json()) as { site: SiteStructure };
      setSite(siteData);

      // motionPromise runs in background; preview updates when frames land.
      void motionPromise;
    } finally {
      setFunnelBusy(false);
    }
  };

  /** Step 3: regenerate keyframe with same concept */
  const handleKeyframeRegenerate = async (): Promise<void> => {
    await handleArtDirectionContinue();
  };

  /** Step 4 → 5: approve structure, render full preview */
  const handleStructureApprove = (): void => {
    if (!projectId) return;
    setFunnelStep('preview');
    window.open(`/preview/${projectId}`, '_blank');
  };

  const subscribe = (id: string): void => {
    esRef.current?.close();
    const es = new EventSource(`/api/jobs/${id}`);
    esRef.current = es;

    let sceneFetched = false;
    let siteFetched = false;
    let framesFetched = false;

    es.addEventListener('message', (ev) => {
      const payload = JSON.parse((ev as MessageEvent<string>).data) as
        | { type: 'status'; status: ProjectStatus }
        | { type: 'end'; ok: boolean; reason?: string };

      if (payload.type === 'status') {
        applyStatus({ steps: payload.status.steps, failed: payload.status.failed });

        if (!sceneFetched && payload.status.steps.expandPrompt.state === 'done') {
          sceneFetched = true;
          void fetchJson<Scene>(`/api/preview/${id}/artifact/scene`).then((s) => {
            if (s) setScene(s);
          });
        }
        if (!siteFetched && payload.status.steps.composeSite.state === 'done') {
          siteFetched = true;
          void fetchJson<SiteStructure>(`/api/preview/${id}/artifact/site`).then((s) => {
            if (s) setSite(s);
          });
        }
        if (!framesFetched && payload.status.steps.extractFrames.state === 'done') {
          framesFetched = true;
          void fetchJson<{ count: number }>(`/api/preview/${id}/artifact/frames-count`).then(
            (c) => {
              if (c) setFrameCount(c.count);
            },
          );
        }
      }
      if (payload.type === 'end') {
        es.close();
      }
    });

    es.addEventListener('error', () => {
      es.close();
    });
  };

  // ─── Derived state ───────────────────────────────────────────────────────

  const hasKeyframe = steps.generateImage.state === 'done';
  const hasFrames = frameCount > 0 && steps.extractFrames.state === 'done';
  const statusLabel: Record<typeof state, string> = {
    idle: 'Ready',
    running: 'Generating',
    done: 'Complete',
    error: 'Failed',
  };
  const statusColor: Record<typeof state, string> = {
    idle: 'var(--color-fg-muted)',
    running: '#e8b874',
    done: '#78c2a4',
    error: '#e56b6f',
  };

  const currentHeadline = heroOverride.headline ?? site?.hero.headline ?? 'Your cinematic headline';
  const currentSubheadline =
    heroOverride.subheadline ?? site?.hero.subheadline ?? 'Your subheadline will appear the moment our engine finishes composing the copy.';

  return (
    <main className="relative min-h-screen bg-warm text-warm">
      {/* ─── Top bar — higher contrast bg so buttons don't blend ─── */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--color-border)] bg-[rgba(13,10,8,0.95)] px-5 py-3 backdrop-blur-lg sm:px-8">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2.5 text-sm font-medium tracking-tight text-warm hover:opacity-90"
          >
            <div className="h-4 w-4 rounded-[3px]" style={{ backgroundColor: '#f3ead9' }} />
            sitesculpt
          </button>
          {projectId ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: statusColor[state] }}
              />
              <span className="font-mono text-[11px] tracking-wider text-warm-muted">
                {statusLabel[state]}
              </span>
              <span className="font-mono text-[10px] text-warm-subtle">·</span>
              <span className="font-mono text-[10px] text-warm-subtle">
                {projectId.slice(0, 10)}
              </span>
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {projectId && state === 'done' ? (
            <a
              href={`/preview/${projectId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3.5 py-1.5 text-[12px] font-medium text-warm transition hover:bg-[var(--color-accent)] hover:text-[#0d0a08]"
              title="Open the full site in a new tab"
            >
              Open full preview ↗
            </a>
          ) : null}
          {state !== 'idle' ? (
            <button
              onClick={reset}
              className="hidden rounded-full border border-[var(--color-border-strong)] px-3.5 py-1.5 text-[12px] text-warm-muted transition hover:border-[var(--color-accent)] hover:text-warm sm:inline"
              title="Edit prompt and regenerate"
            >
              Revise
            </button>
          ) : null}
          <ExportButton />
        </div>
      </header>

      <FunnelNav />

      {/* Steps 4+5: Full-width preview with floating editor panel */}
      {(funnelStep === 'copy-review' || funnelStep === 'preview') && (
        <div className="relative" style={{ height: 'calc(100vh - 110px)' }}>
          {projectId && site ? (
            <iframe
              key={`preview-${projectId}-${site.hero.headline.slice(0, 10)}-frames${frameCount}`}
              src={`/preview/${projectId}?edit=1`}
              className="h-full w-full border-0"
              title="Site preview"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
              <div className="text-[13px] text-warm-muted">Building your site…</div>
              <div className="text-[11px] text-warm-subtle">Writing copy and structuring sections</div>
            </div>
          )}
          <div className="absolute right-0 top-0 z-20 flex h-full w-[380px] flex-col border-l border-[var(--color-border)] bg-[rgba(13,10,8,0.95)] backdrop-blur-xl">
            <SidebarTabs
              funnelStep={funnelStep}
              site={site}
              scene={scene}
              state={state}
              sectionOverrides={sectionOverrides}
              setSectionOverride={setSectionOverride}
              onStructureApprove={handleStructureApprove}
              funnelBusy={funnelBusy}
            />
          </div>
        </div>
      )}

      {funnelStep !== 'copy-review' && funnelStep !== 'preview' ? (
        <div className="grid grid-cols-1 gap-5 p-5 sm:gap-6 sm:p-6 lg:grid-cols-[1fr_340px]">
        <section className="relative flex min-h-[72vh] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[rgba(243,234,217,0.012)]">
          {funnelStep === 'brief' ? (
            <div className="flex flex-1 flex-col items-center gap-6 overflow-y-auto p-6 sm:gap-8 sm:p-10">
              <div className="mt-2 flex max-w-md flex-col items-center text-center">
                <h2 className="mb-3 font-serif text-3xl leading-[1] tracking-[-0.02em] text-warm sm:text-4xl">
                  What are we{' '}
                  <em className="italic" style={{ color: '#f5d9a8' }}>
                    sculpting?
                  </em>
                </h2>
                <p className="max-w-sm text-[13px] leading-relaxed text-warm-muted">
                  A few quick details — our engine sculpts the copy, the cinematic, and the
                  production-ready code. The more you tell us, the sharper the result.
                </p>
              </div>
              <GuidedForm onSubmit={handleBriefSubmit} busy={funnelBusy} />
              <div className="mb-2 flex items-center gap-2 font-mono text-[10px] tracking-wider text-warm-subtle">
                <kbd className="rounded border border-[var(--color-border-strong)] bg-[rgba(243,234,217,0.04)] px-1.5 py-0.5">
                  ⌘
                </kbd>
                <kbd className="rounded border border-[var(--color-border-strong)] bg-[rgba(243,234,217,0.04)] px-1.5 py-0.5">
                  ↵
                </kbd>
                <span>to generate</span>
              </div>
            </div>

          ) : funnelStep === 'art-direction' ? (
            <ArtDirection
              onContinue={handleArtDirectionContinue}
              busy={funnelBusy}
            />

          ) : funnelStep === 'keyframe' ? (
            <KeyframeApproval
              onApprove={handleKeyframeApprove}
              onRegenerate={handleKeyframeRegenerate}
              busy={funnelBusy}
            />

          ) : (
            <div className="relative flex-1 overflow-hidden">
              {hasFrames && projectId ? (
                <ScrollFlipbook
                  frameUrl={(n) => `/api/preview/${projectId}/frames/${n}`}
                  frameCount={frameCount}
                  scrollVh={100}
                  backgroundColor={scene?.palette.background ?? '#0d0a08'}
                />
              ) : hasKeyframe && projectId ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(/api/preview/${projectId}/keyframe)` }}
                />
              ) : scene ? (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${scene.palette.background}, ${scene.palette.accent}40)`,
                  }}
                />
              ) : (
                <PreviewPlaceholder />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(13,10,8,0.65)]" />

              {site ? (
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 sm:p-10">
                  <div className="pointer-events-auto">
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const next = (e.currentTarget.textContent ?? '').trim();
                        setBrandOverride(next && next !== site.brandName ? next : null);
                      }}
                      className="inline-block rounded-full border border-[rgba(243,234,217,0.2)] bg-[rgba(13,10,8,0.5)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-warm backdrop-blur outline-none focus:border-[var(--color-accent)]"
                    >
                      {brandOverride ?? site.brandName}
                    </span>
                  </div>
                  <div className="pointer-events-auto max-w-2xl space-y-3">
                    <h1
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        setHeroOverride({ headline: e.currentTarget.textContent ?? undefined })
                      }
                      className="font-serif text-4xl leading-[1] tracking-[-0.02em] text-warm outline-none sm:text-5xl md:text-6xl"
                      style={{ textShadow: '0 2px 24px rgba(0,0,0,0.5)' }}
                    >
                      {currentHeadline}
                    </h1>
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        setHeroOverride({ subheadline: e.currentTarget.textContent ?? undefined })
                      }
                      className="max-w-lg text-[14px] leading-relaxed text-warm-muted outline-none sm:text-[15px]"
                      style={{ textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
                    >
                      {currentSubheadline}
                    </p>
                    {site.hero.ctaPrimary ? (
                      <button
                        className="rounded-md px-5 py-2.5 text-[13px] font-medium text-[#0d0a08]"
                        style={{ backgroundColor: scene?.palette.accent ?? '#e8b874' }}
                      >
                        {site.hero.ctaPrimary}
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </section>

        {/* ── Right: Tabbed sidebar (non-preview steps) ── */}
        <SidebarTabs
          funnelStep={funnelStep}
          site={site}
          scene={scene}
          state={state}
          sectionOverrides={sectionOverrides}
          setSectionOverride={setSectionOverride}
          onStructureApprove={handleStructureApprove}
          funnelBusy={funnelBusy}
        />
      </div>
      ) : null}
    </main>


  );
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function PreviewPlaceholder() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(232,184,116,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(232,184,116,0.04) 0%, transparent 60%), #0d0a08',
      }}
    />
  );
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
