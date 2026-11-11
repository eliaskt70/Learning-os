import type {
  AppData,
  ID,
  JournalEntry,
  LearningPath,
  Project,
  Resource,
  Task,
  Topic,
} from '../lib/types';

type Meta = 'id' | 'createdAt' | 'updatedAt';

export type PathInput = Omit<LearningPath, Meta | 'order'>;
export type TopicInput = Omit<Topic, Meta | 'order'>;
export type ResourceInput = Omit<Resource, Meta>;
export type ProjectInput = Omit<Project, Meta>;
export type TaskInput = Omit<Task, Meta | 'order' | 'completedAt' | 'done'>;
export type JournalInput = Omit<JournalEntry, Meta>;

/** `id` and `now` are supplied by the caller so the reducer stays pure. */
interface Stamp {
  id: ID;
  now: string;
}

export type Action =
  | ({ type: 'path/add'; input: PathInput } & Stamp)
  | ({ type: 'path/update'; input: Partial<PathInput> } & Stamp)
  | ({ type: 'path/delete' } & Stamp)
  | ({ type: 'path/move'; direction: -1 | 1 } & Stamp)
  | ({ type: 'topic/add'; input: TopicInput } & Stamp)
  | ({ type: 'topic/update'; input: Partial<TopicInput> } & Stamp)
  | ({ type: 'topic/delete' } & Stamp)
  | ({ type: 'topic/move'; direction: -1 | 1 } & Stamp)
  | ({ type: 'resource/add'; input: ResourceInput } & Stamp)
  | ({ type: 'resource/update'; input: Partial<ResourceInput> } & Stamp)
  | ({ type: 'resource/delete' } & Stamp)
  | ({ type: 'project/add'; input: ProjectInput } & Stamp)
  | ({ type: 'project/update'; input: Partial<ProjectInput> } & Stamp)
  | ({ type: 'project/delete' } & Stamp)
  | ({ type: 'task/add'; input: TaskInput } & Stamp)
  | ({ type: 'task/update'; input: Partial<TaskInput> } & Stamp)
  | ({ type: 'task/toggle' } & Stamp)
  | ({ type: 'task/delete' } & Stamp)
  | ({ type: 'task/move'; direction: -1 | 1 } & Stamp)
  | ({ type: 'journal/add'; input: JournalInput } & Stamp)
  | ({ type: 'journal/update'; input: Partial<JournalInput> } & Stamp)
  | ({ type: 'journal/delete' } & Stamp)
  | { type: 'data/replace'; data: AppData };

interface Ordered {
  id: ID;
  order: number;
}

function nextOrder(items: { order: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.order), -1) + 1;
}

/** Swap an item with its neighbour among `siblings` (already filtered to the same group). */
function move<T extends Ordered>(all: T[], siblings: T[], id: ID, direction: -1 | 1, now: string): T[] {
  const sorted = [...siblings].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((item) => item.id === id);
  const target = sorted[index + direction];
  if (index === -1 || !target) return all;
  const current = sorted[index];
  return all.map((item) => {
    if (item.id === current.id) return { ...item, order: target.order, updatedAt: now };
    if (item.id === target.id) return { ...item, order: current.order, updatedAt: now };
    return item;
  });
}

function update<T extends { id: ID; updatedAt: string }>(items: T[], id: ID, patch: NoInfer<Partial<T>>, now: string): T[] {
  return items.map((item) => (item.id === id ? { ...item, ...patch, updatedAt: now } : item));
}

function unlinkTopics<T extends { topicId: ID | null }>(items: T[], topicIds: Set<ID>): T[] {
  return items.map((item) => (item.topicId && topicIds.has(item.topicId) ? { ...item, topicId: null } : item));
}

