import { NextRequest } from 'next/server';
import { z } from 'zod';
import { envStatus } from '@/lib/env';
import { writeJson } from '@/lib/cache';
import { composeSite } from '@/features/pipeline/steps/composeSite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  brief: z.string().min(10).max(8000),
  projectId: z.string().min(1),
});

/**
 * POST /api/compose-site
 *
 * Step 4 of the funnel — generates the site structure (hero + sections)
 * from the compiled brief. Returns the full SiteStructure JSON for the
 * user to review before rendering the final preview.
 *
 * Cost: ~$0.001 (one Claude call)
 */
export async function POST(req: NextRequest): Promise<Response> {
  const envCheck = envStatus();
  if (!envCheck.ok) {
    return Response.json({ error: envCheck.error }, { status: 500 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { brief, projectId } = parsed.data;

  try {
    const site = await composeSite(brief);

    // Persist to cache so /preview/[id] can read it
    await writeJson(projectId, 'site.json', site);

    return Response.json({ site });
  } catch (err) {
    console.error('[compose-site] failed', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Composition failed' },
      { status: 500 },
    );
  }
}
