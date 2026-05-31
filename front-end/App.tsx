import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import FlowEditor from './pages/FlowEditor';
import Login from './pages/Login';
import SecretManager from './pages/SecretManager';
import LLMProviderManager from './pages/LLMProviderManager';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ApiMonitorPanel } from './components/ApiMonitorPanel';
import {
  AUTH_STATE_CHANGED_EVENT,
  bootstrapAuthSession,
  getStoredAuthSession,
  type AuthStateChangeDetail,
} from './lib/api';

export default function App() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);

  useEffect(() => {
    // Keyboard shortcut to toggle monitor (Ctrl+M)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'm') {
        setShowMonitor(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      const session = await bootstrapAuthSession();

      if (!isMounted) {
        return;
      }

      setIsAuthenticated(session.authenticated);
      setIsCheckingAuth(false);
    };

    void bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleAuthStateChanged = (event: Event) => {
      const detail = (event as CustomEvent<AuthStateChangeDetail>).detail;
      setIsAuthenticated(detail?.authenticated ?? getStoredAuthSession().authenticated);
      setIsCheckingAuth(false);
    };

    window.addEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthStateChanged as EventListener);
    return () => {
      window.removeEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthStateChanged as EventListener);
    };
  }, []);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
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
        <Route
          path="/llm-providers"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              isCheckingAuth={isCheckingAuth}
            >
              <LLMProviderManager />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showMonitor && <ApiMonitorPanel onClose={() => setShowMonitor(false)} />}
    </BrowserRouter>
  );
}
