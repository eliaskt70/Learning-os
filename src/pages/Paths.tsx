import { useState } from 'react';
import { FormModal } from '../components/FormModal';
import { confirmDelete, EmptyState, Field, PageHeader, ProgressBar } from '../components/ui';
import { pathStats } from '../lib/insights';
import { pathColors, resourceStatusLabels } from '../lib/labels';
import type { LearningPath, Topic } from '../lib/types';
import { navigate } from '../lib/router';
import { useStore } from '../store/StoreContext';

type PathDraft = { id?: string; title: string; description: string; color: string };
type TopicDraft = { id?: string; pathId: string; title: string; notes: string };

function PathForm({ draft, onClose }: { draft: PathDraft | null; onClose: () => void }) {
  const { actions } = useStore();
  const [form, setForm] = useState<PathDraft | null>(draft);
  // Re-sync when a different draft is opened.
  const [lastDraft, setLastDraft] = useState(draft);
  if (draft !== lastDraft) {
    setLastDraft(draft);
    setForm(draft);
  }

  const save = () => {
    if (!form || !form.title.trim()) return;
    const input = { title: form.title.trim(), description: form.description.trim(), color: form.color };
    if (form.id) actions.updatePath(form.id, input);
    else actions.addPath(input);
    onClose();
  };

  return (
    <FormModal title={form?.id ? 'تعديل المسار' : 'مسار جديد'} open={!!draft} onClose={onClose} onSubmit={save}>
      {form && (
        <>
          <Field label="اسم المسار">
            <input required autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="الوصف">
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <fieldset className="field">
            <legend className="field-label">اللون</legend>
            <div className="swatches">
              {pathColors.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={form.color === c ? 'swatch selected' : 'swatch'}
                  style={{ background: c }}
                  onClick={() => setForm({ ...form, color: c })}
                  aria-label={`اللون ${c}`}
                  aria-pressed={form.color === c}
                />
              ))}
            </div>
          </fieldset>
        </>
      )}
    </FormModal>
  );
}

