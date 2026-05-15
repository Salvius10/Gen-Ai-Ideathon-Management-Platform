import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/admin';
import Layout from '../../components/layout/Layout';
import Badge from '../../components/ui/Badge';
import { Team, User } from '../../types';

type Filter = 'all' | 'pending-approval' | 'no-mentor';

function UseCaseApprovalRow({
  label,
  value,
  approved,
  loading,
  onToggle,
}: {
  label: string;
  value: string;
  approved: boolean;
  loading: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-brand-600 mb-0.5">{label}</p>
        <p className="text-sm text-gray-700">{value}</p>
      </div>
      <button
        onClick={onToggle}
        disabled={loading}
        className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
          approved
            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
        }`}
      >
        {loading ? '...' : approved ? '✓ Approved' : 'Approve'}
      </button>
    </div>
  );
}

export default function AdminTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningTeam, setAssigningTeam] = useState<string | null>(null);
  const [approvingKey, setApprovingKey] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    Promise.all([adminApi.getTeams(), adminApi.getMentors()])
      .then(([t, m]) => { setTeams(t); setMentors(m); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const handleAssignMentor = async (teamId: string, mentorId: string) => {
    if (!mentorId) return;
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

  const handleApproveUseCase = async (teamId: string, useCaseNum: 1 | 2 | 3, approved: boolean) => {
    const key = `${teamId}-${useCaseNum}`;
    setApprovingKey(key);
    try {
      const updated = await adminApi.approveUseCase(teamId, useCaseNum, approved);
      setTeams((prev) => prev.map((t) => (t.id === teamId ? {
        ...t,
        useCase1Approved: updated.useCase1Approved,
        useCase2Approved: updated.useCase2Approved,
        useCase3Approved: updated.useCase3Approved,
      } : t)));
      toast.success(approved ? `Use Case ${useCaseNum} approved!` : `Use Case ${useCaseNum} revoked`);
    } catch {
      toast.error('Failed to update approval');
    } finally {
      setApprovingKey(null);
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

  const allApproved = (team: Team) => team.useCase1Approved && team.useCase2Approved && team.useCase3Approved;
  const pendingCount = teams.filter((t) => !allApproved(t)).length;
  const noMentorCount = teams.filter((t) => !t.mentorId).length;

  const filtered = teams.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.useCase1.toLowerCase().includes(search.toLowerCase()) ||
      t.useCase2.toLowerCase().includes(search.toLowerCase()) ||
      t.useCase3.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'pending-approval') return !allApproved(t);
    if (filter === 'no-mentor') return !t.mentorId;
    return true;
  });

  return (
    <Layout>
      <div className="mb-6">
        <Link to="/admin" className="text-sm text-gray-500 hover:text-gray-700">← Admin</Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">Manage Teams</h1>
        <p className="text-gray-500 mt-1">Approve use cases, assign mentors, and monitor progress.</p>
      </div>

      {mentors.length === 0 && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-amber-800 text-sm">
            <strong>No mentors available.</strong> Go to{' '}
            <Link to="/admin/users" className="underline">Manage Users</Link>{' '}
            to assign MENTOR roles first.
          </p>
        </div>
      )}

      {/* Filters + Search */}
      <div className="card mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search teams by name or use case..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
        />
        <div className="flex flex-wrap gap-2">
          {([
            { key: 'all', label: `All Teams (${teams.length})` },
            { key: 'pending-approval', label: `Pending Use Case Approval (${pendingCount})` },
            { key: 'no-mentor', label: `No Mentor Assigned (${noMentorCount})` },
          ] as { key: Filter; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                filter === key
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400 hover:text-brand-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">{filter === 'all' ? '🚀' : '✅'}</p>
          <h2 className="text-xl font-semibold text-gray-700">
            {filter === 'all' ? 'No teams found' : 'No teams match this filter'}
          </h2>
          <p className="text-gray-400 mt-2">
            {filter === 'pending-approval' ? 'All teams have their use cases approved.' :
             filter === 'no-mentor' ? 'All teams have a mentor assigned.' :
             'Teams will appear here after participants register.'}
          </p>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="mt-4 btn-secondary text-sm">
              Show All Teams
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((team) => {
            const status = getStatus(team);
            const useCases = [
              { num: 1 as const, label: 'Use Case 1', value: team.useCase1, approved: team.useCase1Approved },
              { num: 2 as const, label: 'Use Case 2', value: team.useCase2, approved: team.useCase2Approved },
              { num: 3 as const, label: 'Use Case 3', value: team.useCase3, approved: team.useCase3Approved },
            ];

            return (
              <div key={team.id} className={`card ${!allApproved(team) ? 'border-amber-200' : 'border-green-200'}`}>
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h2 className="text-lg font-bold text-gray-900">{team.name}</h2>
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        allApproved(team) ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {useCases.filter(u => u.approved).length}/3 Use Cases Approved
                      </span>
                      <span className="text-xs text-gray-400 font-mono">Code: {team.code}</span>
                    </div>

                    {/* Per-use-case approval */}
                    <div className="border border-gray-100 rounded-xl p-4 mb-3 divide-y divide-gray-100">
                      {useCases.map((uc) => (
                        <UseCaseApprovalRow
                          key={uc.num}
                          label={uc.label}
                          value={uc.value}
                          approved={uc.approved}
                          loading={approvingKey === `${team.id}-${uc.num}`}
                          onToggle={() => handleApproveUseCase(team.id, uc.num, !uc.approved)}
                        />
                      ))}
                    </div>

                    {/* Members */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {team.members?.map((m) => (
                        <span key={m.id} className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600 font-medium">
                          {m.user.username}{m.userId === team.ownerId && ' (Lead)'}
                        </span>
                      ))}
                      {(team.members?.length ?? 0) < 5 && (
                        <span className="px-2 py-1 rounded-full bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                          {team.members?.length ?? 0}/5 members
                        </span>
                      )}
                    </div>

                    {/* Progress chips */}
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${team.mentor ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                        {team.mentor ? `Mentor: ${team.mentor.username}` : 'No mentor assigned'}
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

                  <div className="flex flex-col gap-3 flex-shrink-0 lg:w-52">
                    {/* Mentor assignment */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">
                        {team.mentorId ? 'Change Mentor' : 'Assign Mentor'}
                      </label>
                      <select
                        value={team.mentorId || ''}
                        onChange={(e) => handleAssignMentor(team.id, e.target.value)}
                        disabled={assigningTeam === team.id || mentors.length === 0}
                        className={`w-full text-sm border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 ${
                          !team.mentorId ? 'border-red-300' : 'border-gray-200'
                        }`}
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
