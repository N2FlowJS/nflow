/// <reference types="vite/client" />
export const API_BASE = import.meta.env.VITE_RUNTIME_URL || 'http://localhost:8787';
export const AUTH_STATE_CHANGED_EVENT = 'auth:changed';

/**
 * API Response type
 */
export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string | undefined;
  message?: string | undefined;
  /*
   * The backend returns endpoint-specific extras alongside `data` (a bare
   * `secret`, a `secrets` array, a regenerated `key`, ...). Until every endpoint
   * has a declared response type this stays open, which is why the default `T`
   * is `any` rather than `unknown` — switching the default would push a type
   * annotation onto every call site at once.
   */
  [key: string]: unknown;
}

export interface AuthStateChangeDetail {
  authenticated: boolean;
  user?: unknown;
}

export interface AuthSessionResult {
  authenticated: boolean;
  user?: unknown;
}

function readStoredUser(): unknown {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return undefined;
  }

  try {
    return JSON.parse(userStr);
  } catch {
    localStorage.removeItem('user');
    return undefined;
  }
}

let bootstrapAuthSessionPromise: Promise<AuthSessionResult> | null = null;

function notifyAuthStateChanged(detail: AuthStateChangeDetail): void {
  window.dispatchEvent(
    new CustomEvent<AuthStateChangeDetail>(AUTH_STATE_CHANGED_EVENT, { detail }),
  );
}

export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

export function getStoredAuthSession(): AuthSessionResult {
  const token = getAuthToken();
  if (!token) {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    user: readStoredUser(),
  };
}

export function clearAuthData(): void {
  const hadAuthData = Boolean(localStorage.getItem('authToken') || localStorage.getItem('user'));
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');

  if (hadAuthData) {
    notifyAuthStateChanged({ authenticated: false });
  }
}

export function setCurrentUser(user: unknown): void {
  if (!user) {
    localStorage.removeItem('user');
    return;
  }

  localStorage.setItem('user', JSON.stringify(user));
}

export function setAuthSession(token: string, user: unknown): void {
  localStorage.setItem('authToken', token);
  setCurrentUser(user);
  notifyAuthStateChanged({ authenticated: true, user });
}

export type HealthStatus = {
  /** The backend answered at all. */
  reachable: boolean;
  /** The backend reported its database as usable. */
  databaseConnected: boolean;
  /** 'unreachable' when the backend did not answer, 'disconnected' when the database is down. */
  reason: 'ok' | 'unreachable' | 'disconnected';
};

/**
 * The backend answers 503 with `{ ok: false, database: 'disconnected' }` when
 * it is up but cannot reach its database. That is a very different problem from
 * the backend not running, so the two are reported separately instead of
 * collapsing into a single boolean.
 */
export async function getHealthStatus(): Promise<HealthStatus> {
  try {
    const response = await fetch(`${API_BASE}/api/health`);

    let body: { ok?: boolean; database?: string } | null = null;
    try {
      body = await response.json();
    } catch {
      // A non-JSON body still proves the backend is reachable.
    }

    const databaseConnected = body?.database === 'connected';
    return {
      reachable: true,
      databaseConnected,
      reason: response.ok && body?.ok === true && databaseConnected ? 'ok' : 'disconnected',
    };
  } catch {
    return { reachable: false, databaseConnected: false, reason: 'unreachable' };
  }
}

/** True only when the backend is up *and* its database is reachable. */
export async function checkHealth(): Promise<boolean> {
  const status = await getHealthStatus();
  return status.reason === 'ok';
}

export async function bootstrapAuthSession(): Promise<AuthSessionResult> {
  if (!getAuthToken()) {
    return { authenticated: false };
  }

  if (bootstrapAuthSessionPromise) {
    return bootstrapAuthSessionPromise;
  }

  bootstrapAuthSessionPromise = (async () => {
    try {
      const response = await fetchWithAuth('/api/auth/profile');

      if (response.ok && response.user) {
        setCurrentUser(response.user);
        return {
          authenticated: true,
          user: response.user,
        };
      }
    } catch {
      // Ignore here and fall through to clearing auth state.
    }

    clearAuthData();
    return { authenticated: false };
  })();

  try {
    return await bootstrapAuthSessionPromise;
  } finally {
    bootstrapAuthSessionPromise = null;
  }
}

export async function logoutAuthSession(): Promise<void> {
  try {
    await fetchWithAuth('/api/auth/logout', {
      method: 'POST',
    });
  } catch {
    // Ignore transport errors and still clear local session state.
  } finally {
    clearAuthData();
  }
}

/**
 * Authenticated fetch wrapper that includes JWT token and parses JSON
 */
export async function fetchWithAuth<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof options.headers === 'object' && options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthData();
  }

  try {
    const data = await response.json();
    return {
      ok: response.ok,
      ...data,
    };
  } catch (err) {
    return {
      ok: response.ok,
      error: `Failed to parse response: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Get the current user from localStorage
 */
export function getCurrentUser() {
  return readStoredUser() ?? null;
}
