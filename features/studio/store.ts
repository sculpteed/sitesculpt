'use client';

import { create } from 'zustand';
import type {
  Aspect,
  Palette,
  Scene,
  SiteSection,
  SiteStructure,
  StepName,
  Progress,
} from '@/features/pipeline/types';
import { emptyUserData, type UserData } from './userData';
import type { Template } from './templates';
import { makeInitialSteps } from './pipeline-steps';

export type PipelineState = 'idle' | 'running' | 'done' | 'error';

export type FunnelStep = 'brief' | 'art-direction' | 'keyframe' | 'copy-review' | 'preview';

export interface PaletteOption extends Palette {
  name: string;
}

export interface ConceptOption {
  title: string;
  description: string;
  visualPrompt: string;
  motionPrompt: string;
}

export interface AttachedMedia {
  kind: 'image' | 'video';
  name: string;
  size: number;
  dataUrl: string; // base64 preview for UI
}

export interface StudioState {
  // ─── Funnel state ──────────────────────────────────────────────────────
  funnelStep: FunnelStep;

  // Step 2: Art direction options from Claude
  paletteOptions: PaletteOption[] | null;
  conceptOptions: ConceptOption[] | null;
  selectedPaletteIdx: number | null;
  selectedConceptIdx: number | null;

  // ─── Guided input (Step 1) ─────────────────────────────────────────────
  brandName: string;
  description: string;
  toneId: string | null;
  /** 'ai' = Claude picks palette from other form inputs; 'custom' = user-picked */
  paletteMode: 'ai' | 'custom';
  customPalette: Palette;
  includedPages: string[];

  /** User-provided real data injected into the brief so Claude formats
   *  rather than invents. Unused fields are empty arrays. */
  userData: UserData;

  aspect: Aspect;
  attachedMedia: AttachedMedia | null;

  // Pipeline
  projectId: string | null;
  state: PipelineState;
  steps: Record<StepName, Progress>;
  error: string | null;

  // Outputs (populated progressively as SSE fires)
  scene: Scene | null;
  site: SiteStructure | null;
  frameCount: number;

  // Editable overrides (user tweaks copy while generation runs)
  heroOverride: Partial<SiteStructure['hero']>;
  brandOverride: string | null;
  sectionOverrides: Record<number, Partial<SiteSection>>;

  // Actions — funnel
  setFunnelStep: (step: FunnelStep) => void;
  setPaletteOptions: (options: PaletteOption[]) => void;
  setConceptOptions: (options: ConceptOption[]) => void;
  setSelectedPaletteIdx: (idx: number) => void;
  setSelectedConceptIdx: (idx: number) => void;

  // Actions — form
  setBrandName: (v: string) => void;
  setDescription: (v: string) => void;
  setToneId: (v: string | null) => void;
  setPaletteMode: (v: 'ai' | 'custom') => void;
  setCustomPalette: (p: Partial<StudioState['customPalette']>) => void;
  setUserData: (updater: (prev: UserData) => UserData) => void;
  setAttachedMedia: (v: AttachedMedia | null) => void;
  togglePage: (id: string) => void;
  startGeneration: (projectId: string) => void;
  applyStatus: (status: {
    steps: Record<StepName, Progress>;
    failed?: { step: StepName; error: string };
  }) => void;
  setScene: (s: Scene) => void;
  setSite: (s: SiteStructure) => void;
  setFrameCount: (n: number) => void;
  setHeroOverride: (patch: Partial<SiteStructure['hero']>) => void;
  setBrandOverride: (value: string | null) => void;
  setSectionOverride: (index: number, patch: Partial<SiteSection>) => void;
  applyTemplate: (t: Template) => void;
  reset: () => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  funnelStep: 'brief',
  paletteOptions: null,
  conceptOptions: null,
  selectedPaletteIdx: null,
  selectedConceptIdx: null,
  brandName: '',
  description: '',
  toneId: null,
  paletteMode: 'ai',
  customPalette: { background: '#0d0a08', foreground: '#f3ead9', accent: '#e8b874' },
  includedPages: [],
  userData: emptyUserData(),
  aspect: '16:9',
  attachedMedia: null,
  projectId: null,
  state: 'idle',
  steps: makeInitialSteps(),
  error: null,
  scene: null,
  site: null,
  frameCount: 0,
  heroOverride: {},
  brandOverride: null,
  sectionOverrides: {},
  setFunnelStep: (step) => set({ funnelStep: step }),
  setPaletteOptions: (options) => set({ paletteOptions: options }),
  setConceptOptions: (options) => set({ conceptOptions: options }),
  setSelectedPaletteIdx: (idx) => set({ selectedPaletteIdx: idx }),
  setSelectedConceptIdx: (idx) => set({ selectedConceptIdx: idx }),
  setBrandName: (v) => set({ brandName: v }),
  setDescription: (v) => set({ description: v }),
  setToneId: (v) => set({ toneId: v }),
  setPaletteMode: (v) => set({ paletteMode: v }),
  setCustomPalette: (p) =>
    set((prev) => ({ customPalette: { ...prev.customPalette, ...p } })),
  setUserData: (updater) => set((prev) => ({ userData: updater(prev.userData) })),
  setAttachedMedia: (v) => set({ attachedMedia: v }),
  togglePage: (id) =>
    set((prev) => ({
      includedPages: prev.includedPages.includes(id)
        ? prev.includedPages.filter((x) => x !== id)
        : [...prev.includedPages, id],
    })),
  startGeneration: (projectId) =>
    set({
      projectId,
      state: 'running',
      steps: makeInitialSteps(),
      error: null,
      scene: null,
      site: null,
      frameCount: 0,
      heroOverride: {},
      brandOverride: null,
      sectionOverrides: {},
    }),
  applyStatus: ({ steps, failed }) =>
    set((prev) => {
      const allDone = Object.values(steps).every((s) => s.state === 'done');
      return {
        steps,
        state: failed ? 'error' : allDone ? 'done' : prev.state,
        error: failed?.error ?? prev.error,
      };
    }),
  setScene: (s) => set({ scene: s }),
  setSite: (s) => set({ site: s }),
  setFrameCount: (n) => set({ frameCount: n }),
  setHeroOverride: (patch) =>
    set((prev) => ({ heroOverride: { ...prev.heroOverride, ...patch } })),
  setBrandOverride: (value) => set({ brandOverride: value }),
  setSectionOverride: (index, patch) =>
    set((prev) => ({
      sectionOverrides: {
        ...prev.sectionOverrides,
        [index]: { ...(prev.sectionOverrides[index] ?? {}), ...patch },
      },
    })),
  applyTemplate: (t) =>
    set({
      brandName: t.brandName,
      description: t.description,
      toneId: t.toneId,
      includedPages: t.pages,
      paletteMode: 'ai',
      funnelStep: 'brief',
    }),
  reset: () =>
    set({
      projectId: null,
      state: 'idle',
      steps: makeInitialSteps(),
      error: null,
      scene: null,
      site: null,
      frameCount: 0,
      heroOverride: {},
      brandOverride: null,
      sectionOverrides: {},
    }),
}));
