'use client';

import { useStudioStore } from './store';
import { FadeIn, StaggerGroup, StaggerChild, ScaleOnHover } from '@/components/motion';
import { ArrowRight, GripVertical } from 'lucide-react';

interface StructureReviewProps {
  onApprove: () => void;
  busy?: boolean;
}

/**
 * Step 4 of the funnel — Copy + Structure Review.
 *
 * Shows the generated site structure (hero copy + section list) for user
 * review before the full preview renders. User can edit titles/bodies
 * inline and reorder sections. This prevents the "I have to regenerate
 * everything because one section title is wrong" problem.
 *
 * Cost to reach this step: ~$0.001 (composeSite Claude call)
 */
export function StructureReview({ onApprove, busy = false }: StructureReviewProps) {
  const site = useStudioStore((s) => s.site);
  const scene = useStudioStore((s) => s.scene);
  const paletteOptions = useStudioStore((s) => s.paletteOptions);
  const selectedPaletteIdx = useStudioStore((s) => s.selectedPaletteIdx);
  const heroOverride = useStudioStore((s) => s.heroOverride);
  const setHeroOverride = useStudioStore((s) => s.setHeroOverride);
  const sectionOverrides = useStudioStore((s) => s.sectionOverrides);
  const setSectionOverride = useStudioStore((s) => s.setSectionOverride);

  const palette = selectedPaletteIdx !== null ? paletteOptions?.[selectedPaletteIdx] : null;

  if (!site) return null;

  const headline = heroOverride.headline ?? site.hero.headline;
  const subheadline = heroOverride.subheadline ?? site.hero.subheadline;

  return (
    <div className="flex flex-1 flex-col gap-8 overflow-y-auto p-6 sm:p-10">
      {/* Header */}
      <FadeIn>
        <div className="flex max-w-2xl flex-col gap-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-warm-subtle">
            <span className="inline-block h-px w-6 bg-[var(--color-border-strong)]" />
            <span>Step 4 of 4</span>
            <span className="inline-block h-px w-6 bg-[var(--color-border-strong)]" />
          </div>
          <h2 className="font-serif text-3xl leading-[1] tracking-[-0.02em] text-warm sm:text-4xl">
            Review your{' '}
            <em className="italic" style={{ color: '#f5d9a8' }}>
              structure.
            </em>
          </h2>
          <p className="max-w-md text-[13px] leading-relaxed text-warm-muted">
            Click any text to edit. This is the copy and layout that will render in your final
            site. Get it right here — changes are free.
          </p>
        </div>
      </FadeIn>

      {/* Hero preview */}
      <FadeIn delay={0.1}>
        <div
          className="rounded-xl border border-[var(--color-border)] p-6"
          style={{
            background: palette
              ? `linear-gradient(135deg, ${palette.background}, ${palette.accent}22)`
              : 'var(--color-bg-elevated)',
          }}
        >
          <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-warm-subtle">
            Hero
          </div>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-warm-subtle">
            {site.brandName}
          </div>
          <h3
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) =>
              setHeroOverride({ headline: e.currentTarget.textContent ?? undefined })
            }
            className="font-serif text-2xl leading-[1] tracking-[-0.02em] text-warm outline-none focus:text-[var(--color-accent)] sm:text-3xl"
          >
            {headline}
          </h3>
          <p
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) =>
              setHeroOverride({ subheadline: e.currentTarget.textContent ?? undefined })
            }
            className="mt-2 max-w-lg text-[13px] leading-relaxed text-warm-muted outline-none focus:text-warm"
          >
            {subheadline}
          </p>
          <div className="mt-3 flex gap-3">
            <span
              className="rounded-full px-3 py-1 text-[11px] font-medium"
              style={{
                backgroundColor: palette?.accent ?? '#e8b874',
                color: palette?.background ?? '#0d0a08',
              }}
            >
              {site.hero.ctaPrimary}
            </span>
            {site.hero.ctaSecondary ? (
              <span className="text-[11px] text-warm-muted">{site.hero.ctaSecondary} →</span>
            ) : null}
          </div>
        </div>
      </FadeIn>

      {/* Section list */}
      <StaggerGroup className="space-y-3" stagger={0.05}>
        {site.sections.map((s, i) => {
          const ov = sectionOverrides[i] ?? {};
          const title = ov.title ?? s.title;
          const body = ov.body ?? s.body;
          const itemCount = s.items?.length ?? 0;
          return (
            <StaggerChild key={i}>
              <div className="group rounded-xl border border-[var(--color-border)] bg-[rgba(243,234,217,0.01)] p-4 transition hover:border-[var(--color-border-strong)]">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="rounded-sm px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                    style={{
                      backgroundColor: 'var(--color-accent-soft)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    {s.layout}
                  </span>
                  {s.label ? (
                    <span className="font-mono text-[9px] uppercase tracking-wider text-warm-subtle">
                      {s.label}
                    </span>
                  ) : null}
                  {itemCount > 0 ? (
                    <span className="font-mono text-[9px] text-warm-subtle">
                      {itemCount} items
                    </span>
                  ) : null}
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const next = (e.currentTarget.textContent ?? '').trim();
                    setSectionOverride(i, { title: next || s.title });
                  }}
                  className="text-[14px] font-medium text-warm outline-none focus:text-[var(--color-accent)]"
                >
                  {title}
                </div>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const next = (e.currentTarget.textContent ?? '').trim();
                    setSectionOverride(i, { body: next || s.body });
                  }}
                  className="mt-1 text-[12px] leading-relaxed text-warm-muted outline-none focus:text-warm"
                >
                  {body}
                </div>
              </div>
            </StaggerChild>
          );
        })}
      </StaggerGroup>

      {/* Approve + render */}
      <FadeIn delay={0.2}>
        <div className="flex items-center gap-4 pb-6">
          <ScaleOnHover>
            <button
              type="button"
              onClick={onApprove}
              disabled={busy}
              className="flex items-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-medium text-[#0d0a08] transition disabled:opacity-25"
              style={{ backgroundColor: '#e8b874' }}
            >
              {busy ? 'Rendering preview…' : 'Generate full preview'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </ScaleOnHover>
          <span className="text-[11px] text-warm-subtle">
            {site.sections.length} sections · edits are saved
          </span>
        </div>
      </FadeIn>
    </div>
  );
}
