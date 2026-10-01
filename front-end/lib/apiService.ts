import { API_BASE, getAuthToken, clearAuthData, type ApiResponse } from './api';

export type ApiMonitorEvent = {
  url: string;
  method: string;
  status: number;
  duration: number;
  ok: boolean;
  error?: string | undefined;
  timestamp: number;
};

/** `HeadersInit` is a union; flatten it to a plain record so we can spread it. */
function toHeaderRecord(headers: HeadersInit | undefined): Record<string, string> {
  if (!headers) return {};
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  if (typeof (headers as Headers).forEach === 'function') {
    const out: Record<string, string> = {};
    (headers as Headers).forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }
  return { ...(headers as Record<string, string>) };
}

type MonitorCallback = (event: ApiMonitorEvent) => void;

class ApiService {
  private listeners: MonitorCallback[] = [];

  /**
   * Register a listener for API monitoring
   */
  public subscribe(callback: MonitorCallback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify(event: ApiMonitorEvent) {
    this.listeners.forEach((l) => {
      try {
        l(event);
      } catch (e) {
        console.error('Monitor listener error', e);
      }
    });
  }

  /**
   * Generic request handler with monitoring
   */
  public async request<T = unknown>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const start = Date.now();
    const token = getAuthToken();
    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...toHeaderRecord(options.headers),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let responseStatus = 0;
    let responseOk = false;
    let errorMsg: string | undefined;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      responseStatus = response.status;
      responseOk = response.ok;

      if (responseStatus === 401) {
        clearAuthData();
      }

      const rawData = await response.json();

      // Handle the standardized { ok, data, error } format from backend
      const result: ApiResponse<T> = {
        ok: responseOk,
        data: rawData.data ?? rawData, // Fallback if data is not wrapped
        error: rawData.error,
        ...rawData,
      };

      if (!result.ok && !result.error) {
        result.error = `Request failed with status ${responseStatus}`;
      }

      errorMsg = result.error;
      return result;
    } catch (err) {
      responseOk = false;
      errorMsg = err instanceof Error ? err.message : 'Network error';
      return {
        ok: false,
        error: errorMsg,
      };
    } finally {
      const duration = Date.now() - start;
      this.notify({
        url: path,
        method: options.method || 'GET',
        status: responseStatus,
        duration,
        ok: responseOk,
        error: errorMsg,
        timestamp: start,
      });
    }
  }

  // Convenience methods
  public get<T = unknown>(path: string, options?: RequestInit) {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  public post<T = unknown>(path: string, body: unknown, options?: RequestInit) {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public put<T = unknown>(path: string, body: unknown, options?: RequestInit) {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  public patch<T = unknown>(path: string, body: unknown, options?: RequestInit) {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  public delete<T = unknown>(path: string, options?: RequestInit) {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const apiService = new ApiService();
