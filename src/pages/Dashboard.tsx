import { EmptyState, PageHeader, ProgressBar, TopicTag } from '../components/ui';
import { getNextAction, getRecentActivity, pathStats } from '../lib/insights';
import { formatDate, todayISODate } from '../lib/labels';
import { useStore } from '../store/StoreContext';

export function Dashboard() {
  const { data, actions } = useStore();
  const next = getNextAction(data, todayISODate());
  const activity = getRecentActivity(data);
  const paths = [...data.paths].sort((a, b) => a.order - b.order);

  const activeProjects = new Map(data.projects.filter((p) => p.status === 'active').map((p) => [p.id, p]));
  const pending = data.tasks
    .filter((t) => !t.done && activeProjects.has(t.projectId))
    .sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));

  return (
    <>
      <PageHeader title="أهلًا بك 👋" subtitle="ما الخطوة التالية في رحلة تعلّمك؟" />

      <a className="card next-action" href={next.href}>
        <span className="eyebrow">الخطوة التالية المقترحة</span>
        <strong className="next-title">{next.title}</strong>
        <span className="muted">{next.detail}</span>
        <span className="next-go">ابدأ ←</span>
      </a>

      <div className="grid-2">
        <section className="card">
          <div className="section-head">
            <h2>المهام المعلّقة</h2>
            <a href="#/projects" className="link">
              كل المشاريع
            </a>
          </div>
          {pending.length === 0 ? (
            <EmptyState title="لا توجد مهام معلّقة في المشاريع النشطة." />
          ) : (
            <ul className="task-list">
              {pending.slice(0, 7).map((task) => (
                <li key={task.id} className="task-row">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => actions.toggleTask(task.id)}
                    aria-label={`إنجاز: ${task.title}`}
                  />
                  <div className="task-main">
                    <span>{task.title}</span>
                    <span className="task-meta">
                      <a href={`#/projects/${task.projectId}`} className="muted small">
                        {activeProjects.get(task.projectId)?.title}
                      </a>
                      <TopicTag topicId={task.topicId} />
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {pending.length > 7 && <p className="muted small">و{pending.length - 7} مهام أخرى…</p>}
        </section>

        <section className="card">
          <h2>النشاط الأخير</h2>
          {activity.length === 0 ? (
            <EmptyState title="لا يوجد نشاط بعد." />
          ) : (
            <ul className="activity">
              {activity.map((item) => (
                <li key={item.id}>
                  <span aria-hidden="true">{item.icon}</span>
                  <a href={item.href}>{item.text}</a>
                  <time className="muted small">{formatDate(item.at)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section>
        <div className="section-head">
          <h2>مسارات التعلّم</h2>
          <a href="#/paths" className="link">
            إدارة المسارات
          </a>
        </div>
        {paths.length === 0 ? (
          <EmptyState title="لا توجد مسارات بعد.">
            <a href="#/paths" className="btn primary">
              أنشئ مسارًا
            </a>
          </EmptyState>
        ) : (
          <div className="grid-cards">
            {paths.map((path) => {
              const s = pathStats(data, path.id);
              return (
                <a key={path.id} href={`#/paths/${path.id}`} className="card path-card" style={{ borderInlineStartColor: path.color }}>
                  <strong>{path.title}</strong>
                  <span className="muted small">
                    {s.topics} مواضيع · {s.resources} مصادر · {s.projects} مشاريع
                  </span>
                  <ProgressBar done={s.completedResources} total={s.resources} />
                  <span className="muted small">
                    أكملت {s.completedResources} من {s.resources} مصادر
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
