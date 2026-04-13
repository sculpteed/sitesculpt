'use client';

import { useState } from 'react';
import { useStudioStore } from './store';
import { FadeIn, ScaleOnHover } from '@/components/motion';
import { Shimmer, PulsingDots, LoadingRing } from '@/components/LoadingStates';
import { RefreshCw, Check, MessageSquare, X } from 'lucide-react';

interface KeyframeApprovalProps {
  onApprove: () => void;
  onRegenerate: (feedback?: string) => void;
  busy?: boolean;
}

const QUICK_FEEDBACK = [
  'Different mood / atmosphere',
  'Different subject entirely',
  'Brighter / more vibrant',
  'Darker / more moody',
  'More abstract / less literal',
  'More realistic / photographic',
];

/**
 * Step 3 of the funnel — Keyframe Approval.
 *
 * Now includes:
 * - Shimmer loading state while generating (not just blank/text)
 * - Regeneration feedback: asks WHAT to change before retrying
 * - PulsingDots on busy state so it's unmistakably loading
 */
export function KeyframeApproval({ onApprove, onRegenerate, busy }: KeyframeApprovalProps) {
  const projectId = useStudioStore((s) => s.projectId);
  const paletteOptions = useStudioStore((s) => s.paletteOptions);
  const selectedPaletteIdx = useStudioStore((s) => s.selectedPaletteIdx);
  const conceptOptions = useStudioStore((s) => s.conceptOptions);
  const selectedConceptIdx = useStudioStore((s) => s.selectedConceptIdx);

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const palette = selectedPaletteIdx !== null ? paletteOptions?.[selectedPaletteIdx] : null;
  const concept = selectedConceptIdx !== null ? conceptOptions?.[selectedConceptIdx] : null;

  const handleRegenWithFeedback = (quickOption?: string): void => {
    const feedback = quickOption ?? feedbackText.trim();
    setShowFeedback(false);
    setFeedbackText('');
    onRegenerate(feedback || undefined);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Keyframe preview area */}
      <div className="relative flex-1 overflow-hidden">
        {busy ? (
          // ─── Loading state: shimmer + pulsing indicator ───
          <div className="relative flex h-full flex-col items-center justify-center">
            <Shimmer className="absolute inset-0" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <LoadingRing active className="rounded-full p-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-elevated)]">
                  <RefreshCw className="h-6 w-6 animate-spin text-[var(--color-accent)]" />
                </div>
              </LoadingRing>
              <div className="flex items-center gap-2 text-[13px] text-warm-muted">
                <span>Sculpting your keyframe</span>
                <PulsingDots />
              </div>
              <p className="max-w-xs text-center text-[11px] text-warm-subtle">
                Generating a high-resolution hero image from your chosen concept. This typically
                takes 15–30 seconds.
              </p>
            </div>
          </div>
        ) : projectId ? (
          // ─── Keyframe rendered ───
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/preview/${projectId}/keyframe?t=${Date.now()}`}
              alt="Generated hero keyframe"
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                animation: 'kenBurns 30s ease-in-out infinite alternate',
                transformOrigin: 'center center',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: palette
                  ? `linear-gradient(to top, ${palette.background}dd, ${palette.background}33 40%, transparent 70%)`
                  : 'linear-gradient(to top, rgba(0,0,0,0.7), transparent 60%)',
              }}
            />
          </>
        ) : (
          <Shimmer className="h-full w-full" />
        )}

        {/* Overlay content — only when not busy and we have a keyframe */}
        {!busy && projectId ? (
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <FadeIn>
              <div className="flex max-w-2xl flex-col gap-4">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-warm-subtle">
                  <span className="inline-block h-px w-6 bg-[var(--color-border-strong)]" />
                  <span>Step 3 of 4 · Hero keyframe</span>
                </div>

                {concept ? (
                  <div>
                    <h2
                      className="font-serif text-2xl tracking-[-0.02em] sm:text-3xl"
                      style={{ color: palette?.foreground ?? '#fff' }}
                    >
                      {concept.title}
                    </h2>
                    <p
                      className="mt-2 max-w-md text-[13px] leading-relaxed"
                      style={{ color: `${palette?.foreground ?? '#fff'}bb` }}
                    >
                      {concept.description}
                    </p>
                  </div>
                ) : null}

                {palette ? (
                  <div className="flex gap-1.5">
                    {[palette.background, palette.foreground, palette.accent].map((c, i) => (
                      <div
                        key={i}
                        className="h-6 w-10 rounded-md border border-white/20"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                ) : null}

                {/* Action buttons */}
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <ScaleOnHover>
                    <button
                      type="button"
                      onClick={onApprove}
                      className="flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-medium text-[#0d0a08] transition"
                      style={{ backgroundColor: palette?.accent ?? '#e8b874' }}
                    >
                      <Check className="h-4 w-4" />
                      Approve & continue
                    </button>
                  </ScaleOnHover>
                  <ScaleOnHover>
                    <button
                      type="button"
                      onClick={() => setShowFeedback(true)}
                      className="flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(0,0,0,0.3)] px-5 py-3 text-[13px] font-medium backdrop-blur transition hover:border-[rgba(255,255,255,0.4)]"
                      style={{ color: palette?.foreground ?? '#fff' }}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Try another
                    </button>
                  </ScaleOnHover>
                </div>

                {/* ── Regeneration feedback panel ── */}
                {showFeedback ? (
                  <FadeIn y={10} duration={0.3}>
                    <div className="mt-2 rounded-xl border border-[rgba(255,255,255,0.15)] bg-[rgba(0,0,0,0.5)] p-4 backdrop-blur-lg">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[12px] font-medium" style={{ color: palette?.foreground ?? '#fff' }}>
                          What should we change?
                        </span>
                        <button
                          onClick={() => setShowFeedback(false)}
                          className="rounded p-1 text-warm-subtle hover:text-warm"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {QUICK_FEEDBACK.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleRegenWithFeedback(opt)}
                            className="rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] px-3 py-1.5 text-[11px] transition hover:border-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.1)]"
                            style={{ color: `${palette?.foreground ?? '#fff'}cc` }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && feedbackText.trim()) {
                              handleRegenWithFeedback();
                            }
                          }}
                          placeholder="Or describe what you want..."
                          className="flex-1 rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] px-3 py-2 text-[12px] outline-none placeholder:text-warm-subtle focus:border-[rgba(255,255,255,0.3)]"
                          style={{ color: palette?.foreground ?? '#fff' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRegenWithFeedback()}
                          disabled={!feedbackText.trim()}
                          className="rounded-lg px-4 py-2 text-[12px] font-medium text-[#0d0a08] transition disabled:opacity-30"
                          style={{ backgroundColor: palette?.accent ?? '#e8b874' }}
                        >
                          Regenerate
                        </button>
                      </div>
                    </div>
                  </FadeIn>
                ) : null}
              </div>
            </FadeIn>
          </div>
        ) : null}
      </div>
    </div>
  );
}
