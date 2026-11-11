import type { ProjectStatus, ResourceStatus, ResourceType } from './types';

export const resourceTypeLabels: Record<ResourceType, string> = {
  course: 'دورة',
  video: 'فيديو',
  article: 'مقال',
  book: 'كتاب',
  link: 'رابط',
};

export const resourceStatusLabels: Record<ResourceStatus, string> = {
  planned: 'مخطط',
  in_progress: 'قيد التعلّم',
  completed: 'مكتمل',
};

export const projectStatusLabels: Record<ProjectStatus, string> = {
  active: 'نشط',
  paused: 'متوقف مؤقتًا',
  done: 'منجز',
};

export const pathColors = ['#1f4f8f', '#0f766e', '#9a3412', '#6d28d9', '#be123c', '#4d7c0f'];

const dateFormatter = new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long', year: 'numeric' });

export function formatDate(value: string): string {
  // Date-only strings are parsed as local dates to avoid timezone shifts.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  return Number.isNaN(d.getTime()) ? value : dateFormatter.format(d);
}

export function todayISODate(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
