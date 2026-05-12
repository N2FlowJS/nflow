import express, { Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { successResponse } from '../utils/apiResponse';

// Mock Prisma
const prismaMock = {
  flow: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock('../lib/prisma', () => ({
  default: prismaMock,
}));

// Mock executeFlowOnServer
vi.mock('../services/flowExecutionService', () => ({
  executeFlowOnServer: vi.fn(),
}));

// Mock Middleware để bypass Auth và Validation nếu cần
vi.mock('../middleware/auth', () => ({
  requireUserId: (req: any, res: any, next: any) => {
    req.userId = 'test-user-id';
    next();
  },
}));

const { default: flowRoute } = await import('../routes/flow');

function createTestApp() {
  const app = express();
  app.use(express.json());
  // Giả lập middleware auth để inject userId
  app.use((req: any, res, next) => {
    req.userId = 'test-user-id';
    next();
  });
  app.use('/api', flowRoute);
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

describe('Flow API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/flows - should return list of flows', async () => {
    const mockFlows = [{ id: '1', name: 'Test Flow' }];
    prismaMock.flow.findMany.mockResolvedValue(mockFlows);

    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/flows`);
      const body = await response.json() as any;

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data).toEqual(mockFlows);
      expect(prismaMock.flow.findMany).toHaveBeenCalledWith({
        where: { userId: 'test-user-id' },
        orderBy: { updatedAt: 'desc' },
      });
    });
  });

  it('POST /api/flows - should create a new flow', async () => {
    const newFlow = { id: '2', name: 'New Flow', nodes: '[]', edges: '[]' };
    prismaMock.flow.create.mockResolvedValue(newFlow);

    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/flows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Flow', nodes: [], edges: [] }),
      });
      const body = await response.json() as any;

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.name).toBe('New Flow');
    });
  });

  it('GET /api/flow/:id - should return single flow', async () => {
    const mockFlow = { id: '1', name: 'Test Flow', nodes: '[]', edges: '[]' };
    prismaMock.flow.findUnique.mockResolvedValue(mockFlow);

    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/flow/1`);
      const body = await response.json() as any;

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.id).toBe('1');
    });
  });
});
