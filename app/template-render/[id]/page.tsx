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
 * Renders the template's HTML overlay (nav + headline + CTAs) on top of
 * the AI-generated background. Playwright screenshots this at 1376x768
 * to produce the final template JPEG. The AI generates background-only
 * so the overlay text stays crisp.
 */
export default async function TemplateRenderPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const bgUrl = typeof sp.bg === 'string' ? sp.bg : null;

  const config = TEMPLATE_CONFIGS.find((t) => t.id === id);
  if (!config) notFound();

  return <TemplateRender config={config} bgUrl={bgUrl} />;
}
