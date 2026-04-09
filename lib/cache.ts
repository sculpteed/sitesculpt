import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Progress, StepName } from '@/features/pipeline/types';

// ─── Dual-mode storage ──────────────────────────────────────────────────────
// Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is set (production + preview),
// falls back to local filesystem when it's not (local dev). The API surface
// is identical so the rest of the codebase doesn't care which backend is active.

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const USE_BLOB = Boolean(BLOB_TOKEN);
const CACHE_ROOT = path.resolve(process.cwd(), '.cache', 'projects');

function blobPath(projectId: string, file: string): string {
  return `projects/${projectId}/${file}`;
}

// ─── Input hashing ──────────────────────────────────────────────────────────

export interface GenerateInput {
  prompt: string;
  aspect: '16:9' | '9:16' | '1:1';
  variationSeed?: string;
}

export function hashInput(input: GenerateInput): string {
  const normalized = JSON.stringify({
    prompt: input.prompt.trim().toLowerCase(),
    aspect: input.aspect,
    seed: input.variationSeed ?? '',
  });
  return createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

// ─── Directory helpers (filesystem only) ────────────────────────────────────

export function getProjectDir(projectId: string): string {
  return path.join(CACHE_ROOT, projectId);
}

export async function ensureProjectDir(projectId: string): Promise<string> {
  if (USE_BLOB) return ''; // blob doesn't need directories
  const dir = getProjectDir(projectId);
  await fs.mkdir(path.join(dir, 'frames'), { recursive: true });
  return dir;
}

// ─── JSON IO ────────────────────────────────────────────────────────────────

export async function readJson<T>(projectId: string, file: string): Promise<T | null> {
  if (USE_BLOB) {
    const { head } = await import('@vercel/blob');
    try {
      const blobUrl = await getBlobUrl(projectId, file);
      if (!blobUrl) return null;
      const resp = await fetch(blobUrl);
      if (!resp.ok) return null;
      return (await resp.json()) as T;
    } catch {
      return null;
    }
  }
  try {
    const raw = await fs.readFile(path.join(getProjectDir(projectId), file), 'utf8');
    return JSON.parse(raw) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }
}

export async function writeJson(projectId: string, file: string, data: unknown): Promise<void> {
  if (USE_BLOB) {
    const { put } = await import('@vercel/blob');
    await put(blobPath(projectId, file), JSON.stringify(data, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      token: BLOB_TOKEN,
    });
    return;
  }
  await ensureProjectDir(projectId);
  await fs.writeFile(
    path.join(getProjectDir(projectId), file),
    JSON.stringify(data, null, 2),
    'utf8',
  );
}

// ─── File IO ────────────────────────────────────────────────────────────────

export async function fileExists(projectId: string, file: string): Promise<boolean> {
  if (USE_BLOB) {
    const url = await getBlobUrl(projectId, file);
    return url !== null;
  }
  try {
    await fs.access(path.join(getProjectDir(projectId), file));
    return true;
  } catch {
    return false;
  }
}

export async function readFileBytes(projectId: string, file: string): Promise<Buffer> {
  if (USE_BLOB) {
    const url = await getBlobUrl(projectId, file);
    if (!url) throw new Error(`Blob not found: ${blobPath(projectId, file)}`);
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Blob fetch failed: ${resp.status}`);
    return Buffer.from(await resp.arrayBuffer());
  }
  return fs.readFile(path.join(getProjectDir(projectId), file));
}

export async function writeFileBytes(
  projectId: string,
  file: string,
  data: Buffer,
): Promise<void> {
  if (USE_BLOB) {
    const { put } = await import('@vercel/blob');
    await put(blobPath(projectId, file), data, {
      access: 'public',
      addRandomSuffix: false,
      token: BLOB_TOKEN,
    });
    return;
  }
  await ensureProjectDir(projectId);
  await fs.writeFile(path.join(getProjectDir(projectId), file), data);
}

/** Get the public blob URL for a file, or null if it doesn't exist. */
export async function getBlobUrl(projectId: string, file: string): Promise<string | null> {
  if (!USE_BLOB) return null;
  const { head } = await import('@vercel/blob');
  try {
    const info = await head(blobPath(projectId, file), { token: BLOB_TOKEN });
    return info.url;
  } catch {
    return null;
  }
}

// ─── Frame listing ──────────────────────────────────────────────────────────

export async function listFrames(projectId: string): Promise<string[]> {
  if (USE_BLOB) {
    const { list } = await import('@vercel/blob');
    const prefix = blobPath(projectId, 'frames/');
    const result = await list({ prefix, token: BLOB_TOKEN });
    return result.blobs
      .map((b) => b.pathname.split('/').pop() ?? '')
      .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
      .sort();
  }
  try {
    const files = await fs.readdir(path.join(getProjectDir(projectId), 'frames'));
    return files.filter((f) => /\.(jpg|jpeg|png)$/i.test(f)).sort();
  } catch {
    return [];
  }
}

// ─── Status IO (for SSE resume) ──────────────────────────────────────────────

export interface ProjectStatus {
  projectId: string;
  input: GenerateInput;
  steps: Record<StepName, Progress>;
  startedAt: number;
  updatedAt: number;
  completedAt?: number;
  failed?: { step: StepName; error: string };
}

export async function readStatus(projectId: string): Promise<ProjectStatus | null> {
  return readJson<ProjectStatus>(projectId, 'status.json');
}

export async function writeStatus(status: ProjectStatus): Promise<void> {
  status.updatedAt = Date.now();
  await writeJson(status.projectId, 'status.json', status);
}

export function initialStatus(projectId: string, input: GenerateInput): ProjectStatus {
  const now = Date.now();
  return {
    projectId,
    input,
    steps: {
      expandPrompt: { state: 'pending' },
      composeSite: { state: 'pending' },
      generateImage: { state: 'pending' },
      generateVideo: { state: 'pending' },
      extractFrames: { state: 'pending' },
    },
    startedAt: now,
    updatedAt: now,
  };
}
