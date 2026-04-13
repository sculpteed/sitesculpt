import { NextRequest } from 'next/server';
import { bundleExport } from '@/features/pipeline/steps/bundleExport';
import { readStatus } from '@/lib/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/export/{id}
 *
 * Streams a zipped Next.js project for the given completed project.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  const status = await readStatus(id);
  if (!status) {
    return Response.json({ error: 'Unknown project' }, { status: 404 });
  }
  if (!status.completedAt) {
    return Response.json({ error: 'Project not yet complete' }, { status: 409 });
  }

  // Convert archiver's Node stream to a Web ReadableStream
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const writable: NodeJS.WritableStream = {
        write(chunk: Buffer | string, _encoding?: unknown, cb?: (err?: Error | null) => void) {
          const bytes = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
          controller.enqueue(new Uint8Array(bytes));
          if (typeof cb === 'function') cb();
          return true;
        },
        end(cb?: () => void) {
          controller.close();
          if (typeof cb === 'function') cb();
          return this as unknown as NodeJS.WritableStream;
        },
      } as unknown as NodeJS.WritableStream;

      try {
        await bundleExport({ projectId: id, output: writable });
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="sitesculpt-${id}.zip"`,
      'Cache-Control': 'no-store',
    },
  });
}
