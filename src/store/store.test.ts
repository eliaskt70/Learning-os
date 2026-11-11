import { describe, expect, it } from 'vitest';
import { getNextAction, getRecentActivity } from '../lib/insights';
import { reducer, type Action } from './reducer';
import { createEmptyData, createSampleData } from './sampleData';
import { loadData, parseAppData, saveData, STORAGE_KEY } from './storage';

const now = '2026-01-01T10:00:00.000Z';
const run = (state = createSampleData(), ...actions: Action[]) => actions.reduce(reducer, state);

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  key(i: number) {
    return [...this.map.keys()][i] ?? null;
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
}

describe('reducer', () => {
  it('adds, updates and deletes a resource', () => {
    let s = run(createEmptyData(), {
      type: 'resource/add',
      id: 'r1',
      now,
      input: { title: 'A', type: 'video', url: '', topicId: null, status: 'planned', notes: '' },
    });
    expect(s.resources).toHaveLength(1);
    s = reducer(s, { type: 'resource/update', id: 'r1', now, input: { status: 'completed' } });
    expect(s.resources[0].status).toBe('completed');
    s = reducer(s, { type: 'resource/delete', id: 'r1', now });
    expect(s.resources).toHaveLength(0);
  });

  it('deleting a path removes its topics and unlinks references', () => {
    const s = run(undefined, { type: 'path/delete', id: 'path-ai', now });
    expect(s.paths.map((p) => p.id)).toEqual(['path-comm']);
    expect(s.topics.every((t) => t.pathId === 'path-comm')).toBe(true);
    expect(s.resources.find((r) => r.id === 'res-prompt-guide')?.topicId).toBeNull();
    expect(s.tasks.find((t) => t.id === 'task-2')?.topicId).toBeNull();
    expect(s.projects.find((p) => p.id === 'proj-email')?.pathId).toBeNull();
    expect(s.resources).toHaveLength(createSampleData().resources.length);
  });

  it('deleting a project removes its tasks', () => {
    const s = run(undefined, { type: 'project/delete', id: 'proj-email', now });
    expect(s.tasks.some((t) => t.projectId === 'proj-email')).toBe(false);
    expect(s.tasks.some((t) => t.projectId === 'proj-talk')).toBe(true);
  });

  it('toggles a task and records completion time', () => {
    let s = run(undefined, { type: 'task/toggle', id: 'task-2', now });
    expect(s.tasks.find((t) => t.id === 'task-2')).toMatchObject({ done: true, completedAt: now });
    s = reducer(s, { type: 'task/toggle', id: 'task-2', now });
    expect(s.tasks.find((t) => t.id === 'task-2')).toMatchObject({ done: false, completedAt: null });
  });

  it('reorders topics only within the same path', () => {
    const s = run(undefined, { type: 'topic/move', id: 'topic-automation', direction: -1, now });
    const ai = s.topics.filter((t) => t.pathId === 'path-ai').sort((a, b) => a.order - b.order);
    expect(ai.map((t) => t.id)).toEqual(['topic-automation', 'topic-prompting', 'topic-python']);
    // Moving the first item up is a no-op.
    expect(reducer(s, { type: 'topic/move', id: 'topic-automation', direction: -1, now })).toEqual(s);
  });

  it('appends new tasks at the end of their project', () => {
    const s = run(undefined, { type: 'task/add', id: 'new', now, input: { projectId: 'proj-talk', title: 'x', topicId: null } });
    const talk = s.tasks.filter((t) => t.projectId === 'proj-talk').sort((a, b) => a.order - b.order);
    expect(talk.at(-1)?.id).toBe('new');
  });
});

describe('storage', () => {
  it('round-trips data and loads sample data on first run', () => {
    const storage = new MemoryStorage();
    expect(loadData(storage).status).toBe('fresh');
    const data = run(undefined, { type: 'journal/delete', id: 'journal-1', now });
    expect(saveData(data, storage)).toBe(true);
    const loaded = loadData(storage);
    expect(loaded.status).toBe('loaded');
    expect(loaded.data).toEqual(data);
  });

  it('flags corrupted data instead of crashing', () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, '{not json');
    expect(loadData(storage).status).toBe('corrupt');
    expect(parseAppData({ version: 1, paths: [] })).toBeNull();
  });
});

describe('insights', () => {
  it('recommends the first open task of an active project', () => {
    const next = getNextAction(createSampleData(), '2026-01-01');
    expect(next.kind).toBe('task');
  });

  it('suggests creating a path when everything is empty', () => {
    expect(getNextAction(createEmptyData(), '2026-01-01').kind).toBe('path');
  });

  it('lists recent activity newest first', () => {
    const items = getRecentActivity(createSampleData());
    expect(items.length).toBeGreaterThan(0);
    const times = items.map((i) => i.at);
    expect([...times].sort().reverse()).toEqual(times);
  });
});
