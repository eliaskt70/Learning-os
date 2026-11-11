import { resourceTypeLabels } from './labels';
import type { AppData, ID } from './types';

export interface NextAction {
  kind: 'task' | 'resource' | 'journal' | 'project' | 'path';
  title: string;
  detail: string;
  href: string;
}

/**
 * Simple, predictable heuristic for the single "next step" on the dashboard:
 * 1. first open task (by order) in the most recently updated active project
 * 2. continue a resource that is in progress
 * 3. start a planned resource
 * 4. write a journal entry if none today
 * 5. create a project / path when nothing exists
 */
export function getNextAction(data: AppData, today: string): NextAction {
  const activeProjects = data.projects
    .filter((p) => p.status === 'active')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  for (const project of activeProjects) {
    const task = data.tasks
      .filter((t) => t.projectId === project.id && !t.done)
      .sort((a, b) => a.order - b.order)[0];
    if (task) {
      return { kind: 'task', title: task.title, detail: `مهمة في مشروع: ${project.title}`, href: `#/projects/${project.id}` };
    }
  }

  const byRecent = [...data.resources].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const inProgress = byRecent.find((r) => r.status === 'in_progress');
  if (inProgress) {
    return { kind: 'resource', title: inProgress.title, detail: `أكمل ${resourceTypeLabels[inProgress.type]} قيد التعلّم`, href: '#/resources' };
  }
  const planned = [...data.resources].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).find((r) => r.status === 'planned');
  if (planned) {
    return { kind: 'resource', title: planned.title, detail: `ابدأ ${resourceTypeLabels[planned.type]} من قائمتك`, href: '#/resources' };
  }

  if (data.paths.length === 0) {
    return { kind: 'path', title: 'أنشئ أول مسار تعلّم', detail: 'المسار يجمع المواضيع التي تريد تعلّمها', href: '#/paths' };
  }
  if (!data.journal.some((j) => j.date === today)) {
    return { kind: 'journal', title: 'اكتب مذكرة تعلّم اليوم', detail: 'ماذا تعلّمت؟ ماذا مارست؟', href: '#/journal' };
  }
  return { kind: 'project', title: 'أنشئ مشروعًا تطبيقيًا جديدًا', detail: 'طبّق ما تتعلّمه على مشكلة حقيقية', href: '#/projects' };
}

export interface ActivityItem {
  id: string;
  at: string;
  icon: string;
  text: string;
  href: string;
}

/** Recent activity is derived from timestamps, so it always reflects current (non-deleted) data. */
export function getRecentActivity(data: AppData, limit = 8): ActivityItem[] {
  const projectTitle = new Map<ID, string>(data.projects.map((p) => [p.id, p.title]));
  const items: ActivityItem[] = [];

  for (const j of data.journal) {
    items.push({ id: `j-${j.id}`, at: j.createdAt, icon: '📝', text: `مذكرة تعلّم: ${j.learned || j.practiced || 'بدون عنوان'}`, href: '#/journal' });
  }
  for (const t of data.tasks) {
    if (t.done && t.completedAt) {
      items.push({ id: `t-${t.id}`, at: t.completedAt, icon: '✅', text: `أنجزت مهمة: ${t.title} (${projectTitle.get(t.projectId) ?? ''})`, href: `#/projects/${t.projectId}` });
    }
  }
  for (const r of data.resources) {
    const verb = r.status === 'completed' ? 'أكملت' : r.status === 'in_progress' ? 'تعمل على' : 'أضفت';
    const at = r.status === 'planned' ? r.createdAt : r.updatedAt;
    items.push({ id: `r-${r.id}`, at, icon: '📚', text: `${verb} ${resourceTypeLabels[r.type]}: ${r.title}`, href: '#/resources' });
  }
  for (const p of data.projects) {
    items.push({ id: `p-${p.id}`, at: p.createdAt, icon: '🛠️', text: `أنشأت مشروع: ${p.title}`, href: `#/projects/${p.id}` });
  }

  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

export function projectProgress(data: AppData, projectId: ID): { done: number; total: number } {
  const tasks = data.tasks.filter((t) => t.projectId === projectId);
  return { done: tasks.filter((t) => t.done).length, total: tasks.length };
}

export function pathStats(data: AppData, pathId: ID) {
  const topicIds = new Set(data.topics.filter((t) => t.pathId === pathId).map((t) => t.id));
  const resources = data.resources.filter((r) => r.topicId && topicIds.has(r.topicId));
  return {
    topics: topicIds.size,
    resources: resources.length,
    completedResources: resources.filter((r) => r.status === 'completed').length,
    projects: data.projects.filter((p) => p.pathId === pathId).length,
  };
}
