import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/admin';
import Layout from '../../components/layout/Layout';
import { EventConfig } from '../../types';

const EVENT_META: Record<string, { desc: string; icon: string }> = {
  TEAM_REGISTRATION: {
    desc: 'Allow participants to create new teams or join existing ones using a team code.',
    icon: '👥',
  },
  CHECKIN_1: {
    desc: 'Allow teams to submit their tech stack, workflow, and development approach.',
    icon: '📋',
  },
  CHECKIN_2: {
    desc: 'Allow teams to submit their GitHub / SharePoint link and progress update.',
    icon: '🔗',
  },
  FINAL_SUBMISSION: {
    desc: 'Allow teams to submit their final SharePoint project folder. Once submitted, entries are locked.',
    icon: '🚀',
  },
};

export default function EventControl() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getEvents()
      .then(setEvents)
      .catch(() => toast.error('Failed to load event configs'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (event: EventConfig) => {
    setToggling(event.event);
    try {
      const updated = await adminApi.toggleEvent(event.event, !event.isOpen);
      setEvents((prev) => prev.map((e) => (e.event === updated.event ? updated : e)));
      toast.success(`${event.label} is now ${updated.isOpen ? 'open' : 'closed'}.`);
    } catch {
      toast.error('Failed to update event status');
    } finally {
      setToggling(null);
    }
  };

  const openCount = events.filter((e) => e.isOpen).length;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Event Control</h1>
            <p className="text-gray-500 mt-1">Open or close each phase to control participant access.</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-gray-900">{openCount}<span className="text-gray-400 font-normal text-base">/{events.length}</span></p>
            <p className="text-xs text-gray-400 mt-0.5">phases open</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((ev) => {
              const meta = EVENT_META[ev.event];
              const isToggling = toggling === ev.event;
              return (
                <div
                  key={ev.event}
                  className={`rounded-2xl border-2 p-6 transition-all ${
                    ev.isOpen
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl mt-0.5">{meta?.icon ?? '📌'}</span>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-gray-900 text-lg">{ev.label}</h3>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            ev.isOpen
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {ev.isOpen ? 'OPEN' : 'CLOSED'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{meta?.desc}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggle(ev)}
                      disabled={isToggling}
                      className={`flex-shrink-0 relative inline-flex h-7 w-13 items-center rounded-full transition-colors focus:outline-none disabled:opacity-60 ${
                        ev.isOpen ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      style={{ width: '3.25rem' }}
                      aria-label={`Toggle ${ev.label}`}
                    >
                      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform ${
                        ev.isOpen ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {ev.isOpen && (
                    <p className="text-xs text-green-600 mt-3 font-medium">
                      Participants can currently access and submit this phase.
                    </p>
                  )}
                  {!ev.isOpen && (
                    <p className="text-xs text-gray-400 mt-3">
                      This phase is hidden and inaccessible to participants.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-700">
            <strong>Tip:</strong> Close events after their deadlines to prevent late submissions.
            Participants with already-locked submissions are unaffected by closing Final Submission.
          </p>
        </div>
      </div>
    </Layout>
  );
}
