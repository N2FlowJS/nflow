import { useEffect, useState } from 'react';
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
  getHealthStatus,
  type AuthStateChangeDetail,
  type HealthStatus,
} from './lib/api';

export default function App() {
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<HealthStatus['reason'] | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);

  useEffect(() => {
    // Keyboard shortcut to toggle monitor (Ctrl+M)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'm') {
        setShowMonitor((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initApp = async () => {
      // 1. Check connection to backend
      let retries = 0;
      const maxRetries = 3;
      let status: HealthStatus = { reachable: false, databaseConnected: false, reason: 'unreachable' };

      while (retries < maxRetries && status.reason !== 'ok' && isMounted) {
        status = await getHealthStatus();
        if (status.reason !== 'ok') {
          retries++;
          if (retries < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      if (!isMounted) return;

      if (status.reason !== 'ok') {
        setConnectionError(status.reason);
        setIsConnecting(false);
        return;
      }

      // 2. Bootstrap auth
      const session = await bootstrapAuthSession();

      if (!isMounted) {
        return;
      }

      setIsAuthenticated(session.authenticated);
      setIsCheckingAuth(false);
      setIsConnecting(false);
    };

    void initApp();

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

  if (isConnecting) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-[9999]">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-cyber-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-cyber-primary rounded-full animate-spin"></div>
          <div className="absolute inset-4 border-4 border-cyber-primary/10 rounded-full"></div>
          <div className="absolute inset-4 border-4 border-b-cyber-primary/40 rounded-full animate-spin-reverse"></div>
        </div>
        <div className="text-cyber-primary font-mono text-sm uppercase tracking-[0.2em] animate-pulse">
          Connecting to N2FLOW Core...
        </div>
      </div>
    );
  }

  if (connectionError) {
    const databaseDown = connectionError === 'disconnected';
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-[9999] p-4 text-center">
        <div className="w-16 h-16 mb-6 text-red-500">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-white text-xl font-bold mb-2">
          {databaseDown ? 'Backend Database Unavailable' : 'Backend Connection Failed'}
        </h2>
        <p className="text-gray-400 max-w-md mb-8">
          {databaseDown
            ? 'The N2FLOW backend is running but cannot reach its database. Check that DATABASE_URL is correct and the database is running, then apply the schema with "npm run db:migrate".'
            : 'Could not establish a connection to the N2FLOW backend service. Please ensure the server is running and reachable.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-red-500/20 border border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/30 transition-all font-bold"
        >
          RETRY CONNECTION
        </button>
      </div>
    );
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isCheckingAuth={isCheckingAuth}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flow/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isCheckingAuth={isCheckingAuth}>
              <FlowEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flow"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isCheckingAuth={isCheckingAuth}>
              <Navigate to="/flow/new" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/secrets"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isCheckingAuth={isCheckingAuth}>
              <SecretManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/llm-providers"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isCheckingAuth={isCheckingAuth}>
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
