import { NextRequest, NextResponse } from 'next/server';
import { readFileBytes, getBlobUrl } from '@/lib/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/preview/{id}/keyframe
 *
 * In blob mode: redirects to the public blob URL (fast, CDN-cached).
 * In filesystem mode: serves the bytes directly.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  // Try blob redirect first (zero-copy, CDN edge cached)
  const blobUrl = await getBlobUrl(id, 'keyframe.png');
  if (blobUrl) {
    return NextResponse.redirect(blobUrl, { status: 302 });
  }

  // Fallback: serve from filesystem
  try {
    const bytes = await readFileBytes(id, 'keyframe.png');
    return new Response(new Uint8Array(bytes), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('Keyframe not found', { status: 404 });
  }
}
