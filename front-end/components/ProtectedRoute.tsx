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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-cyber-primary/20 border-t-cyber-primary rounded-full animate-spin" />
          <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-cyber-primary animate-pulse">
            Authenticating Session
          </div>
        </div>
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