function TopicForm({ draft, onClose }: { draft: TopicDraft | null; onClose: () => void }) {
  const { data, actions } = useStore();
  const [form, setForm] = useState<TopicDraft | null>(draft);
  const [lastDraft, setLastDraft] = useState(draft);
  if (draft !== lastDraft) {
    setLastDraft(draft);
    setForm(draft);
  }

  const save = () => {
    if (!form || !form.title.trim()) return;
    const input = { pathId: form.pathId, title: form.title.trim(), notes: form.notes.trim() };
    if (form.id) actions.updateTopic(form.id, input);
    else actions.addTopic(input);
    onClose();
  };

  return (
    <FormModal title={form?.id ? 'تعديل الموضوع' : 'موضوع جديد'} open={!!draft} onClose={onClose} onSubmit={save}>
      {form && (
        <>
          <Field label="عنوان الموضوع">
            <input required autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="المسار">
            <select value={form.pathId} onChange={(e) => setForm({ ...form, pathId: e.target.value })}>
              {[...data.paths]
                .sort((a, b) => a.order - b.order)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="ملاحظات">
            <textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </>
      )}
    </FormModal>
  );
}

function MoveButtons({ onUp, onDown, first, last, label }: { onUp: () => void; onDown: () => void; first: boolean; last: boolean; label: string }) {
  return (
    <span className="move-btns">
      <button type="button" className="icon-btn" onClick={onUp} disabled={first} aria-label={`نقل ${label} للأعلى`}>
        ▲
      </button>
      <button type="button" className="icon-btn" onClick={onDown} disabled={last} aria-label={`نقل ${label} للأسفل`}>
        ▼
      </button>
    </span>
  );
}

export function PathsPage() {
  const { data, actions } = useStore();
  const [pathDraft, setPathDraft] = useState<PathDraft | null>(null);
  const paths = [...data.paths].sort((a, b) => a.order - b.order);

  const edit = (p: LearningPath) => setPathDraft({ id: p.id, title: p.title, description: p.description, color: p.color });

  return (
    <>
      <PageHeader
        title="مسارات التعلّم"
        subtitle="نظّم ما تتعلّمه في مسارات ومواضيع."
        action={
          <button className="btn primary" onClick={() => setPathDraft({ title: '', description: '', color: pathColors[paths.length % pathColors.length] })}>
            + مسار جديد
          </button>
        }
      />
      {paths.length === 0 && <EmptyState title="لا توجد مسارات بعد. أنشئ أول مسار للبدء." />}
      <div className="stack">
        {paths.map((path, i) => {
          const s = pathStats(data, path.id);
          return (
            <article key={path.id} className="card path-card" style={{ borderInlineStartColor: path.color }}>
              <div className="row-between">
                <a href={`#/paths/${path.id}`} className="card-title">
                  {path.title}
                </a>
                <MoveButtons
                  label={path.title}
                  first={i === 0}
                  last={i === paths.length - 1}
                  onUp={() => actions.movePath(path.id, -1)}
                  onDown={() => actions.movePath(path.id, 1)}
                />
              </div>
              {path.description && <p className="muted">{path.description}</p>}
              <ProgressBar done={s.completedResources} total={s.resources} />
              <span className="muted small">
                {s.topics} مواضيع · أكملت {s.completedResources} من {s.resources} مصادر · {s.projects} مشاريع
              </span>
              <div className="actions">
                <a href={`#/paths/${path.id}`} className="btn">
                  المواضيع
                </a>
                <button className="btn" onClick={() => edit(path)}>
                  تعديل
                </button>
                <button
                  className="btn danger"
                  onClick={() => confirmDelete(`المسار "${path.title}" ومواضيعه (${s.topics})`) && actions.deletePath(path.id)}
                >
                  حذف
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <PathForm draft={pathDraft} onClose={() => setPathDraft(null)} />
    </>
  );
}

export function PathDetailPage({ pathId }: { pathId: string }) {
  const { data, actions } = useStore();
  const [pathDraft, setPathDraft] = useState<PathDraft | null>(null);
  const [topicDraft, setTopicDraft] = useState<TopicDraft | null>(null);
  const path = data.paths.find((p) => p.id === pathId);

  if (!path) {
    return (
      <EmptyState title="المسار غير موجود.">
        <a href="#/paths" className="btn">
          العودة إلى المسارات
        </a>
      </EmptyState>
    );
  }

  const topics = data.topics.filter((t) => t.pathId === path.id).sort((a, b) => a.order - b.order);
  const projects = data.projects.filter((p) => p.pathId === path.id);
  const editTopic = (t: Topic) => setTopicDraft({ id: t.id, pathId: t.pathId, title: t.title, notes: t.notes });

  return (
    <>
      <a href="#/paths" className="back-link">
        → كل المسارات
      </a>
      <PageHeader
        title={path.title}
        subtitle={path.description}
        action={
          <div className="actions">
            <button className="btn" onClick={() => setPathDraft({ id: path.id, title: path.title, description: path.description, color: path.color })}>
              تعديل المسار
            </button>
            <button
              className="btn danger"
              onClick={() => {
                if (confirmDelete(`المسار "${path.title}" ومواضيعه`)) {
                  actions.deletePath(path.id);
                  navigate('#/paths');
                }
              }}
            >
              حذف
            </button>
          </div>
        }
      />

      <section>
        <div className="section-head">
          <h2>المواضيع ({topics.length})</h2>
          <button className="btn primary" onClick={() => setTopicDraft({ pathId: path.id, title: '', notes: '' })}>
            + موضوع
          </button>
        </div>
        {topics.length === 0 && <EmptyState title="لا توجد مواضيع في هذا المسار بعد." />}
        <div className="stack">
          {topics.map((topic, i) => {
            const resources = data.resources.filter((r) => r.topicId === topic.id);
            const tasks = data.tasks.filter((t) => t.topicId === topic.id);
            return (
              <article key={topic.id} className="card">
                <div className="row-between">
                  <strong className="card-title">{topic.title}</strong>
                  <MoveButtons
                    label={topic.title}
                    first={i === 0}
                    last={i === topics.length - 1}
                    onUp={() => actions.moveTopic(topic.id, -1)}
                    onDown={() => actions.moveTopic(topic.id, 1)}
                  />
                </div>
                {topic.notes && <p className="notes">{topic.notes}</p>}
                {resources.length > 0 && (
                  <ul className="mini-list">
                    {resources.map((r) => (
                      <li key={r.id}>
                        <span className={`badge status-${r.status}`}>{resourceStatusLabels[r.status]}</span> {r.title}
                      </li>
                    ))}
                  </ul>
                )}
                <span className="muted small">
                  {resources.length} مصادر · {tasks.length} مهام مرتبطة
                </span>
                <div className="actions">
                  <button className="btn" onClick={() => editTopic(topic)}>
                    تعديل
                  </button>
                  <button className="btn danger" onClick={() => confirmDelete(`الموضوع "${topic.title}"`) && actions.deleteTopic(topic.id)}>
                    حذف
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {projects.length > 0 && (
        <section>
          <h2>مشاريع هذا المسار</h2>
          <ul className="mini-list">
            {projects.map((p) => (
              <li key={p.id}>
                <a href={`#/projects/${p.id}`}>{p.title}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <PathForm draft={pathDraft} onClose={() => setPathDraft(null)} />
      <TopicForm draft={topicDraft} onClose={() => setTopicDraft(null)} />
    </>
  );
}
