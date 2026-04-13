import { NextRequest } from 'next/server';
import { z } from 'zod';
import { envStatus } from '@/lib/env';
import { claudeJson } from '@/lib/providers/anthropic';
import type { SiteStructure } from '@/features/pipeline/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  site: z.any().optional(),
  palette: z
    .object({
      background: z.string(),
      foreground: z.string(),
      accent: z.string(),
    })
    .optional(),
  concept: z.string().optional(),
  visualPrompt: z.string().optional(),
  funnelStep: z.string().optional(),
});

const SYSTEM = `You are a real-time website editor for sitesculpt. You help users at EVERY stage of the creation process.

Depending on what data you receive, you can:

1. **If site structure is provided** — modify headlines, sections, copy, layout order, add/remove sections. Return the full updated site JSON.

2. **If only concept/palette is provided (no site yet)** — the user is still in the visual direction or hero stage. Help them refine the concept description, adjust the palette, or answer questions. Return a summary of what you'd change.

3. **If nothing is provided** — the user is at the brief stage. Help them write their description, pick a tone, suggest pages to include. Return helpful advice.

RULES:
- If you have a site structure, return it in the \`site\` field (FULL updated JSON)
- If the user asks about colors, return a \`paletteUpdate\` field with new hex values
- Always return a \`summary\` field with a one-line description of what changed
- Only change what was asked — preserve everything else
- Never fabricate data
- Be concise and direct`;

interface ChatResponse {
  site?: SiteStructure;
  paletteUpdate?: {
    background: string;
    foreground: string;
    accent: string;
  };
  summary: string;
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

  const { message, site, palette, concept, visualPrompt, funnelStep } = parsed.data;

  // Build context based on what data is available
  const contextParts: string[] = [];

  if (site) {
    contextParts.push(`Current site structure:\n${JSON.stringify(site, null, 2)}`);
  }
  if (palette) {
    contextParts.push(`Current palette: ${JSON.stringify(palette)}`);
  }
  if (concept) {
    contextParts.push(`Current concept: "${concept}"`);
  }
  if (visualPrompt) {
    contextParts.push(`Current visual prompt: "${visualPrompt}"`);
  }
  if (funnelStep) {
    contextParts.push(`User is on funnel step: ${funnelStep}`);
  }
  if (contextParts.length === 0) {
    contextParts.push('No site data yet — user is at the beginning of the process.');
  }

  try {
    const result = await claudeJson<ChatResponse>({
      system: SYSTEM,
      user: `${contextParts.join('\n\n')}\n\nUser request: ${message}`,
      toolName: 'emit_update',
      toolDescription:
        "Return the update: modified site structure (if available), palette changes, and a summary. If no site exists yet, just return a summary with advice.",
      schema: {
        type: 'object',
        required: ['summary'],
        properties: {
          site: {
            type: 'object',
            properties: {
              brandName: { type: 'string' },
              hero: {
                type: 'object',
                properties: {
                  headline: { type: 'string' },
                  subheadline: { type: 'string' },
                  ctaPrimary: { type: 'string' },
                  ctaSecondary: { type: 'string' },
                },
              },
              sections: { type: 'array' },
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
          summary: { type: 'string', maxLength: 200 },
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
