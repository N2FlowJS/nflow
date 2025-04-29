import { compare, hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error: unknown) {
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

