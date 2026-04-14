import { NextRequest } from 'next/server';
import { TEMPLATE_CONFIGS } from '@/features/studio/templates-config';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const config = TEMPLATE_CONFIGS.find((t) => t.id === id);
  if (!config) {
    return Response.json({ error: 'not found' }, { status: 404 });
  }
  return Response.json(config);
}
