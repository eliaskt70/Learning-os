import { useRef, useState, type ChangeEvent } from 'react';
import { PageHeader } from '../components/ui';
import { todayISODate } from '../lib/labels';
import { createEmptyData, createSampleData } from '../store/sampleData';
import { parseAppData } from '../store/storage';
import { useStore } from '../store/StoreContext';

export function DataPage() {
  const { data, actions } = useStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-os-backup-${todayISODate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ kind: 'ok', text: 'تم تنزيل النسخة الاحتياطية.' });
  };

  const importData = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const parsed = parseAppData(JSON.parse(await file.text()));
      if (!parsed) throw new Error('invalid');
      if (!window.confirm('سيؤدي الاستيراد إلى استبدال كل بياناتك الحالية. هل تريد المتابعة؟')) return;
      actions.replaceData(parsed);
      setMessage({ kind: 'ok', text: 'تم استيراد البيانات بنجاح.' });
    } catch {
      setMessage({ kind: 'error', text: 'الملف غير صالح. اختر ملف نسخة احتياطية صادرًا من Learning OS.' });
    }
  };

  const counts = [
    ['مسارات', data.paths.length],
    ['مواضيع', data.topics.length],
    ['مصادر', data.resources.length],
    ['مشاريع', data.projects.length],
    ['مهام', data.tasks.length],
    ['مذكرات', data.journal.length],
  ] as const;

  return (
    <>
      <PageHeader title="البيانات والنسخ الاحتياطي" />

      <section className="card">
        <h2>أين تُحفظ بياناتي؟</h2>
        <ul className="plain-list">
          <li>تُحفظ كل البيانات محليًا في هذا المتصفح فقط (localStorage) على هذا الجهاز.</li>
          <li>
            <strong>لا توجد مزامنة بين الأجهزة أو المتصفحات.</strong> ما تضيفه على الهاتف لن يظهر على الحاسوب.
          </li>
          <li>مسح بيانات المتصفح أو استخدام وضع التصفح الخاص قد يحذف بياناتك نهائيًا.</li>
          <li>لا تُرسل أي بيانات إلى خادم. صدّر نسخة احتياطية بانتظام، ويمكنك استيرادها على جهاز آخر لنقل بياناتك يدويًا.</li>
        </ul>
        <div className="stats-row">
          {counts.map(([label, n]) => (
            <span key={label} className="stat">
              <strong>{n}</strong> {label}
            </span>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>نسخ احتياطي واستعادة</h2>
        <div className="actions">
          <button className="btn primary" onClick={exportData}>
            تصدير نسخة احتياطية (JSON)
          </button>
          <button className="btn" onClick={() => fileInput.current?.click()}>
            استيراد من ملف
          </button>
          <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={importData} />
        </div>
        {message && <p className={message.kind === 'ok' ? 'form-ok' : 'form-error'}>{message.text}</p>}
      </section>

      <section className="card">
        <h2>إعادة الضبط</h2>
        <p className="muted">صدّر نسخة احتياطية أولًا إذا أردت الاحتفاظ ببياناتك الحالية.</p>
        <div className="actions">
          <button
            className="btn"
            onClick={() => {
              if (window.confirm('استبدال كل البيانات الحالية بالمحتوى التجريبي؟')) {
                actions.replaceData(createSampleData());
                setMessage({ kind: 'ok', text: 'تمت استعادة المحتوى التجريبي.' });
              }
            }}
          >
            استعادة المحتوى التجريبي
          </button>
          <button
            className="btn danger"
            onClick={() => {
              if (window.confirm('حذف كل البيانات نهائيًا والبدء من الصفر؟')) {
                actions.replaceData(createEmptyData());
                setMessage({ kind: 'ok', text: 'تم حذف كل البيانات.' });
              }
            }}
          >
            حذف كل البيانات
          </button>
        </div>
      </section>
    </>
  );
}
