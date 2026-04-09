import { claudeJson } from '@/lib/providers/anthropic';
import type { Scene } from '@/features/pipeline/types';

const SYSTEM = `You are the visual director for sitesculpt, a tool that turns a short user brief into a cinematic scroll-driven website background.

You output a single Scene JSON via the emit_scene tool. The scene becomes the input to:
  1. gpt-image-1.5 (keyframe at 1792x1024, hd) — use visualPrompt
  2. sora-2 image-to-video (8s animation from the keyframe) — use motionPrompt

Guidelines:
- visualPrompt: a single evocative paragraph. Describe composition, lighting, color, subject, camera angle, mood. Concrete nouns over adjectives. 60–120 words. If the brief specifies EXACT hex values for the palette, weave the mood those colors evoke into the visualPrompt.
- motionPrompt: one sentence describing CONTINUOUS subtle motion suitable for an 8s loop — drifting clouds, slow camera push, light rays shifting, gentle particle movement. Never describe cuts or scene changes.
- palette:
  - **If the brief provides EXACT hex values (e.g. "background #0a0a0a, foreground #f5f5f5, accent #ff5f1f"), you MUST return those exact hex values in the palette. Do NOT substitute your own.**
  - Otherwise, choose three hex colors that match the brand, tone, audience, and any reference media mentioned in the brief. Background should be dark or bold enough to let text sit on it.
- concept: one short phrase (max 8 words) distilling the vibe, used as a fallback tagline.`;

export async function expandPrompt(userPrompt: string): Promise<Scene> {
  return claudeJson<Scene>({
    system: SYSTEM,
    user: `Brief: ${userPrompt}`,
    toolName: 'emit_scene',
    toolDescription: 'Emit the cinematic Scene JSON for downstream image and video generation',
    schema: {
      type: 'object',
      required: ['visualPrompt', 'motionPrompt', 'palette', 'concept'],
      properties: {
        visualPrompt: { type: 'string', minLength: 40 },
        motionPrompt: { type: 'string', minLength: 10 },
        palette: {
          type: 'object',
          required: ['background', 'foreground', 'accent'],
          properties: {
            background: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
            foreground: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
            accent: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
          },
        },
        concept: { type: 'string', maxLength: 80 },
        style: {
          type: 'object',
          description: 'Design style tokens that control how the renderer varies its visual approach. Pick values that match the brand archetype — a luxury brand gets editorial+spacious, a dev tool gets geometric+compact, a personal brand gets expressive+balanced.',
          required: ['heroLayout', 'typography', 'accentUsage', 'density'],
          properties: {
            heroLayout: {
              type: 'string',
              enum: ['bottom-left', 'centered', 'split'],
              description: 'Where the hero text sits: bottom-left (editorial), centered (bold), split (text one side, image other)',
            },
            typography: {
              type: 'string',
              enum: ['editorial', 'geometric', 'expressive'],
              description: 'editorial = serif display + tight tracking. geometric = clean sans + even spacing. expressive = mixed weights + playful.',
            },
            accentUsage: {
              type: 'string',
              enum: ['text', 'backgrounds', 'borders'],
              description: 'How the accent color is primarily applied: on text highlights, as section backgrounds, or as decorative borders.',
            },
            density: {
              type: 'string',
              enum: ['spacious', 'balanced', 'compact'],
              description: 'spacious = lots of whitespace (luxury/editorial). balanced = moderate. compact = denser sections (SaaS/technical).',
            },
          },
        },
      },
    },
  });
}
