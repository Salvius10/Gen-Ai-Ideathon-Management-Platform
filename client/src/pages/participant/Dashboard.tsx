import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import Badge from '../../components/ui/Badge';
import { EventConfig, Team } from '../../types';
import { formatDate } from '../../utils/date';
import { eventsApi } from '../../api/events';

interface Step {
  id: number;
  label: string;
  desc: string;
  done: boolean;
  eventKey?: string;
  action?: { label: string; href: string };
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-xs px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 font-medium transition-colors border border-brand-200"
    >
      {copied ? 'Copied!' : 'Copy Code'}
    </button>
  );
}

function ProgressSteps({ team, events }: { team: Team | null; events: EventConfig[] }) {
  const isOpen = (key: string) => events.find((e) => e.event === key)?.isOpen ?? true;

  const steps: Step[] = [
    {
      id: 1,
      label: 'Registered',
      desc: 'Account created successfully.',
      done: true,
    },
    {
      id: 2,
      label: 'Team Setup',
      desc: team ? `Member of "${team.name}"` : 'Create or join a team.',
      done: !!team,
      eventKey: 'TEAM_REGISTRATION',
      action: (!team && isOpen('TEAM_REGISTRATION')) ? { label: 'Create Team', href: '/team/create' } : undefined,
    },
    {
      id: 3,
      label: 'Mentor Assigned',
      desc: team?.mentor ? `Mentor: ${team.mentor.username}` : 'Waiting for admin to assign a mentor.',
      done: !!(team?.mentor),
    },
    {
      id: 4,
      label: 'Check-In 1',
      desc: 'Submit tech stack & approach.',
      done: !!(team?.checkIn1),
      eventKey: 'CHECKIN_1',
      action: (team && team.mentor && !team.checkIn1 && isOpen('CHECKIN_1')) ? { label: 'Submit Check-In 1', href: '/checkin/1' } : undefined,
    },
    {
      id: 5,
      label: 'Check-In 2',
      desc: 'Submit GitHub / SharePoint link & progress.',
      done: !!(team?.checkIn2),
      eventKey: 'CHECKIN_2',
      action: (team && team.checkIn1 && !team.checkIn2 && isOpen('CHECKIN_2')) ? { label: 'Submit Check-In 2', href: '/checkin/2' } : undefined,
    },
    {
      id: 6,
      label: 'Final Submission',
      desc: team?.submission ? 'Submitted and locked.' : 'Submit your final project.',
      done: !!(team?.submission),
      eventKey: 'FINAL_SUBMISSION',
      action: (team && team.checkIn2 && !team.submission && isOpen('FINAL_SUBMISSION')) ? { label: 'Final Submit', href: '/submit' } : undefined,
    },
  ];

  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const closed = !step.done && !!step.eventKey && !isOpen(step.eventKey);
        const blocked = !step.done && i > 0 && !steps[i - 1].done;

        return (
          <div
            key={step.id}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
              step.done
                ? 'bg-green-50 border-green-200'
                : closed
                ? 'bg-gray-50 border-gray-200 opacity-60'
                : blocked
                ? 'bg-gray-50 border-gray-100 opacity-60'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className={`h-9 w-9 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
              step.done ? 'bg-green-500 text-white' : closed ? 'bg-gray-300 text-gray-400' : 'bg-gray-200 text-gray-500'
            }`}>
              {step.done ? '✓' : closed ? '🔒' : step.id}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900">{step.label}</p>
                {step.done && <Badge variant="success">Complete</Badge>}
                {!step.done && closed && <Badge variant="default">Closed</Badge>}
                {!step.done && !closed && <Badge variant="default">Pending</Badge>}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {closed ? 'This phase is currently closed by the admin.' : step.desc}
              </p>
            </div>
            {step.action && (
              <Link to={step.action.href} className="btn-primary text-sm py-2 flex-shrink-0">
                {step.action.label}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ParticipantDashboard() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<EventConfig[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([refreshUser(), eventsApi.getAll().then(setEvents).catch(() => {})])
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const team = user?.team as Team | null | undefined;

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.username}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Track your ideathon progress below.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Progress */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Progress</h2>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <ProgressSteps team={team ?? null} events={events} />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team card */}
          {!team ? (
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Join or Create a Team</h2>
              {events.find((e) => e.event === 'TEAM_REGISTRATION')?.isOpen === false ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 font-medium">Team registration is currently closed.</p>
                  <p className="text-xs text-gray-400 mt-1">Check back when the admin opens this phase.</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-5">You need to be in a team to participate.</p>
                  <div className="space-y-3">
                    <Link to="/team/create" className="btn-primary w-full justify-center">
                      Create a Team
                    </Link>
                    <Link to="/team/join" className="btn-secondary w-full justify-center">
                      Join with Code
                    </Link>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Your Team</h2>
                <Badge variant="purple">{team.members?.length ?? 0} members</Badge>
              </div>

              <h3 className="font-semibold text-gray-900 text-xl mb-1">{team.name}</h3>
              <div className="flex flex-col gap-1 mb-4">
                {[team.useCase1, team.useCase2, team.useCase3].filter(Boolean).map((uc, i) => (
                  <p key={i} className="text-xs text-gray-500">
                    <span className="font-semibold text-brand-600">UC{i + 1}:</span> {uc}
                  </p>
                ))}
              </div>
              {/* Use case approval status */}
              <div className={`mb-4 px-3 py-2 rounded-lg text-xs font-medium ${team.useCaseApproved ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {team.useCaseApproved ? '✓ Use cases approved by admin' : '⏳ Use cases pending admin approval'}
              </div>

              <div className="bg-brand-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-brand-700 uppercase tracking-wide">Team Code</span>
                  <CopyButton text={team.code} />
                </div>
                <p className="text-2xl font-black text-brand-700 tracking-widest">{team.code}</p>
                <p className="text-xs text-brand-500 mt-1">Share this code with your teammates</p>
              </div>

              <div className="space-y-2">
                {team.members?.map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center">
                      <span className="text-white text-xs font-bold uppercase">{m.user.username[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.user.username}</p>
                      <p className="text-xs text-gray-400">{m.user.email}</p>
                    </div>
                    {m.userId === team.ownerId && (
                      <Badge variant="purple">Leader</Badge>
                    )}
                  </div>
                ))}
              </div>
              {(team.members?.length ?? 0) < 5 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs text-red-700 font-semibold mb-1">
                    Your team needs {5 - (team.members?.length ?? 0)} more member{5 - (team.members?.length ?? 0) > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-red-600">
                    Teams must have exactly 5 members. Need help?{' '}
                    <a href="mailto:ganit_suppost@ganitinc.com" className="underline font-medium">
                      ganit_suppost@ganitinc.com
                    </a>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Mentor */}
          {team && (
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Mentor</h2>
              {team.mentor ? (
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
                    <span className="text-white font-bold uppercase">{team.mentor.username[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{team.mentor.username}</p>
                    <p className="text-sm text-gray-400">{team.mentor.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-amber-600 bg-amber-50 rounded-xl p-4">
                  <span className="text-2xl">⏳</span>
                  <div>
                    <p className="font-semibold text-sm">Awaiting mentor assignment</p>
                    <p className="text-xs text-amber-500 mt-0.5">Admin will assign a mentor shortly.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submissions quick-view */}
          {team?.submission && (
            <div className="card border-green-200 bg-green-50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎉</span>
                <h2 className="text-lg font-bold text-green-800">Submitted!</h2>
              </div>
              <p className="text-sm text-green-700">
                Final project submitted on {formatDate(team.submission.submittedAt)}.
                Submission is <strong>locked</strong>.
              </p>
              <a
                href={team.submission.sharepointLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm text-green-700 underline"
              >
                View Submission →
              </a>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
