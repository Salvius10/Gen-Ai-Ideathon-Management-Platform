import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { teamsApi } from '../api/teams';
import { LeaderboardEntry } from '../types';

function ApprovalBadge({ approved }: { approved: boolean }) {
  if (approved) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Approved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
      Waiting for Approval
    </span>
  );
}

function ScoreBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const barColor = color.split(' ').find((c) => c.startsWith('text-'))?.replace('text-', 'bg-') ?? 'bg-gray-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-600 w-6 text-right">{value}</span>
    </div>
  );
}

const MEDALS = ['🥇', '🥈', '🥉'];
const CRITERIA = [
  { key: 'technicality', label: 'Tech', color: 'bg-blue-100 text-blue-700' },
  { key: 'wowFactor', label: 'Wow', color: 'bg-brand-100 text-brand-700' },
  { key: 'creativity', label: 'Creative', color: 'bg-pink-100 text-pink-700' },
  { key: 'useCase', label: 'Use Case', color: 'bg-green-100 text-green-700' },
];

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teamsApi.getLeaderboard().then(setEntries).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const ranked = entries.filter((e) => e.scores !== null);
  const unranked = entries.filter((e) => e.scores === null);

  return (
    <Layout>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-500 text-lg">All registered teams — rankings appear after judge evaluations.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="card text-center py-20">
          <p className="text-5xl mb-4">🚀</p>
          <h2 className="text-xl font-semibold text-gray-700">No teams yet</h2>
          <p className="text-gray-400 mt-2">Teams will appear here as soon as they register.</p>
        </div>
      ) : (
        <>
          {/* Podium for top-3 evaluated teams */}
          {ranked.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
              {[ranked[1], ranked[0], ranked[2]].map((entry, i) => {
                if (!entry) return null;
                const rankIdx = i === 1 ? 0 : i === 0 ? 1 : 2;
                const heights = ['h-32', 'h-44', 'h-28'];
                return (
                  <div
                    key={entry.team.id}
                    className={`flex flex-col items-center justify-end ${heights[i]} bg-gradient-to-t from-brand-50 rounded-t-2xl pt-4 px-3 text-center`}
                  >
                    <span className="text-3xl mb-2">{MEDALS[rankIdx]}</span>
                    <p className="font-bold text-gray-900 text-sm truncate w-full">{entry.team.name}</p>
                    <p className="text-2xl font-black text-brand-600 mt-1">{entry.scores!.total}</p>
                    <p className="text-xs text-gray-400">/ 400</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Evaluated teams */}
          {ranked.length > 0 && (
            <div className="space-y-4 mb-8">
              {ranked.map((entry, idx) => (
                <TeamCard key={entry.team.id} entry={entry} rank={idx + 1} />
              ))}
            </div>
          )}

          {/* Unranked teams */}
          {unranked.length > 0 && (
            <>
              {ranked.length > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-sm text-gray-400 font-medium">Awaiting Evaluation</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              )}
              <div className="space-y-4">
                {unranked.map((entry) => (
                  <TeamCard key={entry.team.id} entry={entry} rank={null} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </Layout>
  );
}

function TeamCard({ entry, rank }: { entry: LeaderboardEntry; rank: number | null }) {
  const { team, scores, judgeCount } = entry;

  return (
    <div
      className={`card transition-shadow hover:shadow-md ${
        rank === 1 ? 'border-amber-300 bg-amber-50' :
        rank === 2 ? 'border-gray-300 bg-gray-50' :
        rank === 3 ? 'border-orange-300 bg-orange-50' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Rank */}
        <div className="flex-shrink-0 text-center w-14">
          {rank !== null && rank <= 3 ? (
            <span className="text-4xl">{MEDALS[rank - 1]}</span>
          ) : rank !== null ? (
            <span className="text-2xl font-black text-gray-400">#{rank}</span>
          ) : (
            <span className="text-2xl text-gray-300">—</span>
          )}
        </div>

        {/* Team info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h2 className="text-lg font-bold text-gray-900">{team.name}</h2>
            <ApprovalBadge approved={team.useCaseApproved} />
            {scores && (
              <span className="text-xs text-gray-400">
                {judgeCount} {judgeCount === 1 ? 'judge' : 'judges'}
              </span>
            )}
          </div>

          {/* Use Cases */}
          <div className="flex flex-wrap gap-2 mb-3">
            {[team.useCase1, team.useCase2, team.useCase3].map((uc, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 font-medium border border-brand-100">
                UC{i + 1}: {uc}
              </span>
            ))}
          </div>

          {/* Team members */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {team.members?.map((m) => (
              <span
                key={m.id}
                className={`text-xs px-2 py-0.5 rounded-full ${
                  m.userId === team.owner?.id
                    ? 'bg-brand-600 text-white font-bold'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {m.userId === team.owner?.id ? `★ ${m.user.username}` : m.user.username}
              </span>
            ))}
          </div>

          {/* Mentor */}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-gray-400">Mentor:</span>
            {team.mentor ? (
              <span className="font-semibold text-gray-700">{team.mentor.username}</span>
            ) : (
              <span className="text-gray-400 italic">Not Assigned Yet</span>
            )}
          </div>

          {/* Score bars (only if evaluated) */}
          {scores && (
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 mt-3">
              {CRITERIA.map((c) => (
                <div key={c.key} className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${c.color}`}>
                    {c.label}
                  </span>
                  <ScoreBar value={scores[c.key as keyof typeof scores] as number} color={c.color} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Score box */}
        {scores ? (
          <div className="flex-shrink-0 text-center px-6 py-4 rounded-xl bg-white border border-gray-100">
            <div className={`text-4xl font-black ${
              rank === 1 ? 'text-amber-500' :
              rank === 2 ? 'text-gray-500' :
              rank === 3 ? 'text-orange-500' :
              'text-brand-600'
            }`}>
              {scores.total}
            </div>
            <div className="text-xs text-gray-400 mt-1">/ 400</div>
          </div>
        ) : (
          <div className="flex-shrink-0 text-center px-6 py-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-sm text-gray-400 font-medium">Pending</div>
            <div className="text-xs text-gray-300 mt-1">evaluation</div>
          </div>
        )}
      </div>
    </div>
  );
}
