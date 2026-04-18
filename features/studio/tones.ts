// Curated tone presets — single-select in the guided form. Picked to give
// the model strong stylistic anchors without overwhelming users with choices.

export interface TonePreset {
  id: string;
  label: string;
  hint: string; // passed to the model verbatim
}

export const TONE_PRESETS: TonePreset[] = [
  {
    id: 'minimal',
    label: 'Minimal & confident',
    hint: 'Restrained typography, short copy, lots of whitespace. Swiss/editorial influence.',
  },
  {
    id: 'editorial',
    label: 'Editorial & elegant',
    hint: 'Fashion-magazine aesthetic. Serif headlines, considered pacing, cultured voice.',
  },
  {
    id: 'playful',
    label: 'Playful & warm',
    hint: 'Friendly, approachable, a little cheeky. Conversational copy, inviting.',
  },
  {
    id: 'technical',
    label: 'Technical & precise',
    hint: 'Direct, specific, engineer-to-engineer. No marketing fluff. Facts and specs.',
  },
  {
    id: 'luxurious',
    label: 'Luxurious',
    hint: 'High-end, aspirational, understated prestige. Less is more.',
  },
  {
    id: 'bold',
    label: 'Bold & loud',
    hint: 'Confident, opinionated, declarative. Strong stance, short statements.',
  },
];

export function getToneById(id: string | null): TonePreset | undefined {
  if (!id) return undefined;
  return TONE_PRESETS.find((t) => t.id === id);
}

/**
 * Reverse lookup: resolve a tone id from the human-readable label that was
 * persisted into the compiled brief. Used server-side (art-direction) so
 * relabelling a tone only requires editing TONE_PRESETS above.
 */
export function getToneIdByLabel(label: string | null | undefined): string | null {
  if (!label) return null;
  const trimmed = label.trim();
  return TONE_PRESETS.find((t) => t.label === trimmed)?.id ?? null;
}
