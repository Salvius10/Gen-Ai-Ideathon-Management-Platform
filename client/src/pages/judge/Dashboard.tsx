import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import Badge from '../../components/ui/Badge';
import { evaluationApi } from '../../api/evaluation';
import { submissionApi } from '../../api/submission';
import { Evaluation, Submission } from '../../types';

interface JudgeEvalSummary {
  judgeId: string;
  total: number;
  judge: { id: string; username: string };
}

interface SubmissionWithTeam extends Submission {
  team: {
    id: string;
    name: string;
    useCase1: string;
    members: { id: string; user: { id: string; username: string } }[];
    owner: { id: string; username: string };
    evaluations: JudgeEvalSummary[];
  };
}

export default function JudgeDashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionWithTeam[]>([]);
  const [myEvals, setMyEvals] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      submissionApi.getAll() as Promise<SubmissionWithTeam[]>,
      evaluationApi.getMyEvaluations(),
    ])
      .then(([subs, evals]) => {
        setSubmissions(subs);
        setMyEvals(evals);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const evaluatedTeamIds = new Set(myEvals.map((e) => e.teamId));

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Judge Panel</h1>
        <p className="text-gray-500 mt-1">
          Welcome, {user?.username}. Evaluate submitted projects below.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-black text-brand-600">{submissions.length}</div>
          <div className="text-sm text-gray-500 mt-1">Total Submissions</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-black text-green-600">{myEvals.length}</div>
          <div className="text-sm text-gray-500 mt-1">Evaluated by You</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-black text-amber-600">
            {submissions.length - myEvals.length}
          </div>
          <div className="text-sm text-gray-500 mt-1">Pending Evaluation</div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">⏳</p>
          <h2 className="text-xl font-semibold text-gray-700">No submissions yet</h2>
          <p className="text-gray-400 mt-2">Teams haven't submitted their final projects yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const isEvaluated = evaluatedTeamIds.has(sub.team.id);
            const myEval = myEvals.find((e) => e.teamId === sub.team.id);
            const allEvals = sub.team.evaluations ?? [];
            const otherJudges = allEvals.filter((e) => {
              const myEvalForTeam = myEvals.find((m) => m.teamId === sub.team.id);
              return !myEvalForTeam || e.judgeId !== myEvalForTeam.judgeId;
            });

            return (
              <div key={sub.id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h2 className="text-lg font-bold text-gray-900">{sub.team.name}</h2>
                      <Badge variant={isEvaluated ? 'success' : 'warning'}>
                        {isEvaluated ? 'You Evaluated' : 'Pending Your Review'}
                      </Badge>
                      {allEvals.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                          {allEvals.length} judge{allEvals.length !== 1 ? 's' : ''} evaluated
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mb-2">{sub.team.useCase1}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{sub.team.members?.length ?? 0} members</span>
                      <a
                        href={sub.sharepointLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Submission ↗
                      </a>
                    </div>

                    {/* My evaluation summary */}
                    {isEvaluated && myEval && (
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
                        <span className="font-semibold">Your score: {myEval.total}/400</span>
                        <span className="text-green-600">Tech: {myEval.technicality}</span>
                        <span className="text-green-600">Wow: {myEval.wowFactor}</span>
                        <span className="text-green-600">Creative: {myEval.creativity}</span>
                        <span className="text-green-600">Use Case: {myEval.useCase}</span>
                      </div>
                    )}

                    {/* Other judges who evaluated */}
                    {otherJudges.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-400">Also evaluated by:</span>
                        {otherJudges.map((e) => (
                          <span
                            key={e.judgeId}
                            className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium"
                            title={`Score: ${e.total}/400`}
                          >
                            {e.judge.username} ({e.total}/400)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <Link
                      to={`/judge/evaluate/${sub.team.id}`}
                      className={isEvaluated ? 'btn-secondary' : 'btn-primary'}
                    >
                      {isEvaluated ? 'Update Score' : 'Evaluate'}
                    </Link>
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
