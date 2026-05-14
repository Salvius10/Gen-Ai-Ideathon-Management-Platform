import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Results from './pages/Results';

import ParticipantDashboard from './pages/participant/Dashboard';
import TeamCreate from './pages/participant/TeamCreate';
import TeamJoin from './pages/participant/TeamJoin';
import CheckIn1Page from './pages/participant/CheckIn1';
import CheckIn2Page from './pages/participant/CheckIn2';
import SubmissionPage from './pages/participant/Submission';

import MentorDashboard from './pages/mentor/Dashboard';

import JudgeDashboard from './pages/judge/Dashboard';
import EvaluatePage from './pages/judge/Evaluate';

import AdminDashboard from './pages/admin/Dashboard';
import AdminTeams from './pages/admin/Teams';
import AdminUsers from './pages/admin/Users';
import AdminEventControl from './pages/admin/EventControl';

import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-purple-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
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
  );
}
