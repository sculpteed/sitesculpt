// Single source of truth for pipeline step ordering + initial state, shared
// by the store, the PipelinePanel UI, and any future consumer in the studio.
// Adding or reordering steps here updates everything downstream.

import type { Progress, StepName } from '@/features/pipeline/types';

export const STEP_ORDER: readonly StepName[] = [
  'expandPrompt',
  'composeSite',
  'generateImage',
  'generateVideo',
  'extractFrames',
] as const;

/** A fresh "all pending" record. Kept as a factory (not a frozen const) so
 *  the store can spread/clone without risk of aliasing mutation. */
export function makeInitialSteps(): Record<StepName, Progress> {
  return STEP_ORDER.reduce<Record<StepName, Progress>>((acc, step) => {
    acc[step] = { state: 'pending' };
    return acc;
  }, {} as Record<StepName, Progress>);
}
