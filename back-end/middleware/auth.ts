import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";

/**
 * Authentication middleware for flow execution endpoints.
 * Validates that requests include a valid JWT token or API key.
 *
 * Priority:
 * 1. JWT Token in Authorization header (Bearer <token>)
 * 2. API key in X-API-Key header or body
 *
 * Environment Variables:
 * - ENABLE_AUTH: Set to 'true' to enforce authentication
 * - VALID_API_KEYS: Comma-separated list of valid API keys
 */

export interface AuthRequest extends Request {
  userId?: string;
  apiKeyId?: string;
}

export function isAuthEnforced(): boolean {
  return process.env.ENABLE_AUTH === 'true' || process.env.NODE_ENV === 'production';
}

function applyAuthContext(req: AuthRequest): { ok: true } | { ok: false; status: number; error: string } {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const payload = AuthService.verifyToken(token);
    if (!payload?.userId) {
      return {
        ok: false,
        status: 401,
        error: 'Invalid or expired token.',
      };
    }

    req.userId = payload.userId;
    return { ok: true };
  }

  const apiKey = extractApiKey(req);
  if (!apiKey) {
    return { ok: true };
  }

  if (!isValidApiKey(apiKey)) {
    return {
      ok: false,
      status: 403,
      error: 'Invalid or expired API key.',
    };
  }

  req.userId = extractUserIdFromKey(apiKey);
  req.apiKeyId = apiKey.substring(0, 8) + '***';
  return { ok: true };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authResult = applyAuthContext(req);
  if (!authResult.ok) {
    res.status(authResult.status).json({
      ok: false,
      error: authResult.error,
    });
    return;
  }

  if (isAuthEnforced() && !req.userId) {
    res.status(401).json({
      ok: false,
      error: 'Authentication required. Provide JWT token or API key.',
    });
    return;
  }

  next();
};

function extractApiKey(req: AuthRequest): string | null {
  // Try Authorization header first (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  // Try X-API-Key header
  const apiKeyHeader = req.headers["x-api-key"];
  if (typeof apiKeyHeader === "string") {
    return apiKeyHeader.trim();
  }

  // Try body (for POST requests without headers)
  if (req.body && typeof req.body.apiKey === "string") {
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
    const keyList = validKeys.split(",").map((k) => k.trim());
    return keyList.includes(apiKey);
  }

  // Check if key has valid format (can be customized per implementation)
  // Format: sk_<environment>_<timestamp>_<hash>
  return /^(sk_|pk_)[a-zA-Z0-9_]{20,}$/.test(apiKey);
}

function extractUserIdFromKey(apiKey: string): string {
  // Extract user ID from key structure or return generic ID
  // Format: sk_<environment>_<timestamp>_<hash>
  const parts = apiKey.split("_");
  return parts.length > 1 ? parts[1] : "unknown";
}

/**
 * Optional: Skip auth for specific routes
 */
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authResult = applyAuthContext(req);
  if (!authResult.ok) {
    res.status(authResult.status).json({
      ok: false,
      error: authResult.error,
    });
    return;
  }
  next();
};
