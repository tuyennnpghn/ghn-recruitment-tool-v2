import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { AppShell } from './components/app-shell';
import LoginPage from './pages/LoginPage';
import RequestListPage from './pages/RequestListPage';
import CreateRequestPage from './pages/CreateRequestPage';
import RequestDetailPage from './pages/RequestDetailPage';
import CandidateListPage from './pages/CandidateListPage';
import CreateCandidatePage from './pages/CreateCandidatePage';
import CandidateDetailPage from './pages/CandidateDetailPage';
import DashboardPage from './pages/DashboardPage';
import ActivityLogPage from './pages/ActivityLogPage';
import AdminPage from './pages/AdminPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import AtsConfigPage from './pages/admin/AtsConfigPage';
import RoleManagementPage from './pages/admin/RoleManagementPage';
import ActivityAuditPage from './pages/admin/ActivityAuditPage';
import './index.css';

/** Stub page for routes not yet implemented */
const ComingSoon = ({ title }: { title: string }) => (
  <div style={{ padding: 64, textAlign: 'center' }}>
    <div style={{ fontSize: 40, marginBottom: 16 }}>🚧</div>
    <h2 style={{ marginBottom: 8 }} className="text-slate-900">{title}</h2>
    <p style={{ fontSize: 14 }} className="text-slate-400">Module này sẽ được implement ở Sprint tiếp theo.</p>
  </div>
);

/** Wrapper: renders AppShell around the page content */
function ShellLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — wrapped in AppShell */}
          <Route element={<ProtectedRoute />}>
            {/* Dashboard */}
            <Route path="/" element={
              <ShellLayout><DashboardPage /></ShellLayout>
            } />

            {/* Request Module (S1 + S2) */}
            <Route path="/requests" element={
              <ShellLayout><RequestListPage /></ShellLayout>
            } />
            <Route path="/requests/new" element={
              <ShellLayout><CreateRequestPage /></ShellLayout>
            } />
            <Route path="/requests/:id" element={
              <ShellLayout><RequestDetailPage /></ShellLayout>
            } />

            {/* Candidate Module (S3) */}
            <Route path="/candidates" element={
              <ShellLayout><CandidateListPage /></ShellLayout>
            } />
            <Route path="/candidates/new" element={
              <ShellLayout><CreateCandidatePage /></ShellLayout>
            } />
            <Route path="/candidates/:id" element={
              <ShellLayout><CandidateDetailPage /></ShellLayout>
            } />

            {/* Activity Log */}
            <Route path="/activity" element={
              <ShellLayout><ActivityLogPage /></ShellLayout>
            } />

            {/* Notifications */}
            <Route path="/notifications" element={
              <ShellLayout><ComingSoon title="Notifications" /></ShellLayout>
            } />

            {/* Admin */}
            <Route path="/admin" element={
              <ShellLayout><AdminPage /></ShellLayout>
            } />
            <Route path="/admin/users" element={
              <ShellLayout><UserManagementPage /></ShellLayout>
            } />
            <Route path="/admin/configuration" element={
              <ShellLayout><AtsConfigPage /></ShellLayout>
            } />
            <Route path="/admin/roles" element={
              <ShellLayout><RoleManagementPage /></ShellLayout>
            } />
            <Route path="/admin/audit" element={
              <ShellLayout><ActivityAuditPage /></ShellLayout>
            } />
            <Route path="/admin/*" element={
              <ShellLayout><ComingSoon title="Admin Module" /></ShellLayout>
            } />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/requests" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}
