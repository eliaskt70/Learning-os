import { useState, type FormEvent } from 'react';
import { FormModal } from '../components/FormModal';
import { confirmDelete, EmptyState, Field, PageHeader, PathSelect, ProgressBar, TopicSelect, TopicTag } from '../components/ui';
import { projectProgress } from '../lib/insights';
import { projectStatusLabels } from '../lib/labels';
import type { Project, ProjectStatus, Task } from '../lib/types';
import { navigate } from '../lib/router';
import type { ProjectInput } from '../store/reducer';
import { useStore } from '../store/StoreContext';

type ProjectDraft = ProjectInput & { id?: string };
type TaskDraft = { id: string; title: string; topicId: string | null };

const statuses = Object.keys(projectStatusLabels) as ProjectStatus[];

function ProjectForm({ draft, onClose }: { draft: ProjectDraft | null; onClose: () => void }) {
  const { actions } = useStore();
  const [form, setForm] = useState<ProjectDraft | null>(draft);
  const [lastDraft, setLastDraft] = useState(draft);
  if (draft !== lastDraft) {
    setLastDraft(draft);
    setForm(draft);
  }

  const save = () => {
    if (!form || !form.title.trim()) return;
    const { id, ...rest } = form;
    const input = { ...rest, title: rest.title.trim(), description: rest.description.trim() };
    if (id) actions.updateProject(id, input);
    else navigate(`#/projects/${actions.addProject(input)}`);
    onClose();
  };

  return (
    <FormModal title={form?.id ? 'تعديل المشروع' : 'مشروع جديد'} open={!!draft} onClose={onClose} onSubmit={save}>
      {form && (
        <>
          <Field label="اسم المشروع">
            <input required autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="الوصف والهدف">
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="field-row">
            <Field label="المسار">
              <PathSelect value={form.pathId} onChange={(pathId) => setForm({ ...form, pathId })} />
            </Field>
            <Field label="الحالة">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {projectStatusLabels[s]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </>
      )}
    </FormModal>
  );
}

export function ProjectsPage() {
  const { data } = useStore();
  const [draft, setDraft] = useState<ProjectDraft | null>(null);
  const order: Record<ProjectStatus, number> = { active: 0, paused: 1, done: 2 };
  const projects = [...data.projects].sort((a, b) => order[a.status] - order[b.status] || b.updatedAt.localeCompare(a.updatedAt));

  return (
    <>
      <PageHeader
        title="المشاريع والتطبيق العملي"
        subtitle="طبّق ما تتعلّمه على مشاريع حقيقية مقسّمة إلى مهام صغيرة."
        action={
          <button className="btn primary" onClick={() => setDraft({ title: '', description: '', pathId: null, status: 'active' })}>
            + مشروع جديد
          </button>
        }
      />
      {projects.length === 0 && <EmptyState title="لا توجد مشاريع بعد." />}
      <div className="grid-cards">
        {projects.map((p) => {
          const { done, total } = projectProgress(data, p.id);
          const path = data.paths.find((x) => x.id === p.pathId);
          return (
            <a key={p.id} href={`#/projects/${p.id}`} className="card project-card">
              <div className="row-between">
                <strong>{p.title}</strong>
                <span className={`badge project-${p.status}`}>{projectStatusLabels[p.status]}</span>
              </div>
              {p.description && <p className="muted small clamp">{p.description}</p>}
              <ProgressBar done={done} total={total} />
              <span className="muted small">
                {done} / {total} مهام{path ? ` · ${path.title}` : ''}
              </span>
            </a>
          );
        })}
      </div>
      <ProjectForm draft={draft} onClose={() => setDraft(null)} />
    </>
  );
}

function TaskEditForm({ draft, onClose }: { draft: TaskDraft | null; onClose: () => void }) {
  const { actions } = useStore();
  const [form, setForm] = useState<TaskDraft | null>(draft);
  const [lastDraft, setLastDraft] = useState(draft);
  if (draft !== lastDraft) {
    setLastDraft(draft);
    setForm(draft);
  }
  const save = () => {
    if (!form || !form.title.trim()) return;
    actions.updateTask(form.id, { title: form.title.trim(), topicId: form.topicId });
    onClose();
  };
  return (
    <FormModal title="تعديل المهمة" open={!!draft} onClose={onClose} onSubmit={save}>
      {form && (
        <>
          <Field label="المهمة">
            <input required autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="ربط بموضوع تعلّم" hint="اختياري">
            <TopicSelect value={form.topicId} onChange={(topicId) => setForm({ ...form, topicId })} />
          </Field>
        </>
      )}
    </FormModal>
  );
}

export function ProjectDetailPage({ projectId }: { projectId: string }) {
  const { data, actions } = useStore();
  const [projectDraft, setProjectDraft] = useState<ProjectDraft | null>(null);
  const [taskDraft, setTaskDraft] = useState<TaskDraft | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState<string | null>(null);
  const project = data.projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <EmptyState title="المشروع غير موجود.">
        <a href="#/projects" className="btn">
          العودة إلى المشاريع
        </a>
      </EmptyState>
    );
  }

  const tasks = data.tasks.filter((t) => t.projectId === project.id).sort((a, b) => a.order - b.order);
  const { done, total } = projectProgress(data, project.id);
  const path = data.paths.find((p) => p.id === project.pathId);

  const addTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    actions.addTask({ projectId: project.id, title: newTitle.trim(), topicId: newTopic });
    setNewTitle('');
  };
  const editProject = (p: Project) =>
    setProjectDraft({ id: p.id, title: p.title, description: p.description, pathId: p.pathId, status: p.status });
  const editTask = (t: Task) => setTaskDraft({ id: t.id, title: t.title, topicId: t.topicId });

  return (
    <>
      <a href="#/projects" className="back-link">
        → كل المشاريع
      </a>
      <PageHeader
        title={project.title}
        subtitle={project.description}
        action={
          <div className="actions">
            <button className="btn" onClick={() => editProject(project)}>
              تعديل
            </button>
            <button
              className="btn danger"
              onClick={() => {
                if (confirmDelete(`المشروع "${project.title}" وكل مهامه (${total})`)) {
                  actions.deleteProject(project.id);
                  navigate('#/projects');
                }
              }}
            >
              حذف
            </button>
          </div>
        }
      />

      <div className="card">
        <div className="row-between">
          <span>
            <span className={`badge project-${project.status}`}>{projectStatusLabels[project.status]}</span>{' '}
            {path && (
              <a href={`#/paths/${path.id}`} className="muted small">
                {path.title}
              </a>
            )}
          </span>
          <span className="muted small">
            {done} من {total} مهام منجزة
          </span>
        </div>
        <ProgressBar done={done} total={total} />
      </div>

      <section className="card">
        <h2>المهام</h2>
        <form className="add-task" onSubmit={addTask}>
          <input placeholder="أضف مهمة جديدة…" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} aria-label="مهمة جديدة" />
          <TopicSelect value={newTopic} onChange={setNewTopic} emptyLabel="بدون موضوع" />
          <button type="submit" className="btn primary">
            إضافة
          </button>
        </form>
        {tasks.length === 0 ? (
          <EmptyState title="قسّم المشروع إلى مهام صغيرة قابلة للإنجاز." />
        ) : (
          <ul className="task-list">
            {tasks.map((task, i) => (
              <li key={task.id} className={task.done ? 'task-row done' : 'task-row'}>
                <input type="checkbox" checked={task.done} onChange={() => actions.toggleTask(task.id)} aria-label={`إنجاز: ${task.title}`} />
                <div className="task-main">
                  <span className="task-title">{task.title}</span>
                  <span className="task-meta">
                    <TopicTag topicId={task.topicId} />
                  </span>
                </div>
                <div className="task-actions">
                  <button className="icon-btn" onClick={() => actions.moveTask(task.id, -1)} disabled={i === 0} aria-label="نقل للأعلى">
                    ▲
                  </button>
                  <button className="icon-btn" onClick={() => actions.moveTask(task.id, 1)} disabled={i === tasks.length - 1} aria-label="نقل للأسفل">
                    ▼
                  </button>
                  <button className="icon-btn" onClick={() => editTask(task)} aria-label="تعديل المهمة">
                    ✎
                  </button>
                  <button className="icon-btn danger" onClick={() => confirmDelete(`المهمة "${task.title}"`) && actions.deleteTask(task.id)} aria-label="حذف المهمة">
                    🗑
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ProjectForm draft={projectDraft} onClose={() => setProjectDraft(null)} />
      <TaskEditForm draft={taskDraft} onClose={() => setTaskDraft(null)} />
    </>
  );
}
