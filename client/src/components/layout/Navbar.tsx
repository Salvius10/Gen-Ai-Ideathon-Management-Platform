import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';

const roleLinks = {
  PARTICIPANT: { label: 'Dashboard', href: '/dashboard' },
  MENTOR: { label: 'My Teams', href: '/mentor' },
  JUDGE: { label: 'Evaluate', href: '/judge' },
  ADMIN: { label: 'Admin', href: '/admin' },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-bold text-gray-900 text-lg hidden sm:block">Gen-AI Ideathon</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              to="/results"
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Leaderboard
            </Link>

            {user ? (
              <>
                <Link
                  to={roleLinks[user.role].href}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {roleLinks[user.role].label}
                </Link>
                <NotificationBell />
                <div className="flex items-center gap-2 ml-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center">
                    <span className="text-white text-xs font-bold uppercase">
                      {user.username[0]}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700 hidden md:block font-medium">{user.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-gray-50 rounded-lg transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
