import { Layout } from './components/Layout';
import { EmptyState } from './components/ui';
import { useHashRoute } from './lib/router';
import { Dashboard } from './pages/Dashboard';
import { DataPage } from './pages/Data';
import { JournalPage } from './pages/Journal';
import { PathDetailPage, PathsPage } from './pages/Paths';
import { ProjectDetailPage, ProjectsPage } from './pages/Projects';
import { ResourcesPage } from './pages/Resources';

export function App() {
  const [section = '', id] = useHashRoute();

  let page;
  switch (section) {
    case '':
      page = <Dashboard />;
      break;
    case 'paths':
      page = id ? <PathDetailPage key={id} pathId={id} /> : <PathsPage />;
      break;
    case 'resources':
      page = <ResourcesPage />;
      break;
    case 'projects':
      page = id ? <ProjectDetailPage key={id} projectId={id} /> : <ProjectsPage />;
      break;
    case 'journal':
      page = <JournalPage />;
      break;
    case 'data':
      page = <DataPage />;
      break;
    default:
      page = (
        <EmptyState title="الصفحة غير موجودة.">
          <a href="#/" className="btn">
            الرئيسية
          </a>
        </EmptyState>
      );
  }

  return <Layout section={section}>{page}</Layout>;
}