export function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'path/add': {
      const { id, now, input } = action;
      const path: LearningPath = { ...input, id, order: nextOrder(state.paths), createdAt: now, updatedAt: now };
      return { ...state, paths: [...state.paths, path] };
    }
    case 'path/update':
      return { ...state, paths: update(state.paths, action.id, action.input, action.now) };
    case 'path/delete': {
      // Topics belong to a path and are removed with it; everything else is kept but unlinked.
      const removedTopics = new Set(state.topics.filter((t) => t.pathId === action.id).map((t) => t.id));
      return {
        ...state,
        paths: state.paths.filter((p) => p.id !== action.id),
        topics: state.topics.filter((t) => t.pathId !== action.id),
        resources: unlinkTopics(state.resources, removedTopics),
        tasks: unlinkTopics(state.tasks, removedTopics),
        journal: unlinkTopics(state.journal, removedTopics),
        projects: state.projects.map((p) => (p.pathId === action.id ? { ...p, pathId: null } : p)),
      };
    }
    case 'path/move':
      return { ...state, paths: move(state.paths, state.paths, action.id, action.direction, action.now) };

    case 'topic/add': {
      const { id, now, input } = action;
      const siblings = state.topics.filter((t) => t.pathId === input.pathId);
      const topic: Topic = { ...input, id, order: nextOrder(siblings), createdAt: now, updatedAt: now };
      return { ...state, topics: [...state.topics, topic] };
    }
    case 'topic/update': {
      const existing = state.topics.find((t) => t.id === action.id);
      if (!existing) return state;
      const patch: Partial<Topic> = { ...action.input };
      // Moving a topic to another path places it at the end of that path.
      if (patch.pathId && patch.pathId !== existing.pathId) {
        patch.order = nextOrder(state.topics.filter((t) => t.pathId === patch.pathId));
      }
      return { ...state, topics: update(state.topics, action.id, patch, action.now) };
    }
    case 'topic/delete': {
      const removed = new Set([action.id]);
      return {
        ...state,
        topics: state.topics.filter((t) => t.id !== action.id),
        resources: unlinkTopics(state.resources, removed),
        tasks: unlinkTopics(state.tasks, removed),
        journal: unlinkTopics(state.journal, removed),
      };
    }
    case 'topic/move': {
      const topic = state.topics.find((t) => t.id === action.id);
      if (!topic) return state;
      const siblings = state.topics.filter((t) => t.pathId === topic.pathId);
      return { ...state, topics: move(state.topics, siblings, action.id, action.direction, action.now) };
    }

    case 'resource/add': {
      const resource: Resource = { ...action.input, id: action.id, createdAt: action.now, updatedAt: action.now };
      return { ...state, resources: [resource, ...state.resources] };
    }
    case 'resource/update':
      return { ...state, resources: update(state.resources, action.id, action.input, action.now) };
    case 'resource/delete':
      return { ...state, resources: state.resources.filter((r) => r.id !== action.id) };

    case 'project/add': {
      const project: Project = { ...action.input, id: action.id, createdAt: action.now, updatedAt: action.now };
      return { ...state, projects: [project, ...state.projects] };
    }
    case 'project/update':
      return { ...state, projects: update(state.projects, action.id, action.input, action.now) };
    case 'project/delete':
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.id),
        tasks: state.tasks.filter((t) => t.projectId !== action.id),
      };

    case 'task/add': {
      const { id, now, input } = action;
      const siblings = state.tasks.filter((t) => t.projectId === input.projectId);
      const task: Task = {
        ...input,
        id,
        done: false,
        completedAt: null,
        order: nextOrder(siblings),
        createdAt: now,
        updatedAt: now,
      };
      return { ...state, tasks: [...state.tasks, task] };
    }
    case 'task/update':
      return { ...state, tasks: update(state.tasks, action.id, action.input, action.now) };
    case 'task/toggle':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id
            ? { ...t, done: !t.done, completedAt: t.done ? null : action.now, updatedAt: action.now }
            : t,
        ),
      };
    case 'task/delete':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };
    case 'task/move': {
      const task = state.tasks.find((t) => t.id === action.id);
      if (!task) return state;
      const siblings = state.tasks.filter((t) => t.projectId === task.projectId);
      return { ...state, tasks: move(state.tasks, siblings, action.id, action.direction, action.now) };
    }

    case 'journal/add': {
      const entry: JournalEntry = { ...action.input, id: action.id, createdAt: action.now, updatedAt: action.now };
      return { ...state, journal: [entry, ...state.journal] };
    }
    case 'journal/update':
      return { ...state, journal: update(state.journal, action.id, action.input, action.now) };
    case 'journal/delete':
      return { ...state, journal: state.journal.filter((j) => j.id !== action.id) };

    case 'data/replace':
      return action.data;
  }
}
