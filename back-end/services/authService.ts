import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRY = '7d';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  ok: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    username: string;
    name?: string;
  };
  error?: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeUsername(username: string): string {
  return username.trim();
}

export class AuthService {
  /**
   * Hash password with bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Verify password
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   */
  static generateToken(userId: string, email: string, username: string): string {
    const payload: AuthTokenPayload = { userId, email, username };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): AuthTokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Register new user
   */
  static async register(
    email: string,
    username: string,
    password: string,
    name?: string
  ): Promise<AuthResponse> {
    try {
      const normalizedEmail = normalizeEmail(email);
      const normalizedUsername = normalizeUsername(username);

      // Validate input
      if (!normalizedEmail || !normalizedUsername || !password) {
        return { ok: false, error: 'Email, username, and password are required' };
      }

      if (password.length < 8) {
        return { ok: false, error: 'Password must be at least 8 characters' };
      }

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: normalizedEmail }, { username: normalizedUsername }],
        },
      });

      if (existingUser) {
        return {
          ok: false,
          error: existingUser.email === normalizedEmail ? 'Email already registered' : 'Username already taken',
        };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          username: normalizedUsername,
          password: hashedPassword,
          name: name?.trim() || normalizedUsername,
        },
      });

      // Generate token
      const token = this.generateToken(user.id, user.email, user.username);

      return {
        ok: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name || undefined,
        },
      };
    } catch (error) {
      console.error('[Auth] Registration error:', error);
      return { ok: false, error: 'Registration failed' };
    }
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const normalizedEmail = normalizeEmail(email);

      // Validate input
      if (!normalizedEmail || !password) {
        return { ok: false, error: 'Email and password are required' };
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        return { ok: false, error: 'Invalid email or password' };
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.password);

      if (!isPasswordValid) {
        return { ok: false, error: 'Invalid email or password' };
      }

      // Generate token
      const token = this.generateToken(user.id, user.email, user.username);

      return {
        ok: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name || undefined,
        },
      };
    } catch (error) {
      console.error('[Auth] Login error:', error);
      return { ok: false, error: 'Login failed' };
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string) {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          createdAt: true,
        },
      });
    } catch {
      return null;
    }
  }

  /**
   * Verify token and get user
   */
  static async verifyTokenAndGetUser(token: string) {
    const payload = this.verifyToken(token);
    if (!payload) {
      return null;
    }

    return this.getUserById(payload.userId);
  }
}
