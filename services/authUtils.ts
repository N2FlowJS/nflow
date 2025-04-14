import { apiRequest } from "./apiUtils";

/**
 * Get authentication data including user profile
 * @returns The user authentication data or null if not authenticated
 */
export async function checkAuthentication() {
  try {
    const authData = await apiRequest<{
      authenticated: boolean;
      userId: string;
      email?: string;
      name?: string;
      permission?: string;
      roles?: string[];
    }>('/api/auth/profile');
    
    if (authData && authData.authenticated && authData.userId) {
      return authData;
    }
    
    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Redirect to login page with current location as callback URL
 * @param currentPath The current path to redirect back to after login
 */
export function redirectToLogin(currentPath: string) {
  window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`;
}

/**
 * Check if user has admin privileges
 * @param userData User data from checkAuthentication
 * @returns boolean indicating if user has admin access
 */
export function hasAdminAccess(userData: any): boolean {
  return (
    userData && 
    (userData.permission === 'admin' || 
     userData.permission === 'superadmin' ||
     userData.permission === 'owner' ||
     (userData.roles && (
       userData.roles.includes('admin') || 
       userData.roles.includes('superadmin')  ||
       userData.roles.includes('owner')
     ))
    )
  );
}
