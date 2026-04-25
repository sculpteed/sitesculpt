'use client';

import { useStudioStore } from './store';
import type { StepName } from '@/features/pipeline/types';
import { STEP_ORDER } from './pipeline-steps';
import { Check, Loader2, Circle, AlertCircle } from 'lucide-react';

const LABELS: Record<StepName, { title: string; hint: string }> = {
  expandPrompt: { title: 'Scene brief', hint: 'Expanding your brief into a scene' },
  composeSite: { title: 'Copy + sections', hint: 'Writing hero copy and structure' },
  generateImage: { title: 'Hero image', hint: 'Rendering your hero visual' },
  compositeAssets: { title: 'Brand pass', hint: 'Compositing your brand into the scene' },
  generateVideo: { title: 'Motion', hint: 'Synthesising the motion loop' },
  extractFrames: { title: 'Frames', hint: 'Extracting frames for scroll playback' },
};

export function PipelinePanel() {
  const steps = useStudioStore((s) => s.steps);
  const state = useStudioStore((s) => s.state);
  const error = useStudioStore((s) => s.error);

  const statusLabel =
    state === 'idle'
      ? 'Ready · ~3 min'
      : state === 'done'
        ? 'Complete'
        : state === 'error'
          ? 'Failed'
          : 'Running';

  const statusTint =
    state === 'done'
      ? 'text-[#78c2a4]'
      : state === 'error'
        ? 'text-[#e56b6f]'
        : state === 'running'
          ? 'text-[#e8b874]'
          : 'text-warm-subtle';

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(243,234,217,0.012)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-warm-subtle">
          Pipeline
        </span>
        <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${statusTint}`}>
          {statusLabel}
        </span>
      </div>
      <ol className="space-y-2">
        {STEP_ORDER.map((step, i) => {
          const p = steps[step];
          const label = LABELS[step];
          return (
            <li
              key={step}
              className={`flex items-start gap-3 rounded-lg border px-3 py-2 transition ${
                p.state === 'running'
                  ? 'border-[#e8b874]/40 bg-[#e8b874]/[0.06]'
                  : p.state === 'done'
                    ? 'border-[#78c2a4]/25 bg-[#78c2a4]/[0.05]'
                    : p.state === 'error'
                      ? 'border-[#e56b6f]/30 bg-[#e56b6f]/[0.05]'
                      : 'border-[var(--color-border)] bg-transparent'
              }`}
            >
              <div className="mt-0.5">
                {p.state === 'done' ? (
                  <Check className="h-4 w-4 text-[#78c2a4]" />
                ) : p.state === 'running' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#e8b874]" />
                ) : p.state === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-[#e56b6f]" />
                ) : (
                  <Circle className="h-4 w-4 text-warm-subtle" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[13px] text-warm">
                    <span className="font-mono text-[10px] text-warm-subtle">0{i + 1}</span>{' '}
                    {label.title}
                  </span>
                  {p.pct !== undefined && p.state === 'running' ? (
                    <span className="font-mono text-[10px] text-[#e8b874]">
                      {Math.round(Math.min(p.pct, 1) * 100)}%
                    </span>
                  ) : null}
                </div>
                <div className="text-[11px] leading-relaxed text-warm-muted">
                  {p.message ?? label.hint}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      {error ? (
        <div className="mt-3 rounded-md border border-[#e56b6f]/30 bg-[#e56b6f]/[0.06] p-3 text-[12px] leading-relaxed text-[#e56b6f]">
          {error}
        </div>
      ) : null}
    </div>
  );
}
