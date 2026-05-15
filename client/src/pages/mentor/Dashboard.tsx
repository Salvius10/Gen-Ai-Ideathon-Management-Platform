import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import Badge from '../../components/ui/Badge';
import { Team } from '../../types';
import api from '../../api/client';
import { formatDate } from '../../utils/date';

export default function MentorDashboard() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.get<Team[]>('/mentors/my-teams')
      .then((r) => setTeams(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getTeamStatus = (team: Team) => {
    if (team.submission) return { label: 'Submitted', variant: 'success' as const };
    if (team.checkIn2) return { label: 'Check-In 2 Done', variant: 'info' as const };
    if (team.checkIn1) return { label: 'Check-In 1 Done', variant: 'warning' as const };
    return { label: 'Pending', variant: 'default' as const };
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome, {user?.username}. Here are your assigned teams.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">🎓</p>
          <h2 className="text-xl font-semibold text-gray-700">No teams assigned yet</h2>
          <p className="text-gray-400 mt-2">The admin will assign teams to you shortly.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="card text-center">
              <div className="text-3xl font-black text-brand-600">{teams.length}</div>
              <div className="text-sm text-gray-500 mt-1">Teams Assigned</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-black text-green-600">
                {teams.filter((t) => t.checkIn1).length}
              </div>
              <div className="text-sm text-gray-500 mt-1">Check-In 1 Done</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-black text-brand-400">
                {teams.filter((t) => t.submission).length}
              </div>
              <div className="text-sm text-gray-500 mt-1">Final Submissions</div>
            </div>
          </div>

          {teams.map((team) => {
            const status = getTeamStatus(team);
            const isExpanded = expanded === team.id;

            return (
              <div key={team.id} className="card">
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{team.name}</h2>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="text-gray-500 text-sm">{team.useCase1}</p>
                  </div>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : team.id)}
                    className="btn-secondary text-sm"
                  >
                    {isExpanded ? 'Collapse' : 'View Details'}
                  </button>
                </div>

                {/* Members */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {team.members?.map((m) => (
                    <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-sm">
                      <div className="h-5 w-5 rounded-full bg-brand-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold uppercase">{m.user.username[0]}</span>
                      </div>
                      <span className="font-medium text-gray-700">{m.user.username}</span>
                      {m.userId === team.ownerId && <span className="text-xs text-brand-600">(Leader)</span>}
                    </div>
                  ))}
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 pt-6 mt-2 space-y-6 animate-fade-in">
                    {/* Use Cases & Description */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Use Cases</h3>
                      <div className="grid sm:grid-cols-3 gap-3 mb-4">
                        {[
                          { label: 'Use Case 1', value: team.useCase1, approved: team.useCase1Approved },
                          { label: 'Use Case 2', value: team.useCase2, approved: team.useCase2Approved },
                          { label: 'Use Case 3', value: team.useCase3, approved: team.useCase3Approved },
                        ].map((uc) => (
                          <div key={uc.label} className={`rounded-xl p-4 border ${uc.approved ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-semibold text-gray-500 uppercase">{uc.label}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${uc.approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {uc.approved ? 'Approved' : 'Pending'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800">{uc.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Project Description</p>
                        <p className="text-sm text-gray-800 leading-relaxed">{team.description}</p>
                      </div>
                    </div>

                    {/* Check-In 1 */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        Check-In 1
                        {team.checkIn1 ? (
                          <Badge variant="success">Submitted</Badge>
                        ) : (
                          <Badge variant="default">Pending</Badge>
                        )}
                      </h3>
                      {team.checkIn1 ? (
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Tech Stack</p>
                            <p className="text-sm text-gray-800">{team.checkIn1.techStack}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Workflow</p>
                            <p className="text-sm text-gray-800">{team.checkIn1.workflow}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Approach</p>
                            <p className="text-sm text-gray-800">{team.checkIn1.approach}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Not submitted yet.</p>
                      )}
                    </div>

                    {/* Check-In 2 */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        Check-In 2
                        {team.checkIn2 ? (
                          <Badge variant="success">Submitted</Badge>
                        ) : (
                          <Badge variant="default">Pending</Badge>
                        )}
                      </h3>
                      {team.checkIn2 ? (
                        <div className="space-y-3">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Repository</p>
                            <a href={team.checkIn2.githubLink} target="_blank" rel="noopener noreferrer"
                              className="text-sm text-brand-600 underline break-all">{team.checkIn2.githubLink}</a>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-xl p-4">
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Workflow Status</p>
                              <p className="text-sm text-gray-800">{team.checkIn2.workflowStatus}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4">
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Progress Update</p>
                              <p className="text-sm text-gray-800">{team.checkIn2.progressUpdate}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Not submitted yet.</p>
                      )}
                    </div>

                    {/* Final Submission */}
                    {team.submission && (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          Final Submission
                          <Badge variant="success">Locked</Badge>
                        </h3>
                        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                          <p className="text-xs text-green-600 mb-2">Submitted: {formatDate(team.submission.submittedAt)}</p>
                          <a href={team.submission.sharepointLink} target="_blank" rel="noopener noreferrer"
                            className="text-brand-600 underline text-sm break-all block mb-2">{team.submission.sharepointLink}</a>
                          <p className="text-sm text-gray-700">{team.submission.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
