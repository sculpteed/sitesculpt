import { NextRequest } from 'next/server';
import { z } from 'zod';
import { envStatus } from '@/lib/env';
import { claudeJson } from '@/lib/providers/anthropic';
import type { SiteStructure, Scene } from '@/features/pipeline/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  site: z.any(), // current SiteStructure
  palette: z.object({
    background: z.string(),
    foreground: z.string(),
    accent: z.string(),
  }).optional(),
});

const SYSTEM = `You are a real-time website editor for sitesculpt. The user has a generated website and wants to make changes via natural language.

You receive:
- The current site structure (JSON with brandName, hero, sections)
- The current color palette
- The user's instruction (natural language)

Your job: apply the requested change and return the UPDATED site structure. Only modify what the user asked for — preserve everything else exactly.

Examples of what users might ask:
- "Make the headline shorter" → shorten hero.headline
- "Add a FAQ section" → add a new section with layout: "faq-accordion"
- "Remove the pricing section" → filter out the pricing section
- "Rewrite the intro to be more playful" → update the intro section's title + body
- "Change the accent color to blue" → return a palette update
- "Move the testimonials above the pricing" → reorder sections array
- "Make the CTA more urgent" → update the CTA section's title + cta button text
- "Add a team member named Alex, CEO" → add to the team section's items

RULES:
- Return the FULL updated SiteStructure via the emit_update tool
- If the user asks about the palette, include a paletteUpdate field
- Keep section labels, layouts, and items intact unless explicitly asked to change them
- Never fabricate data — if asked to add a team member, use exactly what the user said
- Be conservative — change only what was asked`;

interface ChatResponse {
  site: SiteStructure;
  paletteUpdate?: {
    background: string;
    foreground: string;
    accent: string;
  };
  summary: string; // one-line description of what changed
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

  const { message, site, palette } = parsed.data;

  try {
    const result = await claudeJson<ChatResponse>({
      system: SYSTEM,
      user: `Current site structure:\n${JSON.stringify(site, null, 2)}\n\nCurrent palette: ${palette ? JSON.stringify(palette) : 'not set'}\n\nUser request: ${message}`,
      toolName: 'emit_update',
      toolDescription: 'Return the updated site structure after applying the user\'s requested change, plus a one-line summary of what changed',
      schema: {
        type: 'object',
        required: ['site', 'summary'],
        properties: {
          site: {
            type: 'object',
            required: ['brandName', 'hero', 'sections'],
            properties: {
              brandName: { type: 'string' },
              hero: {
                type: 'object',
                required: ['headline', 'subheadline', 'ctaPrimary'],
                properties: {
                  headline: { type: 'string' },
                  subheadline: { type: 'string' },
                  ctaPrimary: { type: 'string' },
                  ctaSecondary: { type: 'string' },
                },
              },
              sections: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    layout: { type: 'string' },
                    label: { type: 'string' },
                    title: { type: 'string' },
                    body: { type: 'string' },
                    cta: { type: 'string' },
                    items: { type: 'array' },
                  },
                },
              },
            },
          },
          paletteUpdate: {
            type: 'object',
            properties: {
              background: { type: 'string' },
              foreground: { type: 'string' },
              accent: { type: 'string' },
            },
          },
          summary: { type: 'string', maxLength: 100 },
        },
      },
    });

    return Response.json(result);
  } catch (err) {
    console.error('[chat] failed', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Chat failed' },
      { status: 500 },
    );
  }
}
