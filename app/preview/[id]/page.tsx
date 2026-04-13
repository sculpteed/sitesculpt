import { notFound } from 'next/navigation';
import { readJson, listFrames, fileExists } from '@/lib/cache';
import type { Scene, SiteStructure } from '@/features/pipeline/types';
import { PreviewSite } from '@/features/studio/preview/PreviewSite';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface PreviewPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const { id } = await params;
  const sp = await searchParams;

  const scene = await readJson<Scene>(id, 'scene.json');
  const site = await readJson<SiteStructure>(id, 'site.json');

  if (!scene || !site) {
    notFound();
  }

  const frames = await listFrames(id);
  const hasKeyframe = await fileExists(id, 'keyframe.png');
  const editable = sp.edit === '1';

  return (
    <PreviewSite
      projectId={id}
      scene={scene}
      site={site}
      frameCount={frames.length}
      hasKeyframe={hasKeyframe}
      editable={editable}
    />
  );
}
