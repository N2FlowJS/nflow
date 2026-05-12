import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getAuthToken, getCurrentUser, logoutAuthSession } from '../lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
  isCheckingAuth?: boolean;
}

export function ProtectedRoute({
  children,
  isAuthenticated,
  isCheckingAuth = false,
}: ProtectedRouteProps) {
  const location = useLocation();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <div className="text-sm uppercase tracking-[0.3em] text-cyan-400">Checking Session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Token exists, render the protected component
  return <>{children}</>;
}

export function useAuthToken(): string | null {
  return getAuthToken();
}

export function useAuthUser() {
  return getCurrentUser();
}

export function useLogout() {
  const navigate = useNavigate();

  return async () => {
    await logoutAuthSession();
    navigate('/login', { replace: true });
  };
}
