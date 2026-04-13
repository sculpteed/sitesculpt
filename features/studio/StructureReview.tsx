'use client';

import { useState } from 'react';
import { useStudioStore } from './store';
import { FadeIn, StaggerGroup, StaggerChild, ScaleOnHover } from '@/components/motion';
import { ArrowRight, ArrowUp, ArrowDown, Pencil, Trash2, Plus } from 'lucide-react';
import type { SiteSection } from '@/features/pipeline/types';

interface StructureReviewProps {
  onApprove: () => void;
  busy?: boolean;
}

/**
 * Step 4 — Copy + Structure Review.
 *
 * Redesigned to feel drag-and-drop easy:
 * - Every text field shows a pencil icon + highlight on hover
 * - Focus state = clear edit mode with accent border
 * - Up/down arrows to reorder sections
 * - Delete button per section
 * - "Add section" at the bottom
 * - Prominent banner: "Everything is editable"
 */
export function StructureReview({ onApprove, busy = false }: StructureReviewProps) {
  const site = useStudioStore((s) => s.site);
  const paletteOptions = useStudioStore((s) => s.paletteOptions);
  const selectedPaletteIdx = useStudioStore((s) => s.selectedPaletteIdx);
  const heroOverride = useStudioStore((s) => s.heroOverride);
  const setHeroOverride = useStudioStore((s) => s.setHeroOverride);
  const sectionOverrides = useStudioStore((s) => s.sectionOverrides);
  const setSectionOverride = useStudioStore((s) => s.setSectionOverride);
  const setSite = useStudioStore((s) => s.setSite);

  const palette = selectedPaletteIdx !== null ? paletteOptions?.[selectedPaletteIdx] : null;

  if (!site) return null;

  const headline = heroOverride.headline ?? site.hero.headline;
  const subheadline = heroOverride.subheadline ?? site.hero.subheadline;

  // Section reorder
  const moveSection = (from: number, to: number): void => {
    if (to < 0 || to >= site.sections.length) return;
    const next = [...site.sections];
    const [moved] = next.splice(from, 1);
    if (moved) next.splice(to, 0, moved);
    setSite({ ...site, sections: next });
  };

  // Section delete
  const deleteSection = (idx: number): void => {
    const next = site.sections.filter((_, i) => i !== idx);
    setSite({ ...site, sections: next });
  };

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 sm:p-10">
      {/* Header */}
      <FadeIn>
        <div className="flex max-w-2xl flex-col gap-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-warm-subtle">
            <span className="inline-block h-px w-6 bg-[var(--color-border-strong)]" />
            <span>Step 4 of 4</span>
          </div>
          <h2 className="font-serif text-3xl leading-[1] tracking-[-0.02em] text-warm sm:text-4xl">
            Review your{' '}
            <em className="italic" style={{ color: '#f5d9a8' }}>
              structure.
            </em>
          </h2>
        </div>
      </FadeIn>

      {/* Edit mode banner */}
      <FadeIn delay={0.1}>
        <div className="flex items-center gap-3 rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-3">
          <Pencil className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />
          <div>
            <div className="text-[12px] font-medium text-warm">
              Everything below is editable
            </div>
            <div className="text-[11px] text-warm-muted">
              Click any text to rewrite it. Use arrows to reorder. Delete sections you don&apos;t need. Changes are free.
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Hero card */}
      <FadeIn delay={0.15}>
        <div
          className="rounded-xl border border-[var(--color-border)] p-5"
          style={{
            background: palette
              ? `linear-gradient(135deg, ${palette.background}, ${palette.accent}22)`
              : 'var(--color-bg-elevated)',
          }}
        >
          <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-warm-subtle">
            Hero section
          </div>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-warm-subtle">
            {site.brandName}
          </div>
          <EditableField
            value={headline}
            onSave={(v) => setHeroOverride({ headline: v })}
            className="font-serif text-2xl leading-[1] tracking-[-0.02em] text-warm sm:text-3xl"
            placeholder="Hero headline"
          />
          <EditableField
            value={subheadline}
            onSave={(v) => setHeroOverride({ subheadline: v })}
            className="mt-2 max-w-lg text-[13px] leading-relaxed text-warm-muted"
            placeholder="Subheadline"
          />
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
      <StaggerGroup className="space-y-2" stagger={0.04}>
        {site.sections.map((s, i) => {
          const ov = sectionOverrides[i] ?? {};
          const title = ov.title ?? s.title;
          const body = ov.body ?? s.body;
          const itemCount = s.items?.length ?? 0;
          const isFirst = i === 0;
          const isLast = i === site.sections.length - 1;

          return (
            <StaggerChild key={`${s.layout}-${i}`}>
              <div className="group relative rounded-xl border border-[var(--color-border)] bg-[rgba(243,234,217,0.01)] transition hover:border-[var(--color-border-strong)] hover:bg-[rgba(243,234,217,0.02)]">
                {/* Reorder + delete controls — visible on hover */}
                <div className="absolute -left-10 top-1/2 hidden -translate-y-1/2 flex-col gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
                  <button
                    type="button"
                    onClick={() => moveSection(i, i - 1)}
                    disabled={isFirst}
                    className="rounded p-1 text-warm-subtle transition hover:bg-[rgba(243,234,217,0.08)] hover:text-warm disabled:opacity-20"
                    title="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(i, i + 1)}
                    disabled={isLast}
                    className="rounded p-1 text-warm-subtle transition hover:bg-[rgba(243,234,217,0.08)] hover:text-warm disabled:opacity-20"
                    title="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Delete button — top right on hover */}
                <button
                  type="button"
                  onClick={() => deleteSection(i)}
                  className="absolute right-2 top-2 rounded p-1.5 text-warm-subtle opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                  title="Remove section"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <div className="p-4 pr-10">
                  {/* Layout badge + metadata */}
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[9px] text-warm-subtle">
                      {String(i + 1).padStart(2, '0')}
                    </span>
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
                      <span className="font-mono text-[9px] text-warm-subtle">{s.label}</span>
                    ) : null}
                    {itemCount > 0 ? (
                      <span className="font-mono text-[9px] text-warm-subtle">
                        · {itemCount} items
                      </span>
                    ) : null}
                  </div>

                  {/* Editable title */}
                  <EditableField
                    value={title}
                    onSave={(v) => setSectionOverride(i, { title: v || s.title })}
                    className="text-[14px] font-medium text-warm"
                    placeholder="Section title"
                  />

                  {/* Editable body */}
                  <EditableField
                    value={body}
                    onSave={(v) => setSectionOverride(i, { body: v || s.body })}
                    className="mt-1 text-[12px] leading-relaxed text-warm-muted"
                    placeholder="Section body"
                    multiline
                  />

                  {/* Mobile reorder controls */}
                  <div className="mt-2 flex gap-1 sm:hidden">
                    <button
                      type="button"
                      onClick={() => moveSection(i, i - 1)}
                      disabled={isFirst}
                      className="rounded px-2 py-1 text-[10px] text-warm-subtle transition hover:bg-[rgba(243,234,217,0.06)] disabled:opacity-20"
                    >
                      ↑ Move up
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(i, i + 1)}
                      disabled={isLast}
                      className="rounded px-2 py-1 text-[10px] text-warm-subtle transition hover:bg-[rgba(243,234,217,0.06)] disabled:opacity-20"
                    >
                      ↓ Move down
                    </button>
                  </div>
                </div>
              </div>
            </StaggerChild>
          );
        })}
      </StaggerGroup>

      {/* Approve + render */}
      <FadeIn delay={0.2}>
        <div className="flex flex-wrap items-center gap-4 pb-6">
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
            {site.sections.length} sections · all edits saved
          </span>
        </div>
      </FadeIn>
    </div>
  );
}

