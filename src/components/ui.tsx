import type { ReactNode } from 'react';
import { useStore } from '../store/StoreContext';

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

/** Topic picker grouped by learning path. */
export function TopicSelect({
  value,
  onChange,
  emptyLabel = 'بدون موضوع',
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  emptyLabel?: string;
}) {
  const { data } = useStore();
  const paths = [...data.paths].sort((a, b) => a.order - b.order);
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">{emptyLabel}</option>
      {paths.map((path) => (
        <optgroup key={path.id} label={path.title}>
          {data.topics
            .filter((t) => t.pathId === path.id)
            .sort((a, b) => a.order - b.order)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
}

export function PathSelect({ value, onChange }: { value: string | null; onChange: (value: string | null) => void }) {
  const { data } = useStore();
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">بدون مسار</option>
      {[...data.paths]
        .sort((a, b) => a.order - b.order)
        .map((p) => (
          <option key={p.id} value={p.id}>
            {p.title}
          </option>
        ))}
    </select>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <p className="empty-title">{title}</p>
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function TopicTag({ topicId }: { topicId: string | null }) {
  const { data } = useStore();
  if (!topicId) return null;
  const topic = data.topics.find((t) => t.id === topicId);
  if (!topic) return null;
  const path = data.paths.find((p) => p.id === topic.pathId);
  return (
    <a className="tag" href={`#/paths/${topic.pathId}`} style={{ borderColor: path?.color, color: path?.color }}>
      {topic.title}
    </a>
  );
}

export function confirmDelete(what: string): boolean {
  return window.confirm(`هل تريد حذف ${what}؟ لا يمكن التراجع عن هذا الإجراء.`);
}
