import { NextRequest } from 'next/server';
import { readJson, listFrames } from '@/lib/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/preview/{id}/artifact/{name}
 *
 * Client helper for pulling small cached artifacts as JSON. Supports:
 *   - scene         → scene.json
 *   - site          → site.json
 *   - frames-count  → { count }
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; name: string }> },
): Promise<Response> {
  const { id, name } = await params;

  if (name === 'scene' || name === 'site') {
    const data = await readJson<unknown>(id, `${name}.json`);
    if (!data) return Response.json({ error: 'not ready' }, { status: 404 });
    return Response.json(data);
  }
  if (name === 'frames-count') {
    const frames = await listFrames(id);
    return Response.json({ count: frames.length });
  }
  return Response.json({ error: 'unknown artifact' }, { status: 400 });
}
