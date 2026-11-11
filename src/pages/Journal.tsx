import { useState } from 'react';
import { FormModal } from '../components/FormModal';
import { confirmDelete, EmptyState, Field, PageHeader, TopicSelect, TopicTag } from '../components/ui';
import { formatDate, todayISODate } from '../lib/labels';
import type { JournalEntry } from '../lib/types';
import type { JournalInput } from '../store/reducer';
import { useStore } from '../store/StoreContext';

type Draft = JournalInput & { id?: string };

const SECTIONS: { key: 'learned' | 'practiced' | 'problems' | 'next'; label: string; placeholder: string }[] = [
  { key: 'learned', label: 'ماذا تعلّمت؟', placeholder: 'فكرة أو مفهوم جديد…' },
  { key: 'practiced', label: 'ماذا مارست؟', placeholder: 'ما الذي طبّقته عمليًا…' },
  { key: 'problems', label: 'ما المشكلات التي واجهتها؟', placeholder: 'عوائق، أخطاء، أسئلة مفتوحة…' },
  { key: 'next', label: 'ماذا أريد أن أفعل لاحقًا؟', placeholder: 'الخطوة التالية…' },
];

function JournalForm({ draft, onClose }: { draft: Draft | null; onClose: () => void }) {
  const { actions } = useStore();
  const [form, setForm] = useState<Draft | null>(draft);
  const [lastDraft, setLastDraft] = useState(draft);
  const [error, setError] = useState('');
  if (draft !== lastDraft) {
    setLastDraft(draft);
    setForm(draft);
    setError('');
  }

  const save = () => {
    if (!form) return;
    const { id, ...rest } = form;
    const input = {
      ...rest,
      learned: rest.learned.trim(),
      practiced: rest.practiced.trim(),
      problems: rest.problems.trim(),
      next: rest.next.trim(),
    };
    if (!input.learned && !input.practiced && !input.problems && !input.next) {
      setError('اكتب في حقل واحد على الأقل.');
      return;
    }
    if (id) actions.updateJournal(id, input);
    else actions.addJournal(input);
    onClose();
  };

  return (
    <FormModal title={form?.id ? 'تعديل المذكرة' : 'مذكرة تعلّم جديدة'} open={!!draft} onClose={onClose} onSubmit={save}>
      {form && (
        <>
          <div className="field-row">
            <Field label="التاريخ">
              <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
            <Field label="الموضوع">
              <TopicSelect value={form.topicId} onChange={(topicId) => setForm({ ...form, topicId })} />
            </Field>
          </div>
          {SECTIONS.map((s) => (
            <Field key={s.key} label={s.label}>
              <textarea rows={3} placeholder={s.placeholder} value={form[s.key]} onChange={(e) => setForm({ ...form, [s.key]: e.target.value })} />
            </Field>
          ))}
          {error && <p className="form-error">{error}</p>}
        </>
      )}
    </FormModal>
  );
}

export function JournalPage() {
  const { data, actions } = useStore();
  const [draft, setDraft] = useState<Draft | null>(null);
  const entries = [...data.journal].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const edit = (j: JournalEntry) => setDraft({ ...j });

  return (
    <>
      <PageHeader
        title="يوميات التعلّم"
        subtitle="سجّل ما تعلّمته ومارسته والعوائق وخطوتك التالية."
        action={
          <button
            className="btn primary"
            onClick={() => setDraft({ date: todayISODate(), learned: '', practiced: '', problems: '', next: '', topicId: null })}
          >
            + مذكرة جديدة
          </button>
        }
      />
      {entries.length === 0 && <EmptyState title="لا توجد مذكرات بعد. ابدأ بتسجيل ما تعلّمته اليوم." />}
      <div className="stack">
        {entries.map((j) => (
          <article key={j.id} className="card journal-entry">
            <div className="row-between">
              <strong>{formatDate(j.date)}</strong>
              <TopicTag topicId={j.topicId} />
            </div>
            <dl>
              {SECTIONS.filter((s) => j[s.key]).map((s) => (
                <div key={s.key} className="journal-section">
                  <dt>{s.label}</dt>
                  <dd>{j[s.key]}</dd>
                </div>
              ))}
            </dl>
            <div className="actions">
              <button className="btn" onClick={() => edit(j)}>
                تعديل
              </button>
              <button className="btn danger" onClick={() => confirmDelete(`مذكرة ${formatDate(j.date)}`) && actions.deleteJournal(j.id)}>
                حذف
              </button>
            </div>
          </article>
        ))}
      </div>
      <JournalForm draft={draft} onClose={() => setDraft(null)} />
    </>
  );
}
