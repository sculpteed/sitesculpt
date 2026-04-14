import { notFound } from 'next/navigation';
import { TEMPLATE_CONFIGS } from '@/features/studio/templates-config';
import { TemplateRender } from './TemplateRender';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * /template-render/[id]
 *
 * Renders the template's HTML overlay (floating nav pill + headline +
 * CTAs) on top of the AI-generated background. Screenshotted by
 * Playwright at 1376x768 to produce the final template JPEG.
 *
 * This matches Draftly's actual pipeline:
 * 1. AI generates background-only (no text/UI)
 * 2. HTML renders crisp UI on top
 * 3. Screenshot the composite = pixel-perfect thumbnail
 */
export default async function TemplateRenderPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const bgUrl = typeof sp.bg === 'string' ? sp.bg : null;

  const config = TEMPLATE_CONFIGS.find((t) => t.id === id);
  if (!config) notFound();

  return <TemplateRender config={config} bgUrl={bgUrl} />;
}
