import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/admin';
import Layout from '../../components/layout/Layout';
import Badge from '../../components/ui/Badge';
import { Team, User } from '../../types';

export default function AdminTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningTeam, setAssigningTeam] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([adminApi.getTeams(), adminApi.getMentors()])
      .then(([t, m]) => { setTeams(t); setMentors(m); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const handleAssignMentor = async (teamId: string, mentorId: string) => {
    setAssigningTeam(teamId);
    try {
      const updated = await adminApi.assignMentor(teamId, mentorId);
      setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, mentor: updated.mentor, mentorId: updated.mentorId } : t)));
      toast.success('Mentor assigned!');
    } catch {
      toast.error('Failed to assign mentor');
    } finally {
      setAssigningTeam(null);
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!window.confirm(`Delete team "${teamName}"? All data including check-ins and submissions will be deleted.`)) return;
    try {
      await adminApi.deleteTeam(teamId);
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
      toast.success('Team deleted');
    } catch {
      toast.error('Failed to delete team');
    }
  };

  const getStatus = (team: Team) => {
    if (team.submission) return { label: 'Submitted', variant: 'success' as const };
    if (team.checkIn2) return { label: 'Check-In 2', variant: 'info' as const };
    if (team.checkIn1) return { label: 'Check-In 1', variant: 'warning' as const };
    if (team.mentor) return { label: 'Mentor Assigned', variant: 'purple' as const };
    return { label: 'New', variant: 'default' as const };
  };

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.problemStatement.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="mb-6">
        <Link to="/admin" className="text-sm text-gray-500 hover:text-gray-700">← Admin</Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">Manage Teams</h1>
        <p className="text-gray-500 mt-1">Assign mentors and monitor team progress.</p>
      </div>

      {mentors.length === 0 && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-amber-800 text-sm">
            <strong>No mentors available.</strong> Go to{' '}
            <Link to="/admin/users" className="underline">Manage Users</Link>{' '}
            to assign MENTOR roles to users first.
          </p>
        </div>
      )}

      <div className="card mb-6">
        <input
          type="text"
          placeholder="Search teams by name or problem..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">🚀</p>
          <h2 className="text-xl font-semibold text-gray-700">No teams found</h2>
          <p className="text-gray-400 mt-2">Teams will appear here after participants register.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((team) => {
            const status = getStatus(team);
            return (
              <div key={team.id} className="card">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h2 className="text-lg font-bold text-gray-900">{team.name}</h2>
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <span className="text-xs text-gray-400 font-mono">Code: {team.code}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-3">{team.problemStatement}</p>

                    {/* Members */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {team.members?.map((m) => (
                        <span key={m.id} className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600 font-medium">
                          {m.user.username}
                          {m.userId === team.ownerId && ' (L)'}
                        </span>
                      ))}
                    </div>

                    {/* Progress chips */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${team.mentor ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {team.mentor ? `Mentor: ${team.mentor.username}` : 'No mentor'}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${team.checkIn1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        Check-In 1: {team.checkIn1 ? '✓' : 'Pending'}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${team.checkIn2 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        Check-In 2: {team.checkIn2 ? '✓' : 'Pending'}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${team.submission ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        Submission: {team.submission ? '✓ Locked' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 flex-shrink-0 lg:w-56">
                    {/* Mentor assignment */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Assign Mentor</label>
                      <select
                        value={team.mentorId || ''}
                        onChange={(e) => handleAssignMentor(team.id, e.target.value)}
                        disabled={assigningTeam === team.id || mentors.length === 0}
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                      >
                        <option value="">Select mentor...</option>
                        {mentors.map((m) => (
                          <option key={m.id} value={m.id}>{m.username}</option>
                        ))}
                      </select>
                    </div>

                    {team.submission && (
                      <a
                        href={team.submission.sharepointLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-sm text-center"
                      >
                        View Submission ↗
                      </a>
                    )}

                    <button
                      onClick={() => handleDeleteTeam(team.id, team.name)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium text-center"
                    >
                      Delete Team
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
