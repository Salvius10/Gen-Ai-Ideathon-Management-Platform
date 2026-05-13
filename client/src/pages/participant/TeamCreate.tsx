import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { teamsApi } from '../../api/teams';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';

export default function TeamCreate() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', problemStatement: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await teamsApi.create(form);
      await refreshUser();
      toast.success('Team created successfully!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create team';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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
              <p className="text-xs text-gray-400 mt-1">Must be unique across all teams.</p>
            </div>

            <div>
              <label className="label">Problem Statement</label>
              <input
                type="text"
                required
                value={form.problemStatement}
                onChange={(e) => setForm({ ...form, problemStatement: e.target.value })}
                placeholder="e.g., Using GenAI to automate medical diagnosis"
                className="input"
              />
              <p className="text-xs text-gray-400 mt-1">Summarize the problem you're solving.</p>
            </div>

            <div>
              <label className="label">Project Description</label>
              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your project idea, how it uses AI, and what makes it unique..."
                className="textarea"
              />
            </div>

            <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
              <h3 className="font-semibold text-brand-800 text-sm mb-2">After creating your team:</h3>
              <ul className="text-sm text-brand-700 space-y-1 list-disc list-inside">
                <li>A unique team code will be generated.</li>
                <li>Share the code with teammates so they can join.</li>
                <li>Teams can have up to 5 members.</li>
                <li>An admin will assign your mentor.</li>
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
