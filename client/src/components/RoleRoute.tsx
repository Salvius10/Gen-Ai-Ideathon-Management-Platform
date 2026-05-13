import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface Props {
  roles: Role[];
}

export default function RoleRoute({ roles }: Props) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) {
    const redirectMap: Record<Role, string> = {
      PARTICIPANT: '/dashboard',
      MENTOR: '/mentor',
      JUDGE: '/judge',
      ADMIN: '/admin',
    };
    return <Navigate to={redirectMap[user.role]} replace />;
  }
  return <Outlet />;
}
