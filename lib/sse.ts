// Server-Sent Events helper. Produces a Response that streams JSON events.
// Usage:
//   const { response, send, close } = createSSEStream();
//   // async work: send({ type: 'progress', ... });
//   // await ... close();
//   return response;

export interface SSEHandle {
  response: Response;
  send: (data: unknown) => void;
  close: () => void;
}

export function createSSEStream(): SSEHandle {
  const encoder = new TextEncoder();
  let controllerRef: ReadableStreamDefaultController<Uint8Array> | null = null;
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controllerRef = controller;
    },
    cancel() {
      closed = true;
    },
  });

  const send = (data: unknown): void => {
    if (closed || !controllerRef) return;
    const line = `data: ${JSON.stringify(data)}\n\n`;
    try {
      controllerRef.enqueue(encoder.encode(line));
    } catch {
      closed = true;
    }
  };

  const close = (): void => {
    if (closed || !controllerRef) return;
    closed = true;
    try {
      controllerRef.close();
    } catch {
      // already closed
    }
  };

  const response = new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });

  return { response, send, close };
}
