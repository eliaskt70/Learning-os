import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import type { AppData, ID } from '../lib/types';
import { uid } from '../lib/uid';
import {
  reducer,
  type Action,
  type JournalInput,
  type PathInput,
  type ProjectInput,
  type ResourceInput,
  type TaskInput,
  type TopicInput,
} from './reducer';
import { loadData, parseAppData, saveData, STORAGE_KEY, type LoadResult } from './storage';

type Dir = -1 | 1;

function createActions(dispatch: (a: Action) => void) {
  const now = () => new Date().toISOString();
  const add = <T extends Action['type']>(type: T) => (input: unknown): ID => {
    const id = uid();
    dispatch({ type, input, id, now: now() } as Action);
    return id;
  };
  const upd = <T extends Action['type']>(type: T) => (id: ID, input: unknown) =>
    dispatch({ type, input, id, now: now() } as Action);
  const del = <T extends Action['type']>(type: T) => (id: ID) => dispatch({ type, id, now: now() } as Action);
  const mv = <T extends Action['type']>(type: T) => (id: ID, direction: Dir) =>
    dispatch({ type, id, direction, now: now() } as Action);

  return {
    addPath: add('path/add') as (input: PathInput) => ID,
    updatePath: upd('path/update') as (id: ID, input: Partial<PathInput>) => void,
    deletePath: del('path/delete'),
    movePath: mv('path/move'),
    addTopic: add('topic/add') as (input: TopicInput) => ID,
    updateTopic: upd('topic/update') as (id: ID, input: Partial<TopicInput>) => void,
    deleteTopic: del('topic/delete'),
    moveTopic: mv('topic/move'),
    addResource: add('resource/add') as (input: ResourceInput) => ID,
    updateResource: upd('resource/update') as (id: ID, input: Partial<ResourceInput>) => void,
    deleteResource: del('resource/delete'),
    addProject: add('project/add') as (input: ProjectInput) => ID,
    updateProject: upd('project/update') as (id: ID, input: Partial<ProjectInput>) => void,
    deleteProject: del('project/delete'),
    addTask: add('task/add') as (input: TaskInput) => ID,
    updateTask: upd('task/update') as (id: ID, input: Partial<TaskInput>) => void,
    toggleTask: del('task/toggle'),
    deleteTask: del('task/delete'),
    moveTask: mv('task/move'),
    addJournal: add('journal/add') as (input: JournalInput) => ID,
    updateJournal: upd('journal/update') as (id: ID, input: Partial<JournalInput>) => void,
    deleteJournal: del('journal/delete'),
    replaceData: (data: AppData) => dispatch({ type: 'data/replace', data }),
  };
}

export type Actions = ReturnType<typeof createActions>;

interface StoreValue {
  data: AppData;
  actions: Actions;
  loadStatus: LoadResult['status'];
  saveFailed: boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const initial = useRef<LoadResult | null>(null);
  if (!initial.current) {
    initial.current = loadData();
    if (initial.current.status === 'corrupt') {
      // Keep unreadable data instead of silently overwriting it.
      try {
        localStorage.setItem(`${STORAGE_KEY}:corrupt-backup`, initial.current.raw);
      } catch {
        /* ignore */
      }
    }
  }
  const [data, dispatch] = useReducer(reducer, initial.current.data);
  const [saveFailed, setSaveFailed] = useState(false);
  const actions = useMemo(() => createActions(dispatch), []);

  useEffect(() => {
    setSaveFailed(!saveData(data));
  }, [data]);

  // Keep multiple open tabs consistent: adopt changes written by another tab.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const next = parseAppData(JSON.parse(e.newValue));
        if (next) dispatch({ type: 'data/replace', data: next });
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo(
    () => ({ data, actions, loadStatus: initial.current!.status, saveFailed }),
    [data, actions, saveFailed],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
