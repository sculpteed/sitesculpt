import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

/**
 * GET /api/projects?userId=...
 *
 * Lists all projects belonging to the authenticated user.
 * Projects are stored in Vercel Blob at projects/{projectId}/meta.json
 * with the userId field for ownership.
 *
 * For local dev (no blob), returns empty list.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!BLOB_TOKEN) {
    // Local dev without blob — return empty
    return Response.json({ projects: [] });
  }

  try {
    const { list } = await import('@vercel/blob');
    const result = await list({ prefix: 'projects/', token: BLOB_TOKEN });

    // Filter for meta.json files and read each
    const metaBlobs = result.blobs.filter((b) => b.pathname.endsWith('/meta.json'));
    const projects = [];

    for (const blob of metaBlobs) {
      try {
        const resp = await fetch(blob.url);
        if (!resp.ok) continue;
        const meta = (await resp.json()) as {
          projectId: string;
          userId: string;
          brandName: string;
          headline: string;
          palette: { background: string; foreground: string; accent: string };
          createdAt: number;
        };
        if (meta.userId === userId) {
          projects.push({
            projectId: meta.projectId,
            brandName: meta.brandName,
            headline: meta.headline,
            palette: meta.palette,
            createdAt: meta.createdAt,
          });
        }
      } catch {
        continue;
      }
    }

    // Sort newest first
    projects.sort((a, b) => b.createdAt - a.createdAt);

    return Response.json({ projects });
  } catch (err) {
    console.error('[projects] list failed', err);
    return Response.json({ projects: [] });
  }
}
