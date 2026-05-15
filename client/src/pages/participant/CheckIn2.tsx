import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { checkinApi } from '../../api/checkin';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import { Team } from '../../types';
import { formatDate } from '../../utils/date';

export default function CheckIn2() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ githubLink: '', workflowStatus: '', progressUpdate: '' });
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<{ submittedAt: string } | null>(null);

  const team = user?.team as Team | null | undefined;

  useEffect(() => {
    if (team?.checkIn2) {
      setExisting(team.checkIn2);
      setForm({
        githubLink: team.checkIn2.githubLink,
        workflowStatus: team.checkIn2.workflowStatus,
        progressUpdate: team.checkIn2.progressUpdate,
      });
    }
  }, [team]);

  if (!team) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <p className="text-gray-500">You must be in a team to submit check-ins.</p>
        </div>
      </Layout>
    );
  }

  if (!team.checkIn1) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <p className="text-gray-500 mb-4">Please complete Check-In 1 first.</p>
          <button onClick={() => navigate('/checkin/1')} className="btn-primary">Go to Check-In 1</button>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.githubLink.startsWith('https://')) {
      toast.error('Please provide a valid GitHub or SharePoint URL');
      return;
    }
    setLoading(true);
    try {
      await checkinApi.submitCheckIn2(form);
      await refreshUser();
      toast.success('Check-In 2 submitted!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Submission failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-bold">Step 5</span>
            <h1 className="text-3xl font-bold text-gray-900">Check-In 2</h1>
          </div>
          <p className="text-gray-500">Share your GitHub / SharePoint link and current implementation progress.</p>
          {existing && (
            <p className="text-sm text-green-600 mt-2 font-medium">
              Previously submitted: {formatDate(existing.submittedAt)} — you can update before final submission.
            </p>
          )}
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">GitHub / SharePoint Link</label>
              <input
                type="url"
                required
                value={form.githubLink}
                onChange={(e) => setForm({ ...form, githubLink: e.target.value })}
                placeholder="https://github.com/username/repo  or  https://yourorg.sharepoint.com/..."
                className="input font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">Provide either your GitHub repository or SharePoint folder link.</p>
            </div>

            <div>
              <label className="label">Current Workflow Status</label>
              <textarea
                required
                rows={4}
                value={form.workflowStatus}
                onChange={(e) => setForm({ ...form, workflowStatus: e.target.value })}
                placeholder="What components have you built? What's working, what's not? What's left to do?"
                className="textarea"
              />
            </div>

            <div>
              <label className="label">Progress Update</label>
              <textarea
                required
                rows={4}
                value={form.progressUpdate}
                onChange={(e) => setForm({ ...form, progressUpdate: e.target.value })}
                placeholder="Describe how much you've implemented, any pivots in your approach, and your plan for the remaining time."
                className="textarea"
              />
            </div>

            <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
              <p className="text-sm text-brand-700">
                <strong>Note:</strong> If using GitHub, make sure your repository is public. If using SharePoint, ensure the link is accessible to the judges.
                (In the Final Submission only Sharepoint url will be accepted)*
              </p>
            </div>

            <div className="flex gap-4 pt-2">
              <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">
                Back
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Submitting...' : existing ? 'Update Check-In 2' : 'Submit Check-In 2'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
