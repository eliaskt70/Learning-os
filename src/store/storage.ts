import type { AppData } from '../lib/types';
import { createSampleData } from './sampleData';

export const STORAGE_KEY = 'learning-os:data:v1';

const COLLECTIONS = ['paths', 'topics', 'resources', 'projects', 'tasks', 'journal'] as const;

/** Light structural validation: enough to reject unrelated or corrupted JSON. */
export function parseAppData(raw: unknown): AppData | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (obj.version !== 1) return null;
  for (const key of COLLECTIONS) {
    const list = obj[key];
    if (!Array.isArray(list)) return null;
    if (!list.every((item) => item && typeof item === 'object' && typeof (item as { id?: unknown }).id === 'string')) {
      return null;
    }
  }
  return obj as unknown as AppData;
}

export type LoadResult =
  | { status: 'loaded'; data: AppData }
  | { status: 'fresh'; data: AppData }
  | { status: 'corrupt'; data: AppData; raw: string };

export function loadData(storage: Storage | undefined = globalThis.localStorage): LoadResult {
  let raw: string | null = null;
  try {
    raw = storage?.getItem(STORAGE_KEY) ?? null;
  } catch {
    // Storage can be blocked (e.g. some private-browsing modes); fall through to sample data.
  }
  if (raw === null) return { status: 'fresh', data: createSampleData() };
  try {
    const data = parseAppData(JSON.parse(raw));
    if (data) return { status: 'loaded', data };
  } catch {
    // handled below
  }
  return { status: 'corrupt', data: createSampleData(), raw };
}

export function saveData(data: AppData, storage: Storage | undefined = globalThis.localStorage): boolean {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
