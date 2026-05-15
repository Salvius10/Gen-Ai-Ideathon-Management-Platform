import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { teamsApi } from '../../api/teams';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';

export default function TeamCreate() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    useCase1: '',
    useCase2: '',
    useCase3: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await teamsApi.create(form);
      await refreshUser();
      setCreated(true);
      toast.success('Team created! Waiting for use case approval.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create team';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (created) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-brand-50 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Created!</h1>
          <p className="text-gray-500 mb-6">
            Your team has been created. Your use cases are currently <strong className="text-accent-600">pending admin approval</strong>.
            You'll receive a notification once they are reviewed.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-amber-800 font-semibold mb-1">What happens next?</p>
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>Share your team code with teammates so they can join.</li>
              <li>An admin will review and approve your use cases.</li>
              <li>Once approved, a mentor will be assigned to your team.</li>
              <li>Your team needs exactly 5 members to participate.</li>
            </ul>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create a Team</h1>
          <p className="text-gray-500 mt-1">Set up your team and share the code with teammates.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Team Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Neural Pioneers"
                className="input"
              />
              <p className="text-xs text-gray-400 mt-1">Must be unique. Similar names (e.g. adding numbers or symbols) will also be rejected.</p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-700">Use Cases <span className="text-gray-400 font-normal">(provide 3 separate use case names)</span></p>

              <div>
                <label className="label">Use Case 1</label>
                <input
                  type="text"
                  required
                  value={form.useCase1}
                  onChange={(e) => setForm({ ...form, useCase1: e.target.value })}
                  placeholder="e.g., AI-powered medical diagnosis"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Use Case 2</label>
                <input
                  type="text"
                  required
                  value={form.useCase2}
                  onChange={(e) => setForm({ ...form, useCase2: e.target.value })}
                  placeholder="e.g., Automated document summarization"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Use Case 3</label>
                <input
                  type="text"
                  required
                  value={form.useCase3}
                  onChange={(e) => setForm({ ...form, useCase3: e.target.value })}
                  placeholder="e.g., Real-time fraud detection"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">Project Description</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your project idea, how it uses AI, and what makes it unique..."
                className="textarea"
              />
            </div>

            <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
              <h3 className="font-semibold text-brand-800 text-sm mb-2">After creating your team:</h3>
              <ul className="text-sm text-brand-700 space-y-1 list-disc list-inside">
                <li>Your use cases will be sent for admin approval.</li>
                <li>A unique team code will be generated — share it with teammates.</li>
                <li>Teams must have exactly 5 members.</li>
                <li>An admin will assign your mentor after use case approval.</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-2">
              <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
