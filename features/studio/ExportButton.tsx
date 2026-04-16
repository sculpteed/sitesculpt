'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useStudioStore } from './store';
import { errorMessage } from './api-helpers';

export function ExportButton() {
  const projectId = useStudioStore((s) => s.projectId);
  const state = useStudioStore((s) => s.state);
  const [busy, setBusy] = useState(false);

  const disabled = !projectId || state !== 'done' || busy;

  const handleExport = async (): Promise<void> => {
    if (!projectId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/export/${projectId}`);
      if (!res.ok) {
        alert(`Export failed: ${await errorMessage(res, 'Export failed')}`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sitesculpt-${projectId}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled}
      className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition disabled:cursor-not-allowed disabled:opacity-30 hover:bg-white/90"
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">Export Next.js project</span>
      <span className="sm:hidden">Export</span>
    </button>
  );
}
