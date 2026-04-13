'use client';

import { useState } from 'react';
import { Sparkles, Layers } from 'lucide-react';
import { PipelinePanel } from './PipelinePanel';
import { StructureReview } from './StructureReview';
import { ChatPanel } from './ChatPanel';
import type { FunnelStep, PipelineState } from './store';
import type { Scene, SiteSection, SiteStructure } from '@/features/pipeline/types';

type TabId = 'sections' | 'ai';

interface SidebarTabsProps {
  funnelStep: FunnelStep;
  site: SiteStructure | null;
  scene: Scene | null;
  state: PipelineState;
  sectionOverrides: Record<number, Partial<SiteSection>>;
  setSectionOverride: (index: number, patch: Partial<SiteSection>) => void;
  onStructureApprove: () => void;
  funnelBusy: boolean;
}

/**
 * Tabbed sidebar — "Sections" (structure editor) and "AI Editor" (chat).
 * The AI chat is always visible as a tab, not hidden behind a floating button.
 * This makes it obvious that natural-language editing is a first-class feature.
 */
export function SidebarTabs({
  funnelStep,
  site,
  scene,
  state,
  sectionOverrides,
  setSectionOverride,
  onStructureApprove,
  funnelBusy,
}: SidebarTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('sections');

  const showStructureReview =
    (funnelStep === 'copy-review' || funnelStep === 'preview') && site;

  return (
    <aside className="flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-[var(--color-border)]">
        <TabButton
          active={activeTab === 'sections'}
          onClick={() => setActiveTab('sections')}
          icon={<Layers className="h-3.5 w-3.5" />}
          label="Sections"
        />
        <TabButton
          active={activeTab === 'ai'}
          onClick={() => setActiveTab('ai')}
          icon={<Sparkles className="h-3.5 w-3.5" />}
          label="AI Editor"
          accent
        />
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'sections' ? (
          showStructureReview ? (
            <StructureReview onApprove={onStructureApprove} busy={funnelBusy} />
          ) : (
            <div className="flex flex-col gap-4 p-4">
              <PipelinePanel />
              {scene ? <SceneCard scene={scene} /> : null}
            </div>
          )
        ) : (
          <ChatPanelInline />
        )}
      </div>
    </aside>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-[11px] uppercase tracking-[0.15em] transition ${
        active
          ? accent
            ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-accent)]'
            : 'border-b-2 border-warm text-warm'
          : 'text-warm-subtle hover:text-warm-muted'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// Inline version of ChatPanel — renders directly in the sidebar, not floating
function ChatPanelInline() {
  return (
    <div className="flex h-full flex-col">
      <ChatPanel inline />
    </div>
  );
}

// Scene card (moved from Studio.tsx subcomponents)
function SceneCard({ scene }: { scene: Scene }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[rgba(243,234,217,0.012)] p-4">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-warm-subtle">
        Scene
      </div>
      <div className="mb-3 text-[12px] italic text-warm-muted">&ldquo;{scene.concept}&rdquo;</div>
      <div className="flex gap-1.5">
        {[scene.palette.background, scene.palette.foreground, scene.palette.accent].map(
          (color, i) => (
            <div
              key={i}
              className="h-8 flex-1 rounded-md border border-[var(--color-border)]"
              style={{ backgroundColor: color }}
              title={color}
            />
          ),
        )}
      </div>
    </div>
  );
}
