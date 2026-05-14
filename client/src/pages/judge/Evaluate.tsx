import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { evaluationApi } from '../../api/evaluation';
import { teamsApi } from '../../api/teams';
import Layout from '../../components/layout/Layout';
import { Team } from '../../types';

interface ScoreSlider {
  key: 'technicality' | 'wowFactor' | 'creativity' | 'useCase';
  label: string;
  icon: string;
  desc: string;
}

const CRITERIA: ScoreSlider[] = [
  { key: 'technicality', label: 'Technicality', icon: '⚙️', desc: 'Code quality, architecture, technical depth.' },
  { key: 'wowFactor', label: 'Wow Factor', icon: '✨', desc: 'Overall impressiveness and polish.' },
  { key: 'creativity', label: 'Creativity', icon: '💡', desc: 'Novelty and originality of the idea.' },
  { key: 'useCase', label: 'Use Case', icon: '🎯', desc: 'Practical applicability and real-world impact.' },
];

export default function EvaluatePage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [scores, setScores] = useState({ technicality: 70, wowFactor: 70, creativity: 70, useCase: 70 });
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!teamId) return;
    Promise.all([
      teamsApi.getById(teamId),
      evaluationApi.getMyEvaluations(),
    ])
      .then(([teamData, myEvals]) => {
        setTeam(teamData);
        const existing = myEvals.find((e) => e.teamId === teamId);
        if (existing) {
          setScores({
            technicality: existing.technicality,
            wowFactor: existing.wowFactor,
            creativity: existing.creativity,
            useCase: existing.useCase,
          });
          setComments(existing.comments || '');
        }
      })
      .catch(() => toast.error('Failed to load team'))
      .finally(() => setFetching(false));
  }, [teamId]);

  const total = scores.technicality + scores.wowFactor + scores.creativity + scores.useCase;

  const handleSubmit = async () => {
    if (!teamId) return;
    setLoading(true);
    try {
      await evaluationApi.submit({ teamId, ...scores, comments });
      toast.success('Evaluation submitted!');
      navigate('/judge');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Evaluation failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!team) return null;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/judge')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium">
          ← Back to Judge Panel
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{team.name}</h1>
          <p className="text-gray-500">{team.problemStatement}</p>
        </div>

        {/* Team & Submission Info */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">Team Members</h3>
            <div className="space-y-2">
              {team.members?.map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-sm">
                  <div className="h-6 w-6 rounded-full bg-brand-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold uppercase">{m.user.username[0]}</span>
                  </div>
                  <span className="text-gray-700">{m.user.username}</span>
                  {m.userId === team.ownerId && <span className="text-xs text-brand-600">(Leader)</span>}
                </div>
              ))}
            </div>
          </div>
          {team.submission && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-3">Final Submission</h3>
              <a
                href={team.submission.sharepointLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 underline text-sm break-all block mb-3"
              >
                {team.submission.sharepointLink}
              </a>
              <p className="text-sm text-gray-600 line-clamp-3">{team.submission.description}</p>
            </div>
          )}
        </div>

        {/* Scoring */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Score the Project</h2>
            <div className="text-right">
              <div className="text-3xl font-black text-brand-600">{total}</div>
              <div className="text-xs text-gray-400">/ 400 Total</div>
            </div>
          </div>

          <div className="space-y-8">
            {CRITERIA.map((c) => (
              <div key={c.key}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-gray-900">
                      {c.icon} {c.label}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">{c.desc}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-brand-600">{scores[c.key]}</span>
                    <span className="text-gray-400 text-sm"> / 100</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={scores[c.key]}
                  onChange={(e) => setScores({ ...scores, [c.key]: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between text-xs text-gray-300 mt-1">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary & Comments */}
        <div className="card mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Score Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {CRITERIA.map((c) => (
              <div key={c.key} className="text-center p-3 rounded-xl bg-gray-50">
                <div className="text-sm text-gray-500 mb-1">{c.label}</div>
                <div
                  className="text-2xl font-black"
                  style={{ color: scores[c.key] >= 75 ? '#16a34a' : scores[c.key] >= 50 ? '#d97706' : '#dc2626' }}
                >
                  {scores[c.key]}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-brand-800">Total Score</span>
              <span className="text-3xl font-black text-brand-700">{total} / 400</span>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <label className="label">Judge Comments (optional)</label>
          <textarea
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Provide constructive feedback for the team..."
            className="textarea"
          />
        </div>

        <div className="flex gap-4">
          <button onClick={() => navigate('/judge')} className="btn-secondary flex-1">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
            {loading ? 'Submitting...' : 'Submit Evaluation'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
