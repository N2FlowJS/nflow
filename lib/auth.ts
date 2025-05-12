import { compare, hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { prisma } from './prisma';

// Secret should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'nflow-secret-key';

export interface JWTPayload {
  userId: string;
  name: string;
  email: string;
  permission: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await compare(password, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify a token and return payload if valid
 * Could be either a JWT token or an API token
 * @param token The token to verify
 * @returns Payload with user information if valid, null otherwise
 */
export async function verifyToken(token: string): Promise<{
  userId: string;
  name: string;
  email: string;
  permission: string;
} | null> {
  try {
    if (!token) return null;
    
    // First try to verify as JWT token
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      if (decoded && decoded.userId) {
        return {
          userId: decoded.userId,
          name: decoded.name,
          email: decoded.email,
          permission: decoded.permission
        };
      }
    } catch (jwtError) {
      // If JWT verification fails, continue to API token verification
      console.log("Not a valid JWT, trying API token verification");
    }
    
    // If JWT verification failed, try API token verification
    // Hash the token for comparison with stored hash
    const tokenHash = createHash('sha256').update(token).digest('hex');
    
    // Find the token in database
    const apiToken = await prisma.apiToken.findUnique({
      where: { token: tokenHash },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            permission: true
          }
        }
      }
    });
    
    if (!apiToken) return null;
    
    // Check if token is active
    if (apiToken.status !== 'active') return null;
    
    // Check if token is expired
    if (apiToken.expiresAt && new Date(apiToken.expiresAt) < new Date()) return null;
    
    // Update last used timestamp
    await prisma.apiToken.update({
      where: { id: apiToken.id },
      data: { lastUsedAt: new Date() }
    });
    
    // Return user payload
    return {
      userId: apiToken.user.id,
      name: apiToken.user.name,
      email: apiToken.user.email,
      permission: apiToken.user.permission
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 * @param authHeader Authorization header value
 * @returns The extracted token or null
 */
export function parseAuthHeader(authHeader?: string): string | null {
  if (!authHeader) return null;
  
  // Support both "Bearer <token>" and just "<token>" formats
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return authHeader;
}

