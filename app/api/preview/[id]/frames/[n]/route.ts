import { NextRequest, NextResponse } from 'next/server';
import { readFileBytes, getBlobUrl } from '@/lib/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/preview/{id}/frames/{n}
 *
 * In blob mode: redirects to the public blob URL.
 * In filesystem mode: serves the bytes directly.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; n: string }> },
): Promise<Response> {
  const { id, n } = await params;
  const index = parseInt(n, 10);
  if (!Number.isFinite(index) || index < 1) {
    return new Response('Bad frame index', { status: 400 });
  }
  const filename = `frames/${String(index).padStart(4, '0')}.jpg`;

  // Try blob redirect first
  const blobUrl = await getBlobUrl(id, filename);
  if (blobUrl) {
    return NextResponse.redirect(blobUrl, { status: 302 });
  }

  // Fallback: filesystem
  try {
    const bytes = await readFileBytes(id, filename);
    return new Response(new Uint8Array(bytes), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('Frame not found', { status: 404 });
  }
}
