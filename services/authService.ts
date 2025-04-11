import { User, RegisterData, AuthResponse } from '../types/auth';
import { logApiRequest, logApiResponse, logApiError } from '../utils/logger';

// Login service
export async function login(email: string, password: string): Promise<AuthResponse | null> {
  const url = '/api/auth/login';
  const method = 'POST';
  const body = { email, password };
  
  logApiRequest(method, url, { 'Content-Type': 'application/json' }, body);
  
  const startTime = performance.now();
  
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    logApiResponse(method, url, res.status, data, duration);
    
    if (!res.ok) return null;
    return data;
  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    logApiError(method, url, error, duration);
    console.error('Login service error:', error);
    return null;
  }
}

// Register service
export async function register(userData: RegisterData): Promise<AuthResponse | null> {
  const url = '/api/auth/register';
  const method = 'POST';
  
  logApiRequest(method, url, { 'Content-Type': 'application/json' }, userData);
  
  const startTime = performance.now();
  
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    logApiResponse(method, url, res.status, data, duration);
    
    if (!res.ok) return null;
    return data;
  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    logApiError(method, url, error, duration);
    console.error('Registration service error:', error);
    return null;
  }
}

// Get current user data from API
export async function fetchCurrentUser(token: string): Promise<User | null> {
  const url = '/api/auth/me';
  const method = 'GET';
  const headers = { Authorization: `Bearer ${token}` };
  
  logApiRequest(method, url, headers);
  
  const startTime = performance.now();
  
  try {
    const res = await fetch(url, {
      headers
    });

    const data = await res.json();
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    logApiResponse(method, url, res.status, data, duration);
    
    if (!res.ok) return null;
    return data;
  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    logApiError(method, url, error, duration);
    console.error('Fetch user service error:', error);
    return null;
  }
}
