import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { submissionApi } from '../../api/submission';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import { Team } from '../../types';

export default function SubmissionPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ sharepointLink: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const team = user?.team as Team | null | undefined;

  if (!team) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <p className="text-gray-500">You must be in a team to submit.</p>
        </div>
      </Layout>
    );
  }

  if (!team.checkIn2) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <p className="text-gray-500 mb-4">Please complete Check-In 2 first.</p>
          <button onClick={() => navigate('/checkin/2')} className="btn-primary">Go to Check-In 2</button>
        </div>
      </Layout>
    );
  }

  if (team.submission?.locked) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="card border-green-200 bg-green-50 text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-green-800 mb-2">Submission Locked!</h1>
            <p className="text-green-700 mb-6">
              Your final submission has been received and locked. Good luck with the evaluation!
            </p>
            <div className="inline-block bg-white rounded-xl p-4 border border-green-200 text-left mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-1">SharePoint Folder:</p>
              <a
                href={team.submission.sharepointLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 underline text-sm break-all"
              >
                {team.submission.sharepointLink}
              </a>
            </div>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      toast.error('Please confirm that your submission is final.');
      return;
    }
    if (!form.sharepointLink.startsWith('https://')) {
      toast.error('Please provide a valid SharePoint URL');
      return;
    }
    setLoading(true);
    try {
      await submissionApi.submit(form);
      await refreshUser();
      toast.success('Final submission locked!');
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
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold">Step 6</span>
            <h1 className="text-3xl font-bold text-gray-900">Final Submission</h1>
          </div>
          <p className="text-gray-500">Submit your completed project. This action is irreversible.</p>
        </div>

        <div className="card">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-xl mt-0.5">⚠️</span>
              <div>
                <h3 className="font-bold text-red-800">Warning: Final Submission</h3>
                <p className="text-sm text-red-700 mt-1">
                  Once submitted, your project is <strong>locked permanently</strong>. You will not be able to modify
                  your SharePoint link or description. Make sure everything is ready before submitting.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Final SharePoint Folder Link</label>
              <input
                type="url"
                required
                value={form.sharepointLink}
                onChange={(e) => setForm({ ...form, sharepointLink: e.target.value })}
                placeholder="https://yourorg.sharepoint.com/..."
                className="input font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">Paste the SharePoint folder link containing your final project files.</p>
            </div>

            <div>
              <label className="label">Final Project Description</label>
              <textarea
                required
                rows={6}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Provide a comprehensive description of your final project: what it does, how it uses AI, what problems it solves, and any notable features..."
                className="textarea"
              />
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Project Summary</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Team:</span>
                  <span className="font-medium text-gray-900">{team.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Members:</span>
                  <span className="font-medium text-gray-900">{team.members?.length ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Problem Statement:</span>
                  <span className="font-medium text-gray-900 text-right max-w-xs">{team.problemStatement}</span>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700">
                I confirm that this is our final submission and I understand that it cannot be modified after submission.
              </span>
            </label>

            <div className="flex gap-4 pt-2">
              <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !confirmed}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Submitting...' : 'Lock & Submit Final Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
