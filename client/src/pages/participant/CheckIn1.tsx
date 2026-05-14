import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { checkinApi } from '../../api/checkin';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import { Team } from '../../types';
import { formatDate } from '../../utils/date';

export default function CheckIn1() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ techStack: '', workflow: '', approach: '' });
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<{ submittedAt: string } | null>(null);

  const team = user?.team as Team | null | undefined;

  useEffect(() => {
    if (team?.checkIn1) {
      setExisting(team.checkIn1);
      setForm({
        techStack: team.checkIn1.techStack,
        workflow: team.checkIn1.workflow,
        approach: team.checkIn1.approach,
      });
    }
  }, [team]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await checkinApi.submitCheckIn1(form);
      await refreshUser();
      toast.success('Check-In 1 submitted!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Submission failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!team) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <p className="text-gray-500">You must be in a team to submit check-ins.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-bold">Step 4</span>
            <h1 className="text-3xl font-bold text-gray-900">Check-In 1</h1>
          </div>
          <p className="text-gray-500">Share your technical approach and early progress with your mentor.</p>
          {existing && (
            <p className="text-sm text-green-600 mt-2 font-medium">
              Previously submitted: {formatDate(existing.submittedAt)}
            </p>
          )}
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Technical Stack</label>
              <input
                type="text"
                required
                value={form.techStack}
                onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                placeholder="e.g., Python, FastAPI, LangChain, React, PostgreSQL"
                className="input"
              />
              <p className="text-xs text-gray-400 mt-1">List all languages, frameworks, and AI models you're using.</p>
            </div>

            <div>
              <label className="label">Project Workflow / Progress</label>
              <textarea
                required
                rows={5}
                value={form.workflow}
                onChange={(e) => setForm({ ...form, workflow: e.target.value })}
                placeholder="Describe your current progress, what modules you've built, and what's remaining..."
                className="textarea"
              />
            </div>

            <div>
              <label className="label">Development Approach</label>
              <textarea
                required
                rows={4}
                value={form.approach}
                onChange={(e) => setForm({ ...form, approach: e.target.value })}
                placeholder="How are you approaching the problem? What architecture decisions have you made? What challenges are you facing?"
                className="textarea"
              />
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Be specific and detailed. Your mentor will use this to guide you in the right direction.
              </p>
            </div>

            <div className="flex gap-4 pt-2">
              <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">
                Back
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Submitting...' : existing ? 'Update Check-In 1' : 'Submit Check-In 1'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
