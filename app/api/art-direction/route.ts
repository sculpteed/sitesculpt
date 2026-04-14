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

const SYSTEM = `You are the art director for sitesculpt — a 3D cinematic scroll-driven website builder (think Draftly.space). Every hero must feel like a CINEMATIC 3D SCENE with depth, floating elements, and volumetric atmosphere — NOT a flat stock photo.

Given a user's brief, propose THREE distinct visual directions. Each should be a full website hero composition with specific nav, headline text, CTA, and a richly imagined 3D background.

The three options should be meaningfully DIFFERENT:
- Option 1: The obvious brand-fit direction with cinematic polish
- Option 2: An editorial/unexpected direction (different palette, different mood)
- Option 3: A bold/distinctive direction that would stand out

For each option:
- palette: name (2-3 words), background hex, foreground hex, accent hex
  - WCAG AA contrast required
  - Accent must be vibrant enough for buttons/highlights
- concept: title (3-5 words), description (1-2 sentences on the visual feel), visualPrompt, motionPrompt

CRITICAL — visualPrompt format (80-180 words, Draftly-style):
"[Industry/category] landing page hero. Navigation: Logo [BrandName with icon], Menu items: [4-5 uppercase items], Button: [CTA text]. [Layout type]. Headline: [punchy 3-7 word headline]. Subtext: [1 sentence]. CTA button: [text] + secondary: [text]. Hero background: [RICH CINEMATIC 3D SCENE — floating elements, volumetric lighting, atmospheric depth, specific subject like floating islands/crystal prisms/space nebula/architectural render/glass morphism/aerial landscape/etc — describe in detail]. Design style: [specific aesthetic — Unreal Engine quality, Ghibli-meets-Inception, Octane render, cinematic concept art, architectural visualization, etc]. Fonts: [serif/sans pairing]. Colors: [specific palette]."

Example backgrounds that WORK:
- Floating sky islands with waterfalls and god rays (Ghibli-meets-Inception)
- Cosmic nebula with geometric crystal prisms and volumetric light beams
- Cinematic architectural render at golden hour with dramatic shadows
- Aerial drone shot of turquoise ocean and pristine coastline with coral reef visible
- Iridescent glass morphism with liquid chrome reflecting a sunset sky
- Cyberpunk neon cityscape with rain and holographic billboards
- Photorealistic product still life with soft window light

AVOID: flat stock photos, generic gradients, plain product screenshots, anything that could be a Shopify theme.

motionPrompt: 1 sentence describing slow continuous parallax-friendly motion (clouds drifting, particles floating, subtle camera push, water shimmer, etc).`;

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
