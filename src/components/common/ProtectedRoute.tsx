import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600 text-lg font-semibold">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    // Logged in but wrong role — send to their own dashboard
    if (user.role === 'SYSTEM_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'AGENCY_ADMIN') return <Navigate to="/agency/dashboard" replace />;
    if (user.role === 'DRIVER') return <Navigate to="/driver/dashboard" replace />;
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}