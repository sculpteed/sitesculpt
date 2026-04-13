import { NextRequest } from 'next/server';
import { z } from 'zod';
import { envStatus } from '@/lib/env';
import { writeJson, readJson } from '@/lib/cache';
import { composeSite } from '@/features/pipeline/steps/composeSite';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

    // Save project metadata for "My Projects" — ties to the logged-in user
    try {
      const { userId } = await auth();
      const scene = await readJson<{ palette: { background: string; foreground: string; accent: string } }>(projectId, 'scene.json');
      if (userId) {
        await writeJson(projectId, 'meta.json', {
          projectId,
          userId,
          brandName: site.brandName,
          headline: site.hero.headline,
          palette: scene?.palette ?? { background: '#0a0a0a', foreground: '#fafafa', accent: '#e8b874' },
          createdAt: Date.now(),
        });
      }
    } catch {
      // Non-critical — project still works without metadata
    }

    return Response.json({ site });
  } catch (err) {
    console.error('[compose-site] failed', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Composition failed' },
      { status: 500 },
    );
  }
}
