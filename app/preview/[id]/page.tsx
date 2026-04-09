import { notFound } from 'next/navigation';
import { readJson, listFrames, fileExists } from '@/lib/cache';
import type { Scene, SiteStructure } from '@/features/pipeline/types';
import { PreviewSite } from '@/features/studio/preview/PreviewSite';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

/**
 * /preview/[id] — full-bleed preview of a generated site.
 *
 * Renders exactly what the exported Next.js project would render, using the
 * SAME Section components the export template uses. No sitesculpt chrome,
 * no dashboard framing. This is what "previewing" should have meant from
 * day one.
 */
export default async function PreviewPage({ params }: PreviewPageProps) {
  const { id } = await params;

  const scene = await readJson<Scene>(id, 'scene.json');
  const site = await readJson<SiteStructure>(id, 'site.json');

  if (!scene || !site) {
    notFound();
  }

  const frames = await listFrames(id);
  const hasKeyframe = await fileExists(id, 'keyframe.png');

  return (
    <PreviewSite
      projectId={id}
      scene={scene}
      site={site}
      frameCount={frames.length}
      hasKeyframe={hasKeyframe}
    />
  );
}
