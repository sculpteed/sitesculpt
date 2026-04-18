'use client';

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ImagePlus, Film, X } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { useStudioStore } from './store';
import { PAGE_PRESETS } from './pages';
import { TONE_PRESETS } from './tones';
import { TEMPLATES } from './templates';
import { compilePrompt } from './compilePrompt';
import { DataPanels } from './DataPanels';
import type { Aspect } from '@/features/pipeline/types';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 40 * 1024 * 1024;

interface GuidedFormProps {
  onSubmit: (compiledPrompt: string, aspect: Aspect) => void;
  busy?: boolean;
}

/** Structured site brief. `description` is required; everything else optional. */
export function GuidedForm({ onSubmit, busy = false }: GuidedFormProps) {
  const brandName = useStudioStore((s) => s.brandName);
  const description = useStudioStore((s) => s.description);
  const toneId = useStudioStore((s) => s.toneId);
  const paletteMode = useStudioStore((s) => s.paletteMode);
  const customPalette = useStudioStore((s) => s.customPalette);
  const includedPages = useStudioStore((s) => s.includedPages);
  const userData = useStudioStore((s) => s.userData);
  const aspect = useStudioStore((s) => s.aspect);
  const attachedMedia = useStudioStore((s) => s.attachedMedia);
  const setBrandName = useStudioStore((s) => s.setBrandName);
  const setDescription = useStudioStore((s) => s.setDescription);
  const setToneId = useStudioStore((s) => s.setToneId);
  const setPaletteMode = useStudioStore((s) => s.setPaletteMode);
  const setCustomPalette = useStudioStore((s) => s.setCustomPalette);
  const togglePage = useStudioStore((s) => s.togglePage);
  const setAttachedMedia = useStudioStore((s) => s.setAttachedMedia);
  const applyTemplate = useStudioStore((s) => s.applyTemplate);

  const [error, setError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = description.trim().length >= 6 && !busy;

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!canSubmit) return;
    const compiled = compilePrompt({
      brandName,
      description,
      toneId,
      paletteMode,
      customPalette,
      includedPages,
      userData,
      hasAttachedImage: attachedMedia?.kind === 'image',
      hasAttachedVideo: attachedMedia?.kind === 'video',
    });
    onSubmit(compiled, aspect);
  };

  const handleFile = async (
    e: ChangeEvent<HTMLInputElement>,
    kind: 'image' | 'video',
  ): Promise<void> => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const maxBytes = kind === 'image' ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
    if (file.size > maxBytes) {
      setError(`${kind === 'image' ? 'Image' : 'Video'} too large (max ${Math.round(maxBytes / 1024 / 1024)}MB)`);
      return;
    }
    setError(null);
    const dataUrl = await readAsDataUrl(file);
    setAttachedMedia({ kind, name: file.name, size: file.size, dataUrl });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl space-y-5 rounded-2xl border border-[var(--color-border)] bg-[rgba(243,234,217,0.015)] p-5 backdrop-blur-md sm:p-6"
    >
      {!description && (
        <div>
          <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-warm-subtle">
            Quick start
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t)}
                className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[11px] text-warm-muted transition hover:border-[var(--color-accent)] hover:text-warm"
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Field label="Brand name" optional>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Obsidian Labs"
            className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-[14px] text-warm placeholder:text-warm-subtle outline-none transition focus:border-[var(--color-border-strong)]"
          />
        </Field>

        <Field label="Describe what you&rsquo;re building" required helper="1–2 sentences. The more specific you are, the more cinematic the result.">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canSubmit) {
                e.preventDefault();
                const compiled = compilePrompt({
                  brandName,
                  description,
                  toneId,
                  paletteMode,
                  customPalette,
                  includedPages,
                  userData,
                  hasAttachedImage: attachedMedia?.kind === 'image',
                  hasAttachedVideo: attachedMedia?.kind === 'video',
                });
                onSubmit(compiled, aspect);
              }
            }}
            placeholder="A studio making hand-thrown ceramics for the table. Flagship in Brooklyn, online everywhere."
            rows={3}
            className="w-full resize-none rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2.5 text-[14px] text-warm placeholder:text-warm-subtle outline-none transition focus:border-[var(--color-border-strong)]"
          />
        </Field>
      </div>

      <Field label="Tone" optional helper="Pick one. Leave blank and we'll infer.">
        <div className="flex flex-wrap gap-1.5">
          {TONE_PRESETS.map((t) => {
            const selected = toneId === t.id;
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => setToneId(selected ? null : t.id)}
                className={`rounded-full border px-3 py-1.5 text-[11px] transition ${
                  selected
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-warm'
                    : 'border-[var(--color-border)] bg-transparent text-warm-muted hover:border-[var(--color-border-strong)] hover:text-warm'
                }`}
                title={t.hint}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Color palette" optional helper="Let us derive it from your brand + tone, or lock in your own.">
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setPaletteMode('ai')}
            className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
              paletteMode === 'ai'
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                : 'border-[var(--color-border)] bg-transparent hover:border-[var(--color-border-strong)]'
            }`}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{
                background:
                  'linear-gradient(135deg, #e8b874, #d48eb3 40%, #4fd0e0 80%, #a8c468)',
              }}
            >
              <Sparkles className="h-3.5 w-3.5 text-[#0d0a08]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-center gap-2">
                <span className="text-[12px] font-medium text-warm">Auto-derive</span>
                {paletteMode === 'ai' ? (
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-accent)]">
                    Recommended
                  </span>
                ) : null}
              </div>
              <p className="text-[11px] leading-relaxed text-warm-muted">
                We derive the palette from your brand, tone, content, and any attached reference.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaletteMode('custom')}
            className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
              paletteMode === 'custom'
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                : 'border-[var(--color-border)] bg-transparent hover:border-[var(--color-border-strong)]'
            }`}
          >
            <div className="flex h-8 w-auto shrink-0 items-center gap-0.5 overflow-hidden rounded-lg">
              <div
                className="h-8 w-3"
                style={{ backgroundColor: customPalette.background }}
              />
              <div
                className="h-8 w-3"
                style={{ backgroundColor: customPalette.foreground }}
              />
              <div className="h-8 w-3" style={{ backgroundColor: customPalette.accent }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 text-[12px] font-medium text-warm">Custom</div>
              <p className="text-[11px] leading-relaxed text-warm-muted">
                Drag-select background, text, and accent. Locked in exactly as you pick.
              </p>
            </div>
          </button>
        </div>

        {paletteMode === 'custom' ? (
          <div className="mt-3 grid gap-3 rounded-lg border border-[var(--color-border)] bg-[rgba(243,234,217,0.02)] p-3 sm:grid-cols-3">
            <ColorPicker
              label="Background"
              value={customPalette.background}
              onChange={(v) => setCustomPalette({ background: v })}
            />
            <ColorPicker
              label="Text"
              value={customPalette.foreground}
              onChange={(v) => setCustomPalette({ foreground: v })}
            />
            <ColorPicker
              label="Accent"
              value={customPalette.accent}
              onChange={(v) => setCustomPalette({ accent: v })}
            />
          </div>
        ) : null}
      </Field>

      {/* Progressive data-collection panels — reveal when pages are toggled */}
      <DataPanels />

      <Field label="Pages to include" optional helper="Toggle the sections you want. We'll still add essentials like hero automatically.">
        <div className="flex flex-wrap gap-1.5">
          {PAGE_PRESETS.map((p) => {
            const selected = includedPages.includes(p.id);
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => togglePage(p.id)}
                className={`rounded-full border px-3 py-1.5 text-[11px] transition ${
                  selected
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-warm'
                    : 'border-[var(--color-border)] bg-transparent text-warm-muted hover:border-[var(--color-border-strong)] hover:text-warm'
                }`}
              >
                {selected ? '✓ ' : '+ '}
                {p.label}
              </button>
            );
          })}
        </div>
      </Field>

      {attachedMedia ? (
        <div className="flex items-center gap-3 rounded-md border border-[var(--color-border)] bg-[rgba(243,234,217,0.02)] px-3 py-2">
          <MediaThumb media={attachedMedia} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium text-warm">{attachedMedia.name}</div>
            <div className="text-[10px] text-warm-subtle">
              {attachedMedia.kind === 'image' ? 'Reference image' : 'Reference video'} ·{' '}
              {formatBytes(attachedMedia.size)}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAttachedMedia(null)}
            className="rounded-md p-1.5 text-warm-muted transition hover:bg-[rgba(243,234,217,0.08)] hover:text-warm"
            aria-label="Remove attachment"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] text-warm-muted transition hover:bg-[rgba(243,234,217,0.06)] hover:text-warm"
            title="Attach a reference image (max 8MB)"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            <span>Image</span>
          </button>
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] text-warm-muted transition hover:bg-[rgba(243,234,217,0.06)] hover:text-warm"
            title="Attach a reference video (max 40MB)"
          >
            <Film className="h-3.5 w-3.5" />
            <span>Video</span>
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => void handleFile(e, 'image')}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            className="hidden"
            onChange={(e) => void handleFile(e, 'video')}
          />
        </div>
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex items-center gap-2 rounded-md px-5 py-2 text-[13px] font-medium text-[#0d0a08] transition disabled:cursor-not-allowed disabled:opacity-25"
          style={{ backgroundColor: '#e8b874' }}
        >
          {busy ? (
            <>
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#0d0a08]" />
              <span>Generating…</span>
            </>
          ) : (
            <>
              <span>Generate</span>
              <span className="font-mono text-[10px] opacity-70">~3 min</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Small helpers ───────────────────────────────────────────────────────────

function Field({
  label,
  children,
  required,
  optional,
  helper,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  helper?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline gap-2">
        <label className="text-[11px] font-medium uppercase tracking-[0.12em] text-warm">
          {label}
        </label>
        {required ? (
          <span className="font-mono text-[9px] text-[var(--color-accent)]">required</span>
        ) : optional ? (
          <span className="font-mono text-[9px] text-warm-subtle">optional</span>
        ) : null}
      </div>
      {children}
      {helper ? (
        <div className="mt-1 text-[10px] leading-relaxed text-warm-subtle">{helper}</div>
      ) : null}
    </div>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  // Sanitize on hex input — native type=color requires a valid 6-hex value.
  const normalize = (v: string): string => {
    const trimmed = v.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toLowerCase();
    if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed.toLowerCase()}`;
    return value; // reject and keep current
  };
  return (
    <label className="flex cursor-pointer flex-col gap-1.5">
      <span className="font-mono text-[9px] uppercase tracking-wider text-warm-subtle">
        {label}
      </span>
      <div className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[rgba(243,234,217,0.02)] px-2 py-1.5 focus-within:border-[var(--color-border-strong)]">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 w-6 cursor-pointer rounded border-none bg-transparent p-0"
          style={{ appearance: 'none', WebkitAppearance: 'none' }}
          title="Drag-select a color"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onChange(normalize(e.target.value))}
          maxLength={7}
          spellCheck={false}
          className="w-full bg-transparent font-mono text-[11px] uppercase tracking-wider text-warm outline-none"
        />
      </div>
    </label>
  );
}

function MediaThumb({ media }: { media: { kind: 'image' | 'video'; dataUrl: string } }) {
  if (media.kind === 'image') {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={media.dataUrl}
        alt=""
        className="h-11 w-11 rounded-md border border-[rgba(243,234,217,0.12)] object-cover"
      />
    );
  }
  return (
    <video
      src={media.dataUrl}
      muted
      playsInline
      className="h-11 w-11 rounded-md border border-[rgba(243,234,217,0.12)] object-cover"
    />
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
