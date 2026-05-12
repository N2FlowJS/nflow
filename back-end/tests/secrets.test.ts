import express from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  secret: {
    findMany: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock('../lib/prisma', () => ({
  default: prismaMock,
}));

const { default: secretsRoute } = await import('../routes/secrets');

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use((req: any, res, next) => {
    req.userId = 'test-user-id';
    next();
  });
  app.use('/api/secrets', secretsRoute);
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
        server.close(() => resolve(result));
      } catch (err) {
        server.close(() => reject(err));
      }
    });
  });
}

describe('Secrets API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/secrets - should return list of secrets (names only)', async () => {
    const mockSecrets = [{ id: '1', name: 'API_KEY' }];
    prismaMock.secret.findMany.mockResolvedValue(mockSecrets);

    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/secrets`);
      const body = await response.json() as any;

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data).toEqual(mockSecrets);
    });
  });

  it('POST /api/secrets - should create a new secret', async () => {
    prismaMock.secret.create.mockResolvedValue({ id: '2', name: 'NEW_KEY' });

    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/secrets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'NEW_KEY', value: 'secret-value' }),
      });
      const body = await response.json() as any;

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(prismaMock.secret.create).toHaveBeenCalled();
    });
  });

  it('DELETE /api/secrets/:name - should delete a secret', async () => {
    prismaMock.secret.delete.mockResolvedValue({ id: '1' });

    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/secrets/API_KEY`, {
        method: 'DELETE',
      });
      const body = await response.json() as any;

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
    });
  });
});
