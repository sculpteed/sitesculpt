import { NextRequest } from 'next/server';
import { envStatus } from '@/lib/env';
import { expandPrompt } from '@/features/pipeline/steps/expandPrompt';
import { composeSite } from '@/features/pipeline/steps/composeSite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/test/claude?prompt=...
 *
 * Phase A smoke test — runs ONLY the two the model  (expandPrompt + composeSite)
 * in parallel and returns both JSONs. Costs ~$0.001 per call. Use this to
 * verify the model wiring, tool-use schemas, and prompt quality before
 * paying for image/video generation.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const envCheck = envStatus();
  if (!envCheck.ok) {
    return Response.json({ error: envCheck.error }, { status: 500 });
  }

  const prompt = req.nextUrl.searchParams.get('prompt');
  if (!prompt || prompt.trim().length < 3) {
    return Response.json(
      { error: 'Pass ?prompt=... (min 3 chars). Example: /api/test/claude?prompt=AI+startup' },
      { status: 400 },
    );
  }

  const startedAt = Date.now();
  try {
    const [scene, site] = await Promise.all([expandPrompt(prompt), composeSite(prompt)]);
    return Response.json({
      ok: true,
      ms: Date.now() - startedAt,
      scene,
      site,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[test/claude] failed', err);
    return Response.json({ ok: false, ms: Date.now() - startedAt, error: message }, { status: 500 });
  }
}
