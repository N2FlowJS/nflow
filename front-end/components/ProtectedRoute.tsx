import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { clearAuthData } from '../lib/api';

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

  const token = localStorage.getItem('authToken');
  const authenticated = Boolean(isAuthenticated || token);

  if (!authenticated) {
    // Redirect to login, but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Token exists, render the protected component
  return <>{children}</>;
}

export function useAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

export function useAuthUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function useLogout() {
  return () => {
    clearAuthData();
    window.location.href = '/login';
  };
}
