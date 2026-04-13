'use client';

import { useStudioStore, type FunnelStep } from './store';
import { StepDot } from '@/components/LoadingStates';

const STEPS: { id: FunnelStep; label: string; short: string }[] = [
  { id: 'brief', label: 'Brief', short: '01' },
  { id: 'art-direction', label: 'Direction', short: '02' },
  { id: 'keyframe', label: 'Keyframe', short: '03' },
  { id: 'copy-review', label: 'Copy', short: '04' },
  { id: 'preview', label: 'Preview', short: '05' },
];

const STEP_ORDER: FunnelStep[] = ['brief', 'art-direction', 'keyframe', 'copy-review', 'preview'];

function stepIndex(step: FunnelStep): number {
  return STEP_ORDER.indexOf(step);
}

/**
 * Funnel breadcrumb — shows all steps, highlights current, completed steps
 * are clickable to go back. Makes it obvious that revision is possible at
 * any stage.
 */
export function FunnelNav() {
  const funnelStep = useStudioStore((s) => s.funnelStep);
  const setFunnelStep = useStudioStore((s) => s.setFunnelStep);
  const currentIdx = stepIndex(funnelStep);

  return (
    <nav className="flex items-center gap-1 px-2 py-2 sm:gap-2">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const canClick = done; // can only go back to completed steps

        return (
          <div key={step.id} className="flex items-center gap-1 sm:gap-2">
            {i > 0 ? (
              <div
                className="h-px w-4 sm:w-8"
                style={{
                  backgroundColor: done
                    ? 'var(--color-accent, #e8b874)'
                    : 'var(--color-border, rgba(243,234,217,0.09))',
                }}
              />
            ) : null}
            <button
              type="button"
              onClick={() => canClick && setFunnelStep(step.id)}
              disabled={!canClick}
              className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.15em] transition sm:px-3 sm:text-[11px] ${
                active
                  ? 'text-[var(--color-accent,#e8b874)]'
                  : done
                    ? 'cursor-pointer text-warm-muted hover:text-warm'
                    : 'cursor-default text-warm-subtle'
              }`}
              title={canClick ? `Go back to ${step.label}` : undefined}
            >
              <StepDot active={active} done={done} />
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{step.short}</span>
            </button>
          </div>
        );
      })}
    </nav>
  );
}
