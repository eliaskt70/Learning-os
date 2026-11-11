export type ID = string;

export interface LearningPath {
  id: ID;
  title: string;
  description: string;
  color: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: ID;
  pathId: ID;
  title: string;
  notes: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type ResourceType = 'course' | 'video' | 'article' | 'book' | 'link';
export type ResourceStatus = 'planned' | 'in_progress' | 'completed';

export interface Resource {
  id: ID;
  title: string;
  type: ResourceType;
  url: string;
  topicId: ID | null;
  status: ResourceStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'active' | 'paused' | 'done';

export interface Project {
  id: ID;
  title: string;
  description: string;
  pathId: ID | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: ID;
  projectId: ID;
  title: string;
  done: boolean;
  topicId: ID | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface JournalEntry {
  id: ID;
  date: string; // YYYY-MM-DD
  learned: string;
  practiced: string;
  problems: string;
  next: string;
  topicId: ID | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  version: 1;
  paths: LearningPath[];
  topics: Topic[];
  resources: Resource[];
  projects: Project[];
  tasks: Task[];
  journal: JournalEntry[];
}
