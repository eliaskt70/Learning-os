import { useState } from 'react';
import { FormModal } from '../components/FormModal';
import { confirmDelete, EmptyState, Field, PageHeader, TopicSelect, TopicTag } from '../components/ui';
import { formatDate, resourceStatusLabels, resourceTypeLabels } from '../lib/labels';
import type { Resource, ResourceStatus, ResourceType } from '../lib/types';
import type { ResourceInput } from '../store/reducer';
import { useStore } from '../store/StoreContext';

type Draft = ResourceInput & { id?: string };

const emptyDraft: Draft = { title: '', type: 'course', url: '', topicId: null, status: 'planned', notes: '' };
const statuses = Object.keys(resourceStatusLabels) as ResourceStatus[];
const types = Object.keys(resourceTypeLabels) as ResourceType[];

function safeUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
  } catch {
    return null;
  }
}

function ResourceForm({ draft, onClose }: { draft: Draft | null; onClose: () => void }) {
  const { actions } = useStore();
  const [form, setForm] = useState<Draft | null>(draft);
  const [lastDraft, setLastDraft] = useState(draft);
  if (draft !== lastDraft) {
    setLastDraft(draft);
    setForm(draft);
  }

  const save = () => {
    if (!form || !form.title.trim()) return;
    const { id, ...rest } = form;
    const input = { ...rest, title: rest.title.trim(), url: rest.url.trim(), notes: rest.notes.trim() };
    if (id) actions.updateResource(id, input);
    else actions.addResource(input);
    onClose();
  };

  return (
    <FormModal title={form?.id ? 'تعديل المصدر' : 'مصدر جديد'} open={!!draft} onClose={onClose} onSubmit={save}>
      {form && (
        <>
          <Field label="العنوان">
            <input required autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <div className="field-row">
            <Field label="النوع">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ResourceType })}>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {resourceTypeLabels[t]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="الحالة">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ResourceStatus })}>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {resourceStatusLabels[s]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="الرابط" hint="اختياري">
            <input type="url" dir="ltr" placeholder="https://" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </Field>
          <Field label="الموضوع">
            <TopicSelect value={form.topicId} onChange={(topicId) => setForm({ ...form, topicId })} />
          </Field>
          <Field label="ملاحظات">
            <textarea rows={5} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </>
      )}
    </FormModal>
  );
}

export function ResourcesPage() {
  const { data, actions } = useStore();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [status, setStatus] = useState<ResourceStatus | 'all'>('all');
  const [pathId, setPathId] = useState<string>('all');
  const [query, setQuery] = useState('');

  const topicPath = new Map(data.topics.map((t) => [t.id, t.pathId]));
  const q = query.trim().toLowerCase();
  const list = data.resources
    .filter((r) => status === 'all' || r.status === status)
    .filter((r) => pathId === 'all' || (pathId === 'none' ? !r.topicId : r.topicId && topicPath.get(r.topicId) === pathId))
    .filter((r) => !q || r.title.toLowerCase().includes(q) || r.notes.toLowerCase().includes(q))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const counts = Object.fromEntries(statuses.map((s) => [s, data.resources.filter((r) => r.status === s).length]));
  const edit = (r: Resource) => setDraft({ ...r });

  return (
    <>
      <PageHeader
        title="مصادر التعلّم"
        subtitle="الدورات والفيديوهات والمقالات والروابط مع ملاحظاتك."
        action={
          <button className="btn primary" onClick={() => setDraft({ ...emptyDraft })}>
            + مصدر جديد
          </button>
        }
      />

      <div className="filters">
        <div className="chips" role="group" aria-label="تصفية حسب الحالة">
          <button className={status === 'all' ? 'chip active' : 'chip'} onClick={() => setStatus('all')}>
            الكل ({data.resources.length})
          </button>
          {statuses.map((s) => (
            <button key={s} className={status === s ? 'chip active' : 'chip'} onClick={() => setStatus(s)}>
              {resourceStatusLabels[s]} ({counts[s]})
            </button>
          ))}
        </div>
        <div className="field-row">
          <select value={pathId} onChange={(e) => setPathId(e.target.value)} aria-label="تصفية حسب المسار">
            <option value="all">كل المسارات</option>
            {[...data.paths]
              .sort((a, b) => a.order - b.order)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            <option value="none">بدون موضوع</option>
          </select>
          <input type="search" placeholder="بحث…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="بحث في المصادر" />
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState title={data.resources.length === 0 ? 'لا توجد مصادر بعد.' : 'لا توجد مصادر مطابقة للتصفية.'} />
      ) : (
        <div className="stack">
          {list.map((r) => {
            const href = safeUrl(r.url);
            return (
              <article key={r.id} className="card">
                <div className="row-between">
                  <div className="resource-title">
                    <span className="badge">{resourceTypeLabels[r.type]}</span>
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="card-title">
                        {r.title} ↗
                      </a>
                    ) : (
                      <strong className="card-title">{r.title}</strong>
                    )}
                  </div>
                  <select
                    className={`status-select status-${r.status}`}
                    value={r.status}
                    onChange={(e) => actions.updateResource(r.id, { status: e.target.value as ResourceStatus })}
                    aria-label="الحالة"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {resourceStatusLabels[s]}
                      </option>
                    ))}
                  </select>
                </div>
                {r.notes && <p className="notes">{r.notes}</p>}
                <div className="row-between">
                  <span className="task-meta">
                    <TopicTag topicId={r.topicId} />
                    <span className="muted small">آخر تحديث: {formatDate(r.updatedAt)}</span>
                  </span>
                  <div className="actions">
                    <button className="btn" onClick={() => edit(r)}>
                      تعديل
                    </button>
                    <button className="btn danger" onClick={() => confirmDelete(`المصدر "${r.title}"`) && actions.deleteResource(r.id)}>
                      حذف
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ResourceForm draft={draft} onClose={() => setDraft(null)} />
    </>
  );
}
