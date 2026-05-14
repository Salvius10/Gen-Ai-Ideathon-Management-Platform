import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import { adminApi } from '../../api/admin';
import { AdminStats } from '../../types';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'text-brand-600', bg: 'bg-brand-50' },
        { label: 'Teams', value: stats.totalTeams, icon: '🚀', color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Submissions', value: stats.totalSubmissions, icon: '📋', color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Evaluations', value: stats.totalEvaluations, icon: '⭐', color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Participants', value: stats.byRole['PARTICIPANT'] || 0, icon: '🎯', color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Mentors', value: stats.byRole['MENTOR'] || 0, icon: '🎓', color: 'text-teal-600', bg: 'bg-teal-50' },
        { label: 'Judges', value: stats.byRole['JUDGE'] || 0, icon: '⚖️', color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Admins', value: stats.byRole['ADMIN'] || 0, icon: '🛡️', color: 'text-red-600', bg: 'bg-red-50' },
      ]
    : [];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.username}. Manage the entire ideathon from here.</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-5 border border-gray-100`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{s.icon}</span>
                <span className={`text-3xl font-black ${s.color}`}>{s.value}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/users" className="card hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center text-2xl group-hover:bg-brand-200 transition-colors">
              👥
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Manage Users</h2>
              <p className="text-sm text-gray-500">Assign roles to participants, mentors, judges.</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/teams" className="card hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl group-hover:bg-blue-200 transition-colors">
              🚀
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Manage Teams</h2>
              <p className="text-sm text-gray-500">Assign mentors and oversee team progress.</p>
            </div>
          </div>
        </Link>

        <Link to="/results" className="card hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl group-hover:bg-green-200 transition-colors">
              🏆
            </div>
            <div>
              <h2 className="font-bold text-gray-900">View Results</h2>
              <p className="text-sm text-gray-500">See final rankings and scores.</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/events" className="card hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center text-2xl group-hover:bg-red-200 transition-colors">
              🎛️
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Event Control</h2>
              <p className="text-sm text-gray-500">Open or close each phase for participants.</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Instructions */}
      <div className="mt-8 card border-amber-200 bg-amber-50">
        <h3 className="font-bold text-amber-800 mb-3">Admin Workflow</h3>
        <ol className="text-sm text-amber-700 space-y-2 list-decimal list-inside">
          <li>Use <strong>Event Control</strong> to open Team Registration so participants can create/join teams.</li>
          <li>Go to <strong>Manage Users</strong> to assign MENTOR and JUDGE roles.</li>
          <li>Go to <strong>Manage Teams</strong> to assign mentors to teams.</li>
          <li>Open <strong>Check-In 1</strong> in Event Control when ready; close it after the deadline.</li>
          <li>Open <strong>Check-In 2</strong> in Event Control when ready; close it after the deadline.</li>
          <li>Open <strong>Final Submission</strong> in Event Control; close it after the deadline.</li>
          <li>Judges evaluate all submitted projects from the Judge Panel.</li>
          <li>View <strong>Results</strong> for final rankings.</li>
        </ol>
      </div>
    </Layout>
  );
}
