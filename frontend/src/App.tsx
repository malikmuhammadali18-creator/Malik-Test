import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth, RequireRole } from './auth/RequireAuth';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { SyllabusPage } from './pages/SyllabusPage';
import { WorksheetPage } from './pages/WorksheetPage';
import { ResourceDetailPage } from './pages/ResourceDetailPage';
import { ResourceFormPage } from './pages/ResourceFormPage';
import { SchoolsPage } from './pages/SchoolsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route path="/" element={<ResourcesPage />} />
              <Route path="/resources/new" element={<ResourceFormPage />} />
              <Route path="/resources/:id" element={<ResourceDetailPage />} />
              <Route path="/resources/:id/edit" element={<ResourceFormPage />} />
              <Route path="/syllabus" element={<SyllabusPage />} />
              <Route path="/worksheets" element={<WorksheetPage />} />
              <Route path="/schools" element={<SchoolsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />

              <Route element={<RequireRole roles={['Admin', 'SchoolAdmin']} />}>
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/audit-logs" element={<AuditLogsPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
