import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Results = lazy(() => import('./pages/Results'));

const ParticipantDashboard = lazy(() => import('./pages/participant/Dashboard'));
const TeamCreate = lazy(() => import('./pages/participant/TeamCreate'));
const TeamJoin = lazy(() => import('./pages/participant/TeamJoin'));
const CheckIn1Page = lazy(() => import('./pages/participant/CheckIn1'));
const CheckIn2Page = lazy(() => import('./pages/participant/CheckIn2'));
const SubmissionPage = lazy(() => import('./pages/participant/Submission'));

const MentorDashboard = lazy(() => import('./pages/mentor/Dashboard'));

const JudgeDashboard = lazy(() => import('./pages/judge/Dashboard'));
const EvaluatePage = lazy(() => import('./pages/judge/Evaluate'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminTeams = lazy(() => import('./pages/admin/Teams'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminEventControl = lazy(() => import('./pages/admin/EventControl'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-700">
    <LoadingSpinner size="lg" />
  </div>
);

export default function App() {
  const { loading } = useAuth();

  if (loading) return <PageLoader />;

  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/results" element={<Results />} />

      {/* Participant routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute roles={['PARTICIPANT']} />}>
          <Route path="/dashboard" element={<ParticipantDashboard />} />
          <Route path="/team/create" element={<TeamCreate />} />
          <Route path="/team/join" element={<TeamJoin />} />
          <Route path="/checkin/1" element={<CheckIn1Page />} />
          <Route path="/checkin/2" element={<CheckIn2Page />} />
          <Route path="/submit" element={<SubmissionPage />} />
        </Route>

        {/* Mentor routes */}
        <Route element={<RoleRoute roles={['MENTOR']} />}>
          <Route path="/mentor" element={<MentorDashboard />} />
        </Route>

        {/* Judge routes */}
        <Route element={<RoleRoute roles={['JUDGE']} />}>
          <Route path="/judge" element={<JudgeDashboard />} />
          <Route path="/judge/evaluate/:teamId" element={<EvaluatePage />} />
        </Route>

        {/* Admin routes */}
        <Route element={<RoleRoute roles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/teams" element={<AdminTeams />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/events" element={<AdminEventControl />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}
