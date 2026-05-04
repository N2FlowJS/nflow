import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import FlowEditor from './pages/FlowEditor';
import Login from './pages/Login';
import SecretManager from './pages/SecretManager';
import { ProtectedRoute } from './components/ProtectedRoute';
import { clearAuthData, fetchWithAuth, setCurrentUser } from './lib/api';

export default function App() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('authToken'),
  );

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
        }
        return;
      }

      try {
        const response = await fetchWithAuth('/api/auth/profile');

        if (!isMounted) {
          return;
        }

        if (response.ok && response.user) {
          setCurrentUser(response.user);
          setIsAuthenticated(true);
          setIsCheckingAuth(false);
          return;
        }

        clearAuthData();
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
      } catch {
        if (!isMounted) {
          return;
        }

        clearAuthData();
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
      }
    };

    void bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuthData();
      setIsAuthenticated(false);
      setIsCheckingAuth(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              isCheckingAuth={isCheckingAuth}
            >
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flow/:id"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              isCheckingAuth={isCheckingAuth}
            >
              <FlowEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flow"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              isCheckingAuth={isCheckingAuth}
            >
              <Navigate to="/flow/new" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/secrets"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              isCheckingAuth={isCheckingAuth}
            >
              <SecretManager />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
