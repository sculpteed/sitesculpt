'use client';

import { useStudioStore, type PaletteOption, type ConceptOption } from './store';
import { FadeIn, StaggerGroup, StaggerChild, ScaleOnHover } from '@/components/motion';
import { Check } from 'lucide-react';

interface ArtDirectionProps {
  onContinue: () => void;
  busy?: boolean;
}

/**
 * Step 2 of the funnel — Art Direction picker.
 *
 * Shows 3 distinct visual directions (palette + hero concept) from Claude.
 * User picks one of each (or the same paired option). This is where the user
 * exercises creative control BEFORE any expensive generation happens.
 *
 * Cost: ~$0.001 (one Claude call produced these options)
 * Impact: DRAMATIC — prevents "I hate the palette/image Claude picked" entirely
 */
export function ArtDirection({ onContinue, busy = false }: ArtDirectionProps) {
  const paletteOptions = useStudioStore((s) => s.paletteOptions);
  const conceptOptions = useStudioStore((s) => s.conceptOptions);
  const selectedPaletteIdx = useStudioStore((s) => s.selectedPaletteIdx);
  const selectedConceptIdx = useStudioStore((s) => s.selectedConceptIdx);
  const setSelectedPaletteIdx = useStudioStore((s) => s.setSelectedPaletteIdx);
  const setSelectedConceptIdx = useStudioStore((s) => s.setSelectedConceptIdx);

  if (!paletteOptions || !conceptOptions) return null;

  const canContinue = selectedPaletteIdx !== null && selectedConceptIdx !== null && !busy;

  return (
    <div className="flex flex-1 flex-col gap-10 overflow-y-auto p-6 sm:p-10">
      {/* Header */}
      <FadeIn>
        <div className="flex max-w-2xl flex-col gap-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-warm-subtle">
            <span className="inline-block h-px w-6 bg-[var(--color-border-strong)]" />
            <span>Step 2 of 4</span>
            <span className="inline-block h-px w-6 bg-[var(--color-border-strong)]" />
          </div>
          <h2 className="font-serif text-3xl leading-[1] tracking-[-0.02em] text-warm sm:text-4xl">
            Pick your{' '}
            <em className="italic" style={{ color: '#f5d9a8' }}>
              direction.
            </em>
          </h2>
          <p className="max-w-md text-[13px] leading-relaxed text-warm-muted">
            Three distinct visual directions. Pick the palette and hero concept that best
            represents your brand. You can mix and match.
          </p>
        </div>
      </FadeIn>

      {/* Palette options */}
      <div>
        <FadeIn delay={0.1}>
          <div className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-warm">
            Color palette
          </div>
        </FadeIn>
        <StaggerGroup className="grid gap-3 sm:grid-cols-3" stagger={0.08}>
          {paletteOptions.map((palette, i) => {
            const selected = selectedPaletteIdx === i;
            return (
              <StaggerChild key={i}>
                <ScaleOnHover scale={1.02}>
                  <button
                    type="button"
                    onClick={() => setSelectedPaletteIdx(i)}
                    className={`relative w-full rounded-xl border p-4 text-left transition ${
                      selected
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                        : 'border-[var(--color-border)] bg-[rgba(243,234,217,0.01)] hover:border-[var(--color-border-strong)]'
                    }`}
                  >
                    {selected ? (
                      <div className="absolute right-3 top-3">
                        <Check className="h-4 w-4 text-[var(--color-accent)]" />
                      </div>
                    ) : null}
                    {/* Color swatches */}
                    <div className="mb-3 flex gap-1.5">
                      <div
                        className="h-10 flex-1 rounded-lg"
                        style={{ backgroundColor: palette.background }}
                      />
                      <div
                        className="h-10 flex-1 rounded-lg"
                        style={{ backgroundColor: palette.foreground }}
                      />
                      <div
                        className="h-10 flex-1 rounded-lg"
                        style={{ backgroundColor: palette.accent }}
                      />
                    </div>
                    <div className="text-[13px] font-medium text-warm">{palette.name}</div>
                    <div className="mt-1 flex gap-2 font-mono text-[9px] text-warm-subtle">
                      <span>{palette.background}</span>
                      <span>{palette.foreground}</span>
                      <span>{palette.accent}</span>
                    </div>
                  </button>
                </ScaleOnHover>
              </StaggerChild>
            );
          })}
        </StaggerGroup>
      </div>

      {/* Concept options */}
      <div>
        <FadeIn delay={0.2}>
          <div className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-warm">
            Hero concept
          </div>
        </FadeIn>
        <StaggerGroup className="grid gap-3 sm:grid-cols-3" stagger={0.08}>
          {conceptOptions.map((concept, i) => {
            const selected = selectedConceptIdx === i;
            // Use the paired palette for the preview tint if available
            const palette = paletteOptions[i];
            return (
              <StaggerChild key={i}>
                <ScaleOnHover scale={1.02}>
                  <button
                    type="button"
                    onClick={() => setSelectedConceptIdx(i)}
                    className={`relative w-full rounded-xl border p-4 text-left transition ${
                      selected
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                        : 'border-[var(--color-border)] bg-[rgba(243,234,217,0.01)] hover:border-[var(--color-border-strong)]'
                    }`}
                  >
                    {selected ? (
                      <div className="absolute right-3 top-3">
                        <Check className="h-4 w-4 text-[var(--color-accent)]" />
                      </div>
                    ) : null}
                    {/* Visual preview — gradient tint from the paired palette */}
                    <div
                      className="mb-3 h-24 rounded-lg"
                      style={{
                        background: palette
                          ? `linear-gradient(135deg, ${palette.background}, ${palette.accent}33)`
                          : 'var(--color-bg-elevated)',
                      }}
                    />
                    <div className="text-[13px] font-medium text-warm">{concept.title}</div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-warm-muted">
                      {concept.description}
                    </p>
                  </button>
                </ScaleOnHover>
              </StaggerChild>
            );
          })}
        </StaggerGroup>
      </div>

      {/* Continue button */}
      <FadeIn delay={0.3}>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            className="rounded-full px-7 py-3 text-[14px] font-medium text-[#0d0a08] transition disabled:cursor-not-allowed disabled:opacity-25"
            style={{ backgroundColor: '#e8b874' }}
          >
            {busy ? 'Generating keyframe…' : 'Continue with this direction →'}
          </button>
          {selectedPaletteIdx !== null && selectedConceptIdx !== null ? (
            <span className="text-[11px] text-warm-subtle">
              {paletteOptions[selectedPaletteIdx]?.name} ·{' '}
              {conceptOptions[selectedConceptIdx]?.title}
            </span>
          ) : (
            <span className="text-[11px] text-warm-subtle">
              Pick a palette and a concept to continue
            </span>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
