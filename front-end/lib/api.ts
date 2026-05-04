/// <reference types="vite/client" />
export const API_BASE = import.meta.env.VITE_RUNTIME_URL || 'http://localhost:8787';

/**
 * API Response type
 */
export interface ApiResponse<T = any> {
  ok: boolean;
  error?: string;
  message?: string;
  [key: string]: any; // Allow other properties like 'secret', 'secrets', 'key', etc.
}

export function clearAuthData(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}

function notifyUnauthorized(): void {
  window.dispatchEvent(new Event('auth:unauthorized'));
}

export function setCurrentUser(user: unknown): void {
  if (!user) {
    localStorage.removeItem('user');
    return;
  }

  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Authenticated fetch wrapper that includes JWT token and parses JSON
 */
export async function fetchWithAuth<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('authToken');
  
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
    notifyUnauthorized();
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
  return !!localStorage.getItem('authToken');
}

/**
 * Get the current user from localStorage
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}
