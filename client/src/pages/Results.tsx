import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { evaluationApi } from '../api/evaluation';
import { EvaluationResult } from '../types';

const MEDALS = ['🥇', '🥈', '🥉'];
const CRITERIA = [
  { key: 'technicality', label: 'Tech', color: 'bg-blue-100 text-blue-700' },
  { key: 'wowFactor', label: 'Wow', color: 'bg-purple-100 text-purple-700' },
  { key: 'creativity', label: 'Creative', color: 'bg-pink-100 text-pink-700' },
  { key: 'useCase', label: 'Use Case', color: 'bg-green-100 text-green-700' },
];

function ScoreBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  // Extract the darker text color class and convert it to a bg class for the filled bar
  const barColor = color.split(' ').find((c) => c.startsWith('text-'))?.replace('text-', 'bg-') ?? 'bg-gray-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-600 w-6 text-right">{value}</span>
    </div>
  );
}

export default function Results() {
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    evaluationApi.getResults().then(setResults).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-500 text-lg">Final rankings based on judge evaluations. Tiebreaker: Technicality.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="card text-center py-20">
          <p className="text-5xl mb-4">⏳</p>
          <h2 className="text-xl font-semibold text-gray-700">Results not available yet</h2>
          <p className="text-gray-400 mt-2">Results will appear after judges complete their evaluations.</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {results.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
              {[results[1], results[0], results[2]].map((r, i) => {
                if (!r) return null;
                const rankIdx = i === 1 ? 0 : i === 0 ? 1 : 2;
                const heights = ['h-32', 'h-44', 'h-28'];
                return (
                  <div key={r.team.id} className={`flex flex-col items-center justify-end ${heights[i]} bg-gradient-to-t from-gray-100 rounded-t-2xl pt-4 px-3 text-center`}>
                    <span className="text-3xl mb-2">{MEDALS[rankIdx]}</span>
                    <p className="font-bold text-gray-900 text-sm truncate w-full">{r.team.name}</p>
                    <p className="text-2xl font-black text-brand-600 mt-1">{r.scores.total}</p>
                    <p className="text-xs text-gray-400">/ 400</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full Leaderboard */}
          <div className="space-y-4">
            {results.map((r) => (
              <div
                key={r.team.id}
                className={`card transition-shadow hover:shadow-md ${
                  r.rank === 1 ? 'border-amber-300 bg-amber-50' :
                  r.rank === 2 ? 'border-gray-300 bg-gray-50' :
                  r.rank === 3 ? 'border-orange-300 bg-orange-50' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 text-center w-16">
                    {r.rank <= 3 ? (
                      <span className="text-4xl">{MEDALS[r.rank - 1]}</span>
                    ) : (
                      <span className="text-2xl font-black text-gray-400">#{r.rank}</span>
                    )}
                  </div>

                  {/* Team Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h2 className="text-lg font-bold text-gray-900">{r.team.name}</h2>
                      <span className="text-xs text-gray-400">
                        {r.judgeCount} {r.judgeCount === 1 ? 'judge' : 'judges'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{r.team.problemStatement}</p>

                    {/* Score bars */}
                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                      {CRITERIA.map((c) => (
                        <div key={c.key} className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${c.color}`}>
                            {c.label}
                          </span>
                          <ScoreBar value={r.scores[c.key as keyof typeof r.scores] as number} color={c.color} />
                        </div>
                      ))}
                    </div>

                    {/* Members */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {r.team.members?.map((m) => (
                        <span key={m.id} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {m.user.username}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Total Score */}
                  <div className="flex-shrink-0 text-center px-6 py-4 rounded-xl bg-white border border-gray-100">
                    <div className={`text-4xl font-black ${
                      r.rank === 1 ? 'text-amber-500' :
                      r.rank === 2 ? 'text-gray-500' :
                      r.rank === 3 ? 'text-orange-500' :
                      'text-brand-600'
                    }`}>
                      {r.scores.total}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">/ 400</div>
                    {r.team.submission && (
                      <a
                        href={r.team.submission.sharepointLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-xs text-brand-600 hover:underline block"
                      >
                        View Submission ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  );
}
