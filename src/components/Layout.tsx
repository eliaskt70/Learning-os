import type { ReactNode } from 'react';
import { useStore } from '../store/StoreContext';

const NAV = [
  { href: '#/', key: '', label: 'الرئيسية', icon: '🏠' },
  { href: '#/paths', key: 'paths', label: 'المسارات', icon: '🧭' },
  { href: '#/resources', key: 'resources', label: 'المصادر', icon: '📚' },
  { href: '#/projects', key: 'projects', label: 'المشاريع', icon: '🛠️' },
  { href: '#/journal', key: 'journal', label: 'اليوميات', icon: '📝' },
];

export function Layout({ section, children }: { section: string; children: ReactNode }) {
  const { saveFailed, loadStatus } = useStore();
  return (
    <div className="app">
      <aside className="sidebar">
        <a href="#/" className="brand">
          <img src="./favicon.svg" alt="" width={32} height={32} />
          <span>
            Learning OS
            <small>نظام التعلّم الشخصي</small>
          </span>
        </a>
        <nav aria-label="التنقل الرئيسي">
          {NAV.map((item) => (
            <a key={item.key} href={item.href} className={section === item.key ? 'nav-link active' : 'nav-link'}>
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <a href="#/data" className={section === 'data' ? 'nav-link active data-link' : 'nav-link data-link'}>
          <span aria-hidden="true">💾</span>
          البيانات والنسخ الاحتياطي
        </a>
      </aside>

      <div className="main-wrap">
        <header className="topbar">
          <a href="#/" className="brand">
            <img src="./favicon.svg" alt="" width={28} height={28} />
            <span>Learning OS</span>
          </a>
          <a href="#/data" className="icon-btn" aria-label="البيانات والنسخ الاحتياطي">
            💾
          </a>
        </header>

        {saveFailed && (
          <div className="alert danger" role="alert">
            تعذّر حفظ البيانات في المتصفح (قد تكون المساحة ممتلئة أو التخزين معطّلًا). صدّر نسخة احتياطية من صفحة
            البيانات لتجنّب فقدان التغييرات.
          </div>
        )}
        {loadStatus === 'corrupt' && (
          <div className="alert warn" role="status">
            تعذّرت قراءة البيانات المحفوظة، لذا تم تحميل المحتوى التجريبي. حُفظت نسخة من البيانات الأصلية في المتصفح تحت
            مفتاح احتياطي.
          </div>
        )}

        <main className="main">{children}</main>
      </div>

      <nav className="bottom-nav" aria-label="التنقل الرئيسي">
        {NAV.map((item) => (
          <a key={item.key} href={item.href} className={section === item.key ? 'active' : undefined}>
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
