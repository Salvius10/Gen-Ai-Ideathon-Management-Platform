import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { token, user: userData } = await authApi.register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      login(token, userData);
      toast.success(`Welcome, ${userData.username}! Let's get started.`);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-400 to-purple-400 flex items-center justify-center">
              <span className="text-white font-black text-sm">AI</span>
            </div>
            <span className="text-white font-bold text-xl">Gen-AI Ideathon</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Join the Ideathon</h1>
          <p className="text-gray-400 mt-2">Create your participant account</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Username</label>
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="johndoe"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min 6 characters"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="Repeat password"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-purple-600 text-white font-bold hover:from-brand-400 hover:to-purple-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-300 hover:text-brand-200 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
