import express, { Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Prisma — must include all methods used by FlowStorageService
const prismaMock = {
  flow: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
  },
};

vi.mock('../lib/prisma', () => ({
  default: prismaMock,
}));

// Mock executeFlowOnServer
vi.mock('../services/flowExecutionService', () => ({
  executeFlowOnServer: vi.fn(),
}));

// Mock auth middleware
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
  // Inject userId to simulate authenticated session
  app.use((req: any, _res: any, next: any) => {
    req.userId = 'test-user-id';
    next();
  });
  app.use('/api', flowRoute);
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

describe('Flow API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/flows - should return list of flows', async () => {
    const now = new Date();
    const mockFlows = [{ id: '1', name: 'Test Flow', createdAt: now, updatedAt: now }];
    // FlowStorageService.mapFlowRow converts dates to timestamps
    const expectedData = mockFlows.map(f => ({
      id: f.id,
      name: f.name,
      updatedAt: now.getTime(),
      createdAt: now.getTime(),
      nodeCount: 0,
      edgeCount: 0,
    }));
    prismaMock.flow.findMany.mockResolvedValue(mockFlows);

    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/flows`);
      const body = await response.json() as any;

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data).toEqual(expectedData);
      // Service uses select: { id, name, createdAt, updatedAt } + where/orderBy
      expect(prismaMock.flow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'test-user-id' },
          orderBy: { updatedAt: 'desc' },
        }),
      );
    });
  });

  it('POST /api/flows - should save a new flow', async () => {
    const now = new Date();
    const savedFlow = { id: 'flow-42', name: 'New Flow', data: '{}', createdAt: now, updatedAt: now, userId: 'test-user-id' };
    // saveFlow first calls findUnique (returns null → new flow), then upsert
    prismaMock.flow.findUnique.mockResolvedValue(null);
    prismaMock.flow.upsert.mockResolvedValue(savedFlow);

    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/flows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'flow-42', name: 'New Flow', nodes: [], edges: [] }),
      });
      const body = await response.json() as any;

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.id).toBe('flow-42');
      expect(prismaMock.flow.upsert).toHaveBeenCalled();
    });
  });

  it('GET /api/flows/:id - should return single flow', async () => {
    const now = new Date();
    const mockFlow = {
      id: '1',
      name: 'Test Flow',
      data: '{"nodes":[],"edges":[]}',
      createdAt: now,
      updatedAt: now,
      userId: 'test-user-id',
    };
    prismaMock.flow.findUnique.mockResolvedValue(mockFlow);

    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/flows/1`);
      const body = await response.json() as any;

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.id).toBe('1');
      expect(body.data.name).toBe('Test Flow');
    });
  });
});
