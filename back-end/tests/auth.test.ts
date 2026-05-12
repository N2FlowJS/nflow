import express from 'express';
import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
  },
};

vi.mock('../lib/prisma', () => ({
  default: prismaMock,
}));

const { AuthService } = await import('../services/authService');
const { default: authRoute } = await import('../routes/auth');

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoute);
  return app;
}

async function withTestServer<T>(run: (baseUrl: string) => Promise<T>): Promise<T> {
  const app = createTestApp();

  return await new Promise<T>((resolve, reject) => {
    const server = app.listen(0, async () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('Failed to resolve test server address'));
        return;
      }

      const baseUrl = `http://127.0.0.1:${address.port}`;

      try {
        const result = await run(baseUrl);
        server.close((closeErr) => {
          if (closeErr) {
            reject(closeErr);
            return;
          }
          resolve(result);
        });
      } catch (error) {
        server.close(() => reject(error));
      }
    });
  });
}

describe('auth route flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs in successfully with valid credentials', async () => {
    const hashedPassword = await AuthService.hashPassword('password123');

    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      username: 'tester',
      name: 'Tester',
      password: hashedPassword,
    });

    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'User@Example.com',
          password: 'password123',
        }),
      });

      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload.ok).toBe(true);
      expect(typeof payload.token).toBe('string');
      expect(payload.user).toMatchObject({
        id: 'user-1',
        email: 'user@example.com',
        username: 'tester',
        name: 'Tester',
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
    });
  });

  it('rejects expired JWT tokens on protected auth routes', async () => {
    const expiredToken = jwt.sign(
      {
        userId: 'user-1',
        email: 'user@example.com',
        username: 'tester',
      },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: -1 },
    );

    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${expiredToken}`,
        },
      });

      const payload = await response.json();

      expect(response.status).toBe(401);
      expect(payload).toMatchObject({
        ok: false,
        error: 'Invalid or expired token.',
      });
    });
  });

  it('allows logout with a valid JWT token', async () => {
    const token = AuthService.generateToken('user-1', 'user@example.com', 'tester');

    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toMatchObject({
        ok: true,
        message: 'Logged out successfully',
      });
    });
  });
});