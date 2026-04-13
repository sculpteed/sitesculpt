'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStudioStore } from './store';
import { GuidedForm } from './GuidedForm';
import { ArtDirection } from './ArtDirection';
import { KeyframeApproval } from './KeyframeApproval';
import { StructureReview } from './StructureReview';
import { PipelinePanel } from './PipelinePanel';
import { ScrollFlipbook } from './ScrollFlipbook';
import { ExportButton } from './ExportButton';
import { savePersistedProject, debounce } from './persistence';
import { compilePrompt } from './compilePrompt';
import { SmoothScroll, PageTransition } from '@/components/motion';
import type { Aspect, Scene, SiteStructure } from '@/features/pipeline/types';
import type { ProjectStatus } from '@/lib/cache';

/**
 * Studio — single project workspace.
 *
 * Layout (desktop ≥ lg):
 *   ┌─ Top bar ──────────────────────────────────────────┐
 *   │ sitesculpt · project status            [Export]    │
 *   ├─ Preview (left, 2/3) ──┬─ Context rail (right) ──┤
 *   │                        │ Pipeline                 │
 *   │   Flipbook / keyframe  │ Site structure           │
 *   │   Hero copy overlay    │ Scene + palette          │
 *   │                        │ Project info             │
 *   └────────────────────────┴─────────────────────────┘
 *
 * On mobile: preview stacks above a single scrollable rail.
 *
 * Design goals (contra Draftly):
 * - One primary action per screen, not three overlapping entry points.
 * - No paywall banner. No vanity chips. No fake tech stack picker.
 * - Pipeline shows REAL progress, not a static diagram.
 * - Preview grows richer as steps complete (gradient → keyframe → flipbook).
 */
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
  const autoStartRef = useRef(false);

  // Resume an existing project from the URL: /studio?project=<id>
  // On mount, if ?project= is present, open an SSE subscription to that
  // project id. The /api/jobs/[id] endpoint now sends a snapshot on
  // connect, so finished projects will immediately rehydrate state.
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

  // When a NEW generation starts, push the project id into the URL so a
  // reload or share restores exactly where we were.
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
        const { error } = (await res.json().catch(() => ({ error: 'Failed' }))) as { error?: string };
        alert(`Art direction failed: ${error ?? res.statusText}`);
        return;
      }
      const { options } = (await res.json()) as {
        options: Array<{
          palette: { name: string; background: string; foreground: string; accent: string };
          concept: { title: string; description: string; visualPrompt: string; motionPrompt: string };
        }>;
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
      // Generate the keyframe via the existing image endpoint
      const res = await fetch('/api/generate-keyframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visualPrompt: concept.visualPrompt,
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

      // Also set the scene in the store so downstream steps can use it
      setScene({
        visualPrompt: concept.visualPrompt,
        motionPrompt: concept.motionPrompt,
        palette: { background: palette.background, foreground: palette.foreground, accent: palette.accent },
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
      // Compile the brief with the chosen palette baked in
      const chosenPalette = selectedPaletteIdx !== null ? paletteOptions?.[selectedPaletteIdx] : null;
      const compiled = compilePrompt({
        brandName,
        description,
        toneId,
        paletteMode: chosenPalette ? 'custom' : paletteMode,
        customPalette: chosenPalette
          ? { background: chosenPalette.background, foreground: chosenPalette.foreground, accent: chosenPalette.accent }
          : customPalette,
        includedPages,
        userData,
        hasAttachedImage: attachedMedia?.kind === 'image',
        hasAttachedVideo: attachedMedia?.kind === 'video',
      });

      // Call composeSite via a dedicated endpoint
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
    } finally {
      setFunnelBusy(false);
    }
  };

  /** Step 3: regenerate keyframe with same concept */
  const handleKeyframeRegenerate = async (): Promise<void> => {
    // Same as handleArtDirectionContinue but forces a new variation
    await handleArtDirectionContinue();
  };

  /** Step 4 → 5: approve structure, render full preview */
  const handleStructureApprove = (): void => {
    if (!projectId) return;
    setFunnelStep('preview');
    // The preview is already at /preview/[projectId] — just navigate
    // or render inline. For now, open in a new tab.
    window.open(`/preview/${projectId}`, '_blank');
  };

  const handleSubmit = async (p: string, a: Aspect): Promise<void> => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: p, aspect: a }),
    });
    if (res.status === 402) {
      const body = (await res.json().catch(() => ({ error: 'subscription_required' }))) as {
        error?: string;
        message?: string;
        used?: number;
        limit?: number;
        tier?: string;
      };
      if (body.error === 'quota_exceeded') {
        // Starter cap hit — offer upgrade to Pro instead of a bare pricing bounce
        alert(
          `${body.message ?? 'Monthly quota reached.'}\n\nUpgrade to Pro for unlimited generations.`,
        );
        router.push('/pricing?from=studio&quota=1');
        return;
      }
      // Subscription required — redirect to pricing
      router.push('/pricing?from=studio');
      return;
    }
    if (!res.ok) {
      const { error } = (await res.json().catch(() => ({ error: 'Request failed' }))) as {
        error?: string;
      };
      alert(`Generation failed: ${error ?? res.statusText}`);
      return;
    }
    const { projectId: id } = (await res.json()) as { projectId: string };
    startGeneration(id);
    subscribe(id);
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
      {/* ─── Top bar ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--color-border)] bg-[rgba(13,10,8,0.88)] px-5 py-3 backdrop-blur-lg sm:px-8">
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

      {/* ─── Body — funnel step router ────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 p-5 sm:gap-6 sm:p-6 lg:grid-cols-[1fr_380px]">
        {/* ── Left: Main content area ── */}
        <section className="relative flex min-h-[72vh] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[rgba(243,234,217,0.012)]">
          {funnelStep === 'brief' ? (
            // ─── Step 1: Brief (GuidedForm) ───
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
            // ─── Step 2: Art Direction picker ───
            <ArtDirection
              onContinue={handleArtDirectionContinue}
              busy={funnelBusy}
            />

          ) : funnelStep === 'keyframe' ? (
            // ─── Step 3: Keyframe approval ───
            <KeyframeApproval
              onApprove={handleKeyframeApprove}
              onRegenerate={handleKeyframeRegenerate}
              busy={funnelBusy}
            />

          ) : funnelStep === 'copy-review' ? (
            // ─── Step 4: Structure review ───
            <StructureReview
              onApprove={handleStructureApprove}
              busy={funnelBusy}
            />

          ) : (
            // ─── Running / done state ───
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

        {/* ── Right: Context rail ── */}
        <aside className="flex flex-col gap-4">
          <PipelinePanel />
          {site ? (
            <SiteStructureCard
              site={site}
              overrides={sectionOverrides}
              onEdit={setSectionOverride}
            />
          ) : null}
          {scene ? <SceneCard scene={scene} /> : null}
          {state === 'running' ? <TipCard /> : null}
        </aside>
      </div>
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

function SiteStructureCard({
  site,
  overrides,
  onEdit,
}: {
  site: SiteStructure;
  overrides: Record<number, Partial<SiteStructure['sections'][number]>>;
  onEdit: (index: number, patch: Partial<SiteStructure['sections'][number]>) => void;
}) {
  const editedCount = Object.keys(overrides).length;
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(243,234,217,0.012)] p-4">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-warm-subtle">
          Sections
        </span>
        <span className="font-mono text-[10px] text-warm-subtle">
          {editedCount > 0 ? `${editedCount} edited · ` : ''}
          {site.sections.length} total
        </span>
      </div>
      <p className="mb-3 text-[10px] text-warm-subtle">
        Click any title or paragraph to edit — changes ship with the export.
      </p>
      <ul className="space-y-3">
        {site.sections.map((s, i) => {
          const ov = overrides[i] ?? {};
          const title = ov.title ?? s.title;
          const body = ov.body ?? s.body;
          const itemCount = s.items?.length ?? 0;
          return (
            <li
              key={i}
              className="group rounded-md border border-transparent pl-3 transition hover:border-[var(--color-border)] hover:bg-[rgba(243,234,217,0.02)]"
              style={{ borderLeftColor: 'var(--color-border-strong)', borderLeftWidth: '2px' }}
            >
              <div className="py-2">
                <div className="mb-1 flex items-center gap-1.5">
                  <span
                    className="rounded-sm px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                    style={{
                      backgroundColor: 'var(--color-accent-soft)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    {s.layout}
                  </span>
                  {itemCount > 0 ? (
                    <span className="font-mono text-[9px] text-warm-subtle">{itemCount} items</span>
                  ) : null}
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const next = (e.currentTarget.textContent ?? '').trim();
                    onEdit(i, { title: next || s.title });
                  }}
                  className="text-[13px] font-medium text-warm outline-none focus:text-[var(--color-accent)]"
                >
                  {title}
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const next = (e.currentTarget.textContent ?? '').trim();
                    onEdit(i, { body: next || s.body });
                  }}
                  className="mt-0.5 text-[11px] leading-relaxed text-warm-muted outline-none focus:text-warm"
                >
                  {body}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SceneCard({ scene }: { scene: Scene }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(243,234,217,0.012)] p-4">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-warm-subtle">
        Scene
      </div>
      <div className="mb-3 text-[12px] italic text-warm-muted">&ldquo;{scene.concept}&rdquo;</div>
      <div className="flex gap-1.5">
        {[scene.palette.background, scene.palette.foreground, scene.palette.accent].map(
          (color, i) => (
            <div
              key={i}
              className="h-8 flex-1 rounded-md border border-[var(--color-border)]"
              style={{ backgroundColor: color }}
              title={color}
            />
          ),
        )}
      </div>
    </div>
  );
}

function TipCard() {
  return (
    <div className="rounded-xl border border-[var(--color-accent)] bg-[var(--color-accent-soft)] p-4">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-accent)]">
        While you wait
      </div>
      <p className="text-[12px] leading-relaxed text-warm-muted">
        Your copy lands in seconds — click the headline or subheadline to edit them inline. Your
        changes save automatically and ship with the exported project.
      </p>
    </div>
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
