'use client';

import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'sitesculpt';
const DB_VERSION = 1;
const STORE = 'projects';

export interface PersistedProject {
  projectId: string;
  prompt: string;
  aspect: '16:9' | '9:16' | '1:1';
  heroOverride?: {
    headline?: string;
    subheadline?: string;
    ctaPrimary?: string;
  };
  updatedAt: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'projectId' });
        }
      },
    });
  }
  return dbPromise;
}

export async function savePersistedProject(project: PersistedProject): Promise<void> {
  const db = await getDb();
  await db.put(STORE, { ...project, updatedAt: Date.now() });
}

export async function loadPersistedProject(projectId: string): Promise<PersistedProject | null> {
  const db = await getDb();
  const row = (await db.get(STORE, projectId)) as PersistedProject | undefined;
  return row ?? null;
}

export async function loadLatestProject(): Promise<PersistedProject | null> {
  const db = await getDb();
  const all = (await db.getAll(STORE)) as PersistedProject[];
  if (all.length === 0) return null;
  return all.sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? null;
}

/** Debounce helper — save at most every `ms` milliseconds. */
export function debounce<T extends (...args: never[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, ms);
  }) as T;
}
