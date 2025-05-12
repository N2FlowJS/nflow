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
  } catch (error: unknown) {
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

/**
 * Verify an API token against the server
 * @param token The API token to verify
 * @returns The token verification result with user data if valid
 */
export async function verifyApiToken(token: string) {
  try {
    const result = await apiRequest<{
      valid: boolean;
      userId?: string;
      tokenInfo?: {
        id: string;
        name: string;
        lastUsedAt: string;
      };
      error?: string;
    }>('/api/auth/verify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    return result;
  } catch (error: unknown) {
    console.error('Token verification error:', error);
    return { valid: false, error: 'Failed to verify token' };
  }
}

/**
 * Create a new API token for the user
 * @param userId The ID of the user creating the token
 * @param tokenData The token data including name, description, and expiry
 * @returns The created token data or null if creation failed
 */
export async function createApiToken(userId: string, tokenData: { 
  name: string; 
  description?: string; 
  expiresAt?: Date | null;
}) {
  try {
    const result = await apiRequest<{
      success: boolean;
      token?: {
        id: string;
        name: string;
        token: string;
        description?: string;
        createdAt: string;
        expiresAt?: string;
        status: string;
      };
      error?: string;
    }>(`/api/users/${userId}/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenData),
    });
    
    return result.token || null;
  } catch (error: unknown) {
    console.error('Token creation error:', error);
    return null;
  }
}

/**
 * Fetch all API tokens for a user
 * @param userId The ID of the user
 * @returns Array of token data or empty array if fetch failed
 */
export async function fetchUserApiTokens(userId: string) {
  try {
    const result = await apiRequest<{
      tokens: Array<{
        id: string;
        name: string;
        description?: string;
        createdAt: string;
        expiresAt?: string;
        lastUsedAt?: string;
        status: string;
      }>;
    }>(`/api/users/${userId}/tokens`);
    
    return result.tokens || [];
  } catch (error: unknown) {
    console.error('Error fetching user tokens:', error);
    return [];
  }
}

/**
 * Revoke a specific API token
 * @param tokenId The ID of the token to revoke
 * @returns Boolean indicating success or failure
 */
export async function revokeApiToken(tokenId: string) {
  try {
    const result = await apiRequest<{ success: boolean; error?: string }>(
      `/api/tokens/${tokenId}/revoke`,
      {
        method: 'PUT',
      }
    );
    
    return result.success;
  } catch (error: unknown) {
    console.error('Error revoking token:', error);
    return false;
  }
}
