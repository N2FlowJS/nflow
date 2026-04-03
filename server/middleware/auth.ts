import { Request, Response, NextFunction } from 'express';

/**
 * Authentication middleware for flow execution endpoints.
 * Validates that requests include a valid API key or Bearer token.
 * 
 * Environment Variables:
 * - ENABLE_AUTH: Set to 'true' to enforce authentication
 * - VALID_API_KEYS: Comma-separated list of valid API keys
 */

export interface AuthRequest extends Request {
  userId?: string;
  apiKeyId?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Check if auth is enabled
  const authEnabled = process.env.ENABLE_AUTH === 'true';
  if (!authEnabled) {
    next();
    return;
  }

  // Extract API key from headers or body
  const apiKey = extractApiKey(req);

  if (!apiKey) {
    res.status(401).json({
      ok: false,
      error: 'Authentication required. Provide API key via X-API-Key header or Authorization bearer token.',
    });
    return;
  }

  // Validate API key
  if (!isValidApiKey(apiKey)) {
    res.status(403).json({
      ok: false,
      error: 'Invalid or expired API key.',
    });
    return;
  }

  // Attach user context to request
  req.userId = extractUserIdFromKey(apiKey);
  req.apiKeyId = apiKey.substring(0, 8) + '***'; // Partial key for logging

  next();
};

function extractApiKey(req: AuthRequest): string | null {
  // Try Authorization header first (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // Try X-API-Key header
  const apiKeyHeader = req.headers['x-api-key'];
  if (typeof apiKeyHeader === 'string') {
    return apiKeyHeader.trim();
  }

  // Try body (for POST requests without headers)
  if (req.body && typeof req.body.apiKey === 'string') {
    return req.body.apiKey.trim();
  }

  return null;
}

function isValidApiKey(apiKey: string): boolean {
  if (!apiKey || apiKey.length < 20) {
    return false;
  }

  // If VALID_API_KEYS is set, validate against whitelist
  const validKeys = process.env.VALID_API_KEYS;
  if (validKeys) {
    const keyList = validKeys.split(',').map(k => k.trim());
    return keyList.includes(apiKey);
  }

  // Check if key has valid format (can be customized per implementation)
  // Format: sk_<environment>_<timestamp>_<hash>
  return /^(sk_|pk_)[a-zA-Z0-9_]{20,}$/.test(apiKey);
}

function extractUserIdFromKey(apiKey: string): string {
  // Extract user ID from key structure or return generic ID
  // Format: sk_<environment>_<timestamp>_<hash>
  const parts = apiKey.split('_');
  return parts.length > 1 ? parts[1] : 'unknown';
}

/**
 * Optional: Skip auth for specific routes
 */
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = extractApiKey(req);
  if (apiKey && isValidApiKey(apiKey)) {
    req.userId = extractUserIdFromKey(apiKey);
    req.apiKeyId = apiKey.substring(0, 8) + '***';
  }
  next();
};
