import express, { type NextFunction, type Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import type { ApiResponse } from '../utils/apiResponse';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the an5 database client — must include all methods used by FlowStorageService
const dbMock = {
  flow: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn(),
  },
};

vi.mock('../lib/db', () => ({
  db: dbMock,
}));

// Mock executeFlowOnServer
vi.mock('../services/flowExecutionService', () => ({
  executeFlowOnServer: vi.fn(),
}));

// Mock auth middleware
vi.mock('../middleware/auth', () => ({
  requireUserId: (req: AuthRequest, _res: Response, next: NextFunction) => {
    req.userId = 'test-user-id';
    next();
  },
}));

const { default: flowRoute } = await import('../routes/flow');

function createTestApp() {
  const app = express();
  app.use(express.json());
  // Inject userId to simulate authenticated session
  app.use((req: AuthRequest, _res: Response, next: NextFunction) => {
    req.userId = 'test-user-id';
    next();
  });
  app.use('/api', flowRoute);
  return app;
}

async function withTestServer<T>(run: (baseUrl: string) => Promise<T>): Promise<T> {
  const app = createTestApp();
  return new Promise<T>((resolve, reject) => {
    // The listener is intentionally not `async`: an async callback would return a
    // promise nobody awaits, so a throw here would become an unhandled rejection.
    const server = app.listen(0, () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('Failed to resolve test server address'));
        return;
      }
      const baseUrl = `http://127.0.0.1:${address.port}`;
      run(baseUrl).then(
        (result) => server.close(() => resolve(result)),
        (err: unknown) => server.close(() => reject(err)),
      );
    });
  });
}

describe('Flow API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/flows - should return list of flows with correct node/edge counts', async () => {
    const now = new Date();
    const mockFlows = [
      {
        id: '1',
        name: 'Test Flow',
        createdAt: now,
        updatedAt: now,
        data: JSON.stringify({
          nodes: [{ id: 'n1' }, { id: 'n2' }],
          edges: [{ id: 'e1' }],
        }),
      },
    ];

    const expectedData = [
      {
        id: '1',
        name: 'Test Flow',
        updatedAt: now.getTime(),
        createdAt: now.getTime(),
        nodeCount: 2,
        edgeCount: 1,
      },
    ];
    dbMock.flow.findMany.mockResolvedValue(mockFlows);

    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/flows`);
      const body = (await response.json()) as ApiResponse;

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data).toEqual(expectedData);
    });
  });

  it('POST /api/flows - should save a new flow', async () => {
    const now = new Date();
    const savedFlow = {
      id: 'flow-42',
      name: 'New Flow',
      data: '{}',
      createdAt: now,
      updatedAt: now,
      userId: 'test-user-id',
    };
    // saveFlow first calls findUnique (returns null → new flow), then upsert
    dbMock.flow.findUnique.mockResolvedValue(null);
    dbMock.flow.upsert.mockResolvedValue(savedFlow);

    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/flows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'flow-42', name: 'New Flow', nodes: [], edges: [] }),
      });
      const body = (await response.json()) as ApiResponse<{ id: string }>;

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data?.id).toBe('flow-42');
      expect(dbMock.flow.upsert).toHaveBeenCalled();
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
    dbMock.flow.findUnique.mockResolvedValue(mockFlow);

    await withTestServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/flows/1`);
      const body = (await response.json()) as ApiResponse<{ id: string; name: string }>;

      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data?.id).toBe('1');
      expect(body.data?.name).toBe('Test Flow');
    });
  });
});
