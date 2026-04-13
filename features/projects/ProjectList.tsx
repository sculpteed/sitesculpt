'use client';

import { useEffect, useState } from 'react';
import { FadeIn, StaggerGroup, StaggerChild, ScaleOnHover, SmoothScroll, PageTransition } from '@/components/motion';
import { Plus, ExternalLink } from 'lucide-react';

interface ProjectSummary {
  projectId: string;
  brandName: string;
  headline: string;
  palette: { background: string; foreground: string; accent: string };
  createdAt: number;
}

export function ProjectList({ userId }: { userId: string }) {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects?userId=${encodeURIComponent(userId)}`)
      .then((r) => r.json())
      .then((data: { projects: ProjectSummary[] }) => {
        setProjects(data.projects ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  return (
    <SmoothScroll>
      <PageTransition>
        <main className="min-h-screen bg-warm text-warm">
          {/* Header */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--color-border)] bg-[rgba(13,10,8,0.95)] px-5 py-3 backdrop-blur-lg sm:px-8">
            <a href="/" className="flex items-center gap-2.5 text-sm font-medium tracking-tight text-warm">
              <div className="h-4 w-4 rounded-[3px]" style={{ backgroundColor: '#f3ead9' }} />
              sitesculpt
            </a>
            <a
              href="/studio"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-medium text-[#0d0a08]"
              style={{ backgroundColor: '#e8b874' }}
            >
              <Plus className="h-3.5 w-3.5" />
              New project
            </a>
          </header>

          <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8">
            <FadeIn>
              <h1 className="mb-8 font-serif text-3xl tracking-[-0.02em] text-warm sm:text-4xl">
                Your{' '}
                <em className="italic" style={{ color: '#f5d9a8' }}>
                  projects.
                </em>
              </h1>
            </FadeIn>

            {loading ? (
              <div className="text-[13px] text-warm-muted">Loading…</div>
            ) : projects.length === 0 ? (
              <FadeIn delay={0.1}>
                <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(243,234,217,0.01)] p-10 text-center">
                  <p className="mb-4 text-[14px] text-warm-muted">
                    No projects yet. Start sculpting to see them here.
                  </p>
                  <a
                    href="/studio"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium text-[#0d0a08]"
                    style={{ backgroundColor: '#e8b874' }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create your first project
                  </a>
                </div>
              </FadeIn>
            ) : (
              <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
                {projects.map((p) => (
                  <StaggerChild key={p.projectId}>
                    <ScaleOnHover scale={1.02}>
                      <a
                        href={`/studio?project=${p.projectId}`}
                        className="group flex flex-col rounded-xl border border-[var(--color-border)] bg-[rgba(243,234,217,0.01)] p-5 transition hover:border-[var(--color-border-strong)]"
                      >
                        {/* Mini palette preview */}
                        <div className="mb-4 flex gap-1">
                          <div
                            className="h-8 flex-1 rounded-l-md"
                            style={{ backgroundColor: p.palette.background }}
                          />
                          <div
                            className="h-8 flex-1"
                            style={{ backgroundColor: p.palette.foreground }}
                          />
                          <div
                            className="h-8 flex-1 rounded-r-md"
                            style={{ backgroundColor: p.palette.accent }}
                          />
                        </div>
                        <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-warm-subtle">
                          {p.brandName}
                        </div>
                        <div className="mb-3 font-serif text-lg leading-tight tracking-tight text-warm">
                          {p.headline}
                        </div>
                        <div className="mt-auto flex items-center justify-between text-[10px] text-warm-subtle">
                          <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                            Open <ExternalLink className="h-3 w-3" />
                          </span>
                        </div>
                      </a>
                    </ScaleOnHover>
                  </StaggerChild>
                ))}
              </StaggerGroup>
            )}
          </div>
        </main>
      </PageTransition>
    </SmoothScroll>
  );
}