// ─── EditableField ──────────────────────────────────────────────────────────
// A text field that looks like static text but reveals itself as editable on
// hover (pencil icon + highlight) and focus (accent border + background).

function EditableField({
  value,
  onSave,
  className,
  placeholder,
  multiline = false,
}: {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  const handleBlur = (e: React.FocusEvent<HTMLElement>): void => {
    setFocused(false);
    const next = (e.currentTarget.textContent ?? '').trim();
    if (next !== value) onSave(next);
  };

  return (
    <div className="group/edit relative">
      {/* Pencil hint — appears on hover when not focused */}
      {!focused ? (
        <div className="pointer-events-none absolute -left-6 top-0.5 opacity-0 transition-opacity group-hover/edit:opacity-60">
          <Pencil className="h-3 w-3 text-[var(--color-accent)]" />
        </div>
      ) : null}
      <div
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        className={`rounded-md outline-none transition ${
          focused
            ? 'bg-[rgba(243,234,217,0.04)] ring-1 ring-[var(--color-accent)] ring-offset-1 ring-offset-[var(--color-bg)]'
            : 'hover:bg-[rgba(243,234,217,0.02)]'
        } ${className ?? ''}`}
        style={{ cursor: focused ? 'text' : 'pointer', padding: focused ? '4px 6px' : '0' }}
        data-placeholder={placeholder}
      >
        {value || placeholder}
      </div>
    </div>
  );
}
