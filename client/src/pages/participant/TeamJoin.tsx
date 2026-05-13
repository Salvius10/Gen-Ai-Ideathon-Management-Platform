import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { teamsApi } from '../../api/teams';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';

export default function TeamJoin() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await teamsApi.join(code.trim().toUpperCase());
      await refreshUser();
      toast.success('Joined team successfully!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to join team';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Join a Team</h1>
          <p className="text-gray-500 mt-1">Enter the 8-character code your team leader shared.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Team Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g., AB12CD34"
                maxLength={8}
                className="input font-mono text-2xl tracking-widest text-center uppercase"
              />
              <p className="text-xs text-gray-400 mt-1 text-center">8-character alphanumeric code</p>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-sm text-amber-700">
                <strong>Note:</strong> You can only be in one team. Once you join, you cannot switch teams.
                Teams have a maximum of 5 members.
              </p>
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={loading || code.length !== 8} className="btn-primary flex-1">
                {loading ? 'Joining...' : 'Join Team'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Don't have a code?{' '}
            <button
              onClick={() => navigate('/team/create')}
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Create your own team
            </button>
          </p>
        </div>
      </div>
    </Layout>
  );
}
