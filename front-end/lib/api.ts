/// <reference types="vite/client" />
export const API_BASE = import.meta.env.VITE_RUNTIME_URL || 'http://localhost:8787';
export const AUTH_STATE_CHANGED_EVENT = 'auth:changed';

/**
 * API Response type
 */
export interface ApiResponse<T = any> {
  ok: boolean;
  error?: string;
  message?: string;
  [key: string]: any; // Allow other properties like 'secret', 'secrets', 'key', etc.
}

export interface AuthStateChangeDetail {
  authenticated: boolean;
  user?: unknown;
}

export interface AuthSessionResult {
  authenticated: boolean;
  user?: unknown;
}

function notifyAuthStateChanged(detail: AuthStateChangeDetail): void {
  window.dispatchEvent(new CustomEvent<AuthStateChangeDetail>(AUTH_STATE_CHANGED_EVENT, { detail }));
}

export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
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

export async function bootstrapAuthSession(): Promise<AuthSessionResult> {
  if (!getAuthToken()) {
    return { authenticated: false };
  }

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
}

/**
 * Authenticated fetch wrapper that includes JWT token and parses JSON
 */
export async function fetchWithAuth<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  
  const headers: any = {
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
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}
