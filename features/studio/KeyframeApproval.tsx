'use client';

import { useStudioStore } from './store';
import { FadeIn, ScaleOnHover } from '@/components/motion';
import { RefreshCw, Check, ArrowRight } from 'lucide-react';

interface KeyframeApprovalProps {
  onApprove: () => void;
  onRegenerate: () => void;
  busy?: boolean;
}

/**
 * Step 3 of the funnel — Keyframe Approval.
 *
 * Shows the generated hero image full-bleed with the user's chosen palette
 * applied. User approves or asks for a regeneration ($0.04 per attempt).
 * This checkpoint prevents the "I hate the hero image" problem.
 */
export function KeyframeApproval({ onApprove, onRegenerate, busy }: KeyframeApprovalProps) {
  const projectId = useStudioStore((s) => s.projectId);
  const paletteOptions = useStudioStore((s) => s.paletteOptions);
  const selectedPaletteIdx = useStudioStore((s) => s.selectedPaletteIdx);
  const conceptOptions = useStudioStore((s) => s.conceptOptions);
  const selectedConceptIdx = useStudioStore((s) => s.selectedConceptIdx);

  const palette = selectedPaletteIdx !== null ? paletteOptions?.[selectedPaletteIdx] : null;
  const concept = selectedConceptIdx !== null ? conceptOptions?.[selectedConceptIdx] : null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Keyframe preview — full bleed */}
      <div className="relative flex-1 overflow-hidden">
        {projectId ? (
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
            {/* Bottom gradient for text legibility */}
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
          <div className="flex h-full items-center justify-center bg-warm">
            <div className="text-warm-muted">
              {busy ? 'Generating keyframe…' : 'No keyframe yet'}
            </div>
          </div>
        )}

        {/* Overlay content */}
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

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <ScaleOnHover>
                  <button
                    type="button"
                    onClick={onApprove}
                    disabled={busy || !projectId}
                    className="flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-medium text-[#0d0a08] transition disabled:opacity-25"
                    style={{ backgroundColor: palette?.accent ?? '#e8b874' }}
                  >
                    <Check className="h-4 w-4" />
                    Approve & continue
                  </button>
                </ScaleOnHover>
                <ScaleOnHover>
                  <button
                    type="button"
                    onClick={onRegenerate}
                    disabled={busy}
                    className="flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(0,0,0,0.3)] px-5 py-3 text-[13px] font-medium backdrop-blur transition hover:border-[rgba(255,255,255,0.4)] disabled:opacity-25"
                    style={{ color: palette?.foreground ?? '#fff' }}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {busy ? 'Generating…' : 'Try another (~$0.04)'}
                  </button>
                </ScaleOnHover>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
