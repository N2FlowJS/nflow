import express from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// SecretService uses prisma.userSecret (not prisma.secret)
const prismaMock = {
  userSecret: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
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
  // Inject userId to simulate authenticated session
  app.use((req: any, _res: any, next: any) => {
    req.userId = 'test-user-id';
    next();
  });
  app.use('/api', secretsRoute);
  return app;
}

async function withTestServer<T>(run: (baseUrl: string) => Promise<T>): Promise<T> {
  const app = createTestApp();
  return new Promise<T>((resolve, reject) => {
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

  it('GET /api/secrets - should return list of secrets', async () => {
    const now = new Date();
    // listSecrets calls userSecret.findMany with select, then formats the response
    // The key field is used for keyPreview computation via getKeyPreview
    const mockSecrets = [
      {
        id: '1',
        name: 'API_KEY',
        label: 'My API Key',
        key: 'plain-text-key-1234', // plain text so getKeyPreview can slice it
        createdAt: now,
        lastUsedAt: null,
      },
    ];
    prismaMock.userSecret.findMany.mockResolvedValue(mockSecrets);

    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/secrets`);
      const body = await response.json() as any;

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toBe('API_KEY');
      // keyPreview should show last 4 chars: "1234"
      expect(body.data[0].keyPreview).toBe('****1234');
      expect(prismaMock.userSecret.findMany).toHaveBeenCalled();
    });
  });

  it('POST /api/secrets - should create a new secret', async () => {
    const now = new Date();
    const createdSecret = {
      id: '2',
      name: 'NEW_KEY',
      label: '',
      key: 'some-encrypted-value',
      createdAt: now,
      lastUsedAt: null,
    };
    // createSecret first checks for duplicate name (findFirst → null), then creates
    prismaMock.userSecret.findFirst.mockResolvedValue(null);
    prismaMock.userSecret.create.mockResolvedValue(createdSecret);

    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/secrets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // secrets route expects: name + key (not "value")
        body: JSON.stringify({ name: 'NEW_KEY', key: 'secret-value-1234' }),
      });
      const body = await response.json() as any;

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(prismaMock.userSecret.create).toHaveBeenCalled();
    });
  });

  it('DELETE /api/secrets/:id - should delete a secret by id', async () => {
    const now = new Date();
    const existingSecret = {
      id: 'secret-1',
      name: 'API_KEY',
      key: 'encrypted-value',
      createdAt: now,
      lastUsedAt: null,
    };
    // deleteSecret calls requireSecret (findFirst) then delete
    prismaMock.userSecret.findFirst.mockResolvedValue(existingSecret);
    prismaMock.userSecret.delete.mockResolvedValue(existingSecret);

    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/secrets/secret-1`, {
        method: 'DELETE',
      });
      const body = await response.json() as any;

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(prismaMock.userSecret.delete).toHaveBeenCalled();
    });
  });
});
