import { NextRequest } from 'next/server';
import { z } from 'zod';
import { envStatus } from '@/lib/env';
import { claudeJson } from '@/lib/providers/anthropic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const bodySchema = z.object({
  brief: z.string().min(10).max(8000),
});

const SYSTEM = `You are the art director for sitesculpt. Given a user's brief, you propose THREE distinct visual directions for their website. Each direction includes a color palette AND a hero concept.

The three options should be meaningfully DIFFERENT — not three shades of the same idea:
- Option 1: The obvious, "safe" direction that most closely matches the brief
- Option 2: A more editorial/unexpected direction that elevates the brand
- Option 3: A bold/distinctive direction that would make the site stand out

For each option, provide:
- palette: name (2-3 words), background hex, foreground hex, accent hex
  - Ensure WCAG AA contrast between foreground and background
  - Accent should be vibrant enough to use on buttons and highlights
- concept: title (3-5 words), description (1-2 sentences explaining the visual feel), visualPrompt (the full cinematic prompt for gpt-image-1, 60-120 words — composition, lighting, subjects, mood, camera angle), motionPrompt (1 sentence describing subtle continuous motion)

The palettes and concepts should feel like they come from a DIFFERENT designer each time — not just color variations of one idea.`;

interface ArtDirectionResponse {
  options: Array<{
    palette: {
      name: string;
      background: string;
      foreground: string;
      accent: string;
    };
    concept: {
      title: string;
      description: string;
      visualPrompt: string;
      motionPrompt: string;
    };
  }>;
}

export async function POST(req: NextRequest): Promise<Response> {
  const envCheck = envStatus();
  if (!envCheck.ok) {
    return Response.json({ error: envCheck.error }, { status: 500 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await claudeJson<ArtDirectionResponse>({
      system: SYSTEM,
      user: `Brief:\n${parsed.data.brief}`,
      toolName: 'emit_art_directions',
      toolDescription:
        'Emit three distinct visual direction options, each with a palette and hero concept',
      schema: {
        type: 'object',
        required: ['options'],
        properties: {
          options: {
            type: 'array',
            minItems: 3,
            maxItems: 3,
            items: {
              type: 'object',
              required: ['palette', 'concept'],
              properties: {
                palette: {
                  type: 'object',
                  required: ['name', 'background', 'foreground', 'accent'],
                  properties: {
                    name: { type: 'string', maxLength: 30 },
                    background: {
                      type: 'string',
                      pattern: '^#[0-9a-fA-F]{6}$',
                    },
                    foreground: {
                      type: 'string',
                      pattern: '^#[0-9a-fA-F]{6}$',
                    },
                    accent: {
                      type: 'string',
                      pattern: '^#[0-9a-fA-F]{6}$',
                    },
                  },
                },
                concept: {
                  type: 'object',
                  required: [
                    'title',
                    'description',
                    'visualPrompt',
                    'motionPrompt',
                  ],
                  properties: {
                    title: { type: 'string', maxLength: 40 },
                    description: { type: 'string', maxLength: 200 },
                    visualPrompt: { type: 'string', minLength: 40 },
                    motionPrompt: { type: 'string', minLength: 10 },
                  },
                },
              },
            },
          },
        },
      },
    });

    return Response.json(result);
  } catch (err) {
    console.error('[art-direction] failed', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Art direction failed' },
      { status: 500 },
    );
  }
}
