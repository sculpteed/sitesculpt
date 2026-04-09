'use client';

import { create } from 'zustand';
import type {
  Aspect,
  Scene,
  SiteSection,
  SiteStructure,
  StepName,
  Progress,
} from '@/features/pipeline/types';
import { emptyUserData, type UserData } from './userData';

export type PipelineState = 'idle' | 'running' | 'done' | 'error';

export interface AttachedMedia {
  kind: 'image' | 'video';
  name: string;
  size: number;
  dataUrl: string; // base64 preview for UI
}

export interface StudioState {
  // Guided input — used to compile a structured prompt at submit time
  brandName: string;
  description: string; // replaces the old `prompt` freeform textarea
  toneId: string | null; // single-select tone id from TONE_PRESETS
  /** 'ai' = Claude picks palette from all other form inputs; 'custom' = user-picked */
  paletteMode: 'ai' | 'custom';
  customPalette: { background: string; foreground: string; accent: string };
  includedPages: string[]; // preset ids the user explicitly selected

  /** Structured real-world data provided by the user, per section. This is
   *  what stops fabrication — if the user provides real team members, Claude
   *  never has to invent them. Unused fields are empty arrays. */
  userData: UserData;

  // Legacy: a compiled final prompt passed to the pipeline
  prompt: string;
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

  // Actions
  setBrandName: (v: string) => void;
  setDescription: (v: string) => void;
  setToneId: (v: string | null) => void;
  setPaletteMode: (v: 'ai' | 'custom') => void;
  setCustomPalette: (p: Partial<StudioState['customPalette']>) => void;
  setUserData: (updater: (prev: UserData) => UserData) => void;
  setPrompt: (v: string) => void;
  setAspect: (v: Aspect) => void;
  setAttachedMedia: (v: AttachedMedia | null) => void;
  togglePage: (id: string) => void;
  setIncludedPages: (ids: string[]) => void;
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
  clearEdits: () => void;
  reset: () => void;
}

const initialSteps: Record<StepName, Progress> = {
  expandPrompt: { state: 'pending' },
  composeSite: { state: 'pending' },
  generateImage: { state: 'pending' },
  generateVideo: { state: 'pending' },
  extractFrames: { state: 'pending' },
};

export const useStudioStore = create<StudioState>((set) => ({
  brandName: '',
  description: '',
  toneId: null,
  paletteMode: 'ai',
  customPalette: { background: '#0d0a08', foreground: '#f3ead9', accent: '#e8b874' },
  includedPages: [],
  userData: emptyUserData(),
  prompt: '',
  aspect: '16:9',
  attachedMedia: null,
  projectId: null,
  state: 'idle',
  steps: { ...initialSteps },
  error: null,
  scene: null,
  site: null,
  frameCount: 0,
  heroOverride: {},
  brandOverride: null,
  sectionOverrides: {},
  setBrandName: (v) => set({ brandName: v }),
  setDescription: (v) => set({ description: v }),
  setToneId: (v) => set({ toneId: v }),
  setPaletteMode: (v) => set({ paletteMode: v }),
  setCustomPalette: (p) =>
    set((prev) => ({ customPalette: { ...prev.customPalette, ...p } })),
  setUserData: (updater) => set((prev) => ({ userData: updater(prev.userData) })),
  setPrompt: (v) => set({ prompt: v }),
  setAspect: (v) => set({ aspect: v }),
  setAttachedMedia: (v) => set({ attachedMedia: v }),
  togglePage: (id) =>
    set((prev) => ({
      includedPages: prev.includedPages.includes(id)
        ? prev.includedPages.filter((x) => x !== id)
        : [...prev.includedPages, id],
    })),
  setIncludedPages: (ids) => set({ includedPages: ids }),
  startGeneration: (projectId) =>
    set({
      projectId,
      state: 'running',
      steps: { ...initialSteps },
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
  clearEdits: () =>
    set({
      heroOverride: {},
      brandOverride: null,
      sectionOverrides: {},
    }),
  reset: () =>
    set({
      projectId: null,
      state: 'idle',
      steps: { ...initialSteps },
      error: null,
      scene: null,
      site: null,
      frameCount: 0,
      heroOverride: {},
      brandOverride: null,
      sectionOverrides: {},
    }),
}));
