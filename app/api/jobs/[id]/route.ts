import { NextRequest } from 'next/server';
import { readStatus } from '@/lib/cache';
import { createSSEStream } from '@/lib/sse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/jobs/{id}
 *
 * SSE stream of pipeline progress. Polls the on-disk status.json every 500ms
 * and pushes deltas to the client. Closes when all steps are done or one
 * has failed.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const { response, send, close } = createSSEStream();

  let lastSerialized = '';
  let pollCount = 0;
  let isFirstTick = true;
  const maxPolls = 2400; // ~20 minutes at 500ms

  const tick = async (): Promise<void> => {
    pollCount += 1;
    const status = await readStatus(id);
    if (status) {
      const serialized = JSON.stringify(status);
      // Always send on first tick (late-joiner snapshot). After that,
      // only send when something has changed.
      if (isFirstTick || serialized !== lastSerialized) {
        lastSerialized = serialized;
        isFirstTick = false;
        send({ type: 'status', status });
      }
      const allDone = Object.values(status.steps).every((s) => s.state === 'done');
      if (allDone || status.failed) {
        send({ type: 'end', ok: !status.failed });
        close();
        return;
      }
    } else if (isFirstTick) {
      // Project doesn't exist at all — tell the client immediately.
      send({ type: 'end', ok: false, reason: 'not_found' });
      close();
      return;
    }
    if (pollCount >= maxPolls) {
      send({ type: 'end', ok: false, reason: 'timeout' });
      close();
      return;
    }
    setTimeout(() => {
      void tick();
    }, 500);
  };

  void tick();
  return response;
}
