import { compare, hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

// Secret should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

export function parseAuthHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

// This is a simplified auth check function
// In a real application, you would use proper session management with NextAuth
export async function getCurrentUser(req: NextApiRequest) {
  // For now, just return a fake user ID for development
  // In production, you would verify the session token and get the real user
  
  // Get the user ID from the request headers or cookies
  // This is just for testing - replace with actual auth logic
  const userId = req.headers['x-user-id'] as string || 'default-user-id';
  
  return {
    id: userId,
    name: 'Current User',
    email: 'user@example.com'
  };
}

// Check if user is authenticated
export async function isAuthenticated(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await getCurrentUser(req);
    return user;
  } catch (error) {
    return null;
  }
}
