'use client';

import { useState, useRef } from 'react';
import { useStudioStore } from './store';
import { FadeIn, StaggerGroup, StaggerChild, ScaleOnHover } from '@/components/motion';
import { ArrowRight, ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react';

interface StructureReviewProps {
  onApprove: () => void;
  busy?: boolean;
}

/**
 * Step 4 — Copy + Structure Review.
 *
 * EVERY text field is editable: brand name, headline, subheadline,
 * CTA buttons, section labels, titles, bodies, and CTAs.
 */
export function StructureReview({ onApprove, busy = false }: StructureReviewProps) {
  const site = useStudioStore((s) => s.site);
  const paletteOptions = useStudioStore((s) => s.paletteOptions);
  const selectedPaletteIdx = useStudioStore((s) => s.selectedPaletteIdx);
  const heroOverride = useStudioStore((s) => s.heroOverride);
  const setHeroOverride = useStudioStore((s) => s.setHeroOverride);
  const brandOverride = useStudioStore((s) => s.brandOverride);
  const setBrandOverride = useStudioStore((s) => s.setBrandOverride);
  const sectionOverrides = useStudioStore((s) => s.sectionOverrides);
  const setSectionOverride = useStudioStore((s) => s.setSectionOverride);
  const setSite = useStudioStore((s) => s.setSite);

  const palette = selectedPaletteIdx !== null ? paletteOptions?.[selectedPaletteIdx] : null;

  if (!site) return null;

  const headline = heroOverride.headline ?? site.hero.headline;
  const subheadline = heroOverride.subheadline ?? site.hero.subheadline;
  const ctaPrimary = heroOverride.ctaPrimary ?? site.hero.ctaPrimary;
  const ctaSecondary = heroOverride.ctaSecondary ?? site.hero.ctaSecondary;
  const brandName = brandOverride ?? site.brandName;

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
              Click any text to rewrite it — headlines, buttons, labels, everything.
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

          {/* Brand name */}
          <EditableField
            value={brandName}
            onSave={(v) => setBrandOverride(v !== site.brandName ? v : null)}
            className="mb-2 font-mono text-[10px] uppercase tracking-wider text-warm-subtle"
            placeholder="Brand name"
          />

          {/* Headline */}
          <EditableField
            value={headline}
            onSave={(v) => setHeroOverride({ headline: v })}
            className="font-serif text-2xl leading-[1] tracking-[-0.02em] text-warm sm:text-3xl"
            placeholder="Hero headline"
          />

          {/* Subheadline */}
          <EditableField
            value={subheadline}
            onSave={(v) => setHeroOverride({ subheadline: v })}
            className="mt-2 max-w-lg text-[13px] leading-relaxed text-warm-muted"
            placeholder="Subheadline"
          />

          {/* CTA buttons — editable */}
          <div className="mt-3 flex flex-wrap gap-3">
            <EditableField
              value={ctaPrimary}
              onSave={(v) => setHeroOverride({ ctaPrimary: v })}
              className="rounded-full px-3 py-1 text-[11px] font-medium"
              style={{
                backgroundColor: palette?.accent ?? '#e8b874',
                color: palette?.background ?? '#0d0a08',
              }}
              placeholder="Primary button"
            />
            <EditableField
              value={ctaSecondary ?? ''}
              onSave={(v) => setHeroOverride({ ctaSecondary: v || undefined })}
              className="text-[11px] text-warm-muted"
              placeholder="Secondary link"
            />
          </div>
        </div>
      </FadeIn>

      {/* Section list */}
      <StaggerGroup className="space-y-2" stagger={0.04}>
        {site.sections.map((s, i) => {
          const ov = sectionOverrides[i] ?? {};
          const title = ov.title ?? s.title;
          const body = ov.body ?? s.body;
          const label = ov.label ?? s.label ?? '';
          const cta = ov.cta ?? s.cta ?? '';
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
                    {itemCount > 0 ? (
                      <span className="font-mono text-[9px] text-warm-subtle">
                        · {itemCount} items
                      </span>
                    ) : null}
                  </div>

                  {/* Editable label (eyebrow) */}
                  {(label || s.layout) && (
                    <EditableField
                      value={label}
                      onSave={(v) => setSectionOverride(i, { label: v || s.label })}
                      className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-warm-subtle"
                      placeholder="Section label"
                    />
                  )}

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

                  {/* Editable CTA (if present or layout typically has one) */}
                  {(cta || ['split-image', 'cta', 'contact-block'].includes(s.layout)) && (
                    <EditableField
                      value={cta}
                      onSave={(v) => setSectionOverride(i, { cta: v || undefined })}
                      className="mt-2 text-[11px] font-medium text-[var(--color-accent)]"
                      placeholder="Button text"
                    />
                  )}

                  {/* Mobile reorder controls */}
                  <div className="mt-2 flex gap-1 sm:hidden">
                    <button
                      type="button"
                      onClick={() => moveSection(i, i - 1)}
                      disabled={isFirst}
                      className="rounded px-2 py-1 text-[10px] text-warm-subtle transition hover:bg-[rgba(243,234,217,0.06)] disabled:opacity-20"
                    >
                      Move up
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(i, i + 1)}
                      disabled={isLast}
                      className="rounded px-2 py-1 text-[10px] text-warm-subtle transition hover:bg-[rgba(243,234,217,0.06)] disabled:opacity-20"
                    >
                      Move down
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
              {busy ? 'Rendering preview...' : 'Generate full preview'}
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
// Click-to-edit: shows static text with a pencil icon. Clicking opens
// a real input/textarea.

function EditableField({
  value,
  onSave,
  className,
  placeholder,
  multiline = false,
  style,
}: {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  style?: React.CSSProperties;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const startEdit = (): void => {
    setDraft(value);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const save = (): void => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
  };

  if (editing) {
    return multiline ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save(); }
          if (e.key === 'Escape') { setEditing(false); }
        }}
        rows={3}
        className="w-full resize-none rounded-md border border-[var(--color-accent)] bg-[rgba(243,234,217,0.04)] px-3 py-2 text-[13px] text-warm outline-none"
        placeholder={placeholder}
      />
    ) : (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); save(); }
          if (e.key === 'Escape') { setEditing(false); }
        }}
        className="w-full rounded-md border border-[var(--color-accent)] bg-[rgba(243,234,217,0.04)] px-3 py-2 text-[13px] font-medium text-warm outline-none"
        placeholder={placeholder}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      style={style}
      className={`group/edit flex w-full items-start gap-2 rounded-md px-1 py-0.5 text-left transition hover:bg-[rgba(243,234,217,0.04)] ${className ?? ''}`}
    >
      <span className="flex-1">{value || <span className="text-warm-subtle italic">{placeholder}</span>}</span>
      <Pencil className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-accent)] opacity-40 transition group-hover/edit:opacity-100" />
    </button>
  );
}
