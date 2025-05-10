import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/agent/index';
import { prisma } from '../../lib/prisma';
import { parseAuthHeader, verifyToken } from '../../lib/auth';

// Mock prisma
jest.mock('../../lib/prisma', () => ({
  prisma: {
    agent: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    // Mock other models if needed for includes
    user: { findUnique: jest.fn() },
    team: { findUnique: jest.fn() },
  },
}));

// Mock auth functions
jest.mock('../../lib/auth', () => ({
  parseAuthHeader: jest.fn(),
  verifyToken: jest.fn(),
}));

// Cast mocks for type safety
const mockedParseAuthHeader = parseAuthHeader as jest.Mock;
const mockedVerifyToken = verifyToken as jest.Mock;

describe('/api/agent API Endpoint', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Default mock implementations
    mockedParseAuthHeader.mockReturnValue('valid_token');
    mockedVerifyToken.mockReturnValue({ userId: 'test-user-id' });
  });

  describe('POST /api/agent', () => {
    it('should create a user-owned agent successfully', async () => {
      const mockAgentData = {
        name: 'Test Agent User',
        description: 'Test Description',
        ownerType: 'user',
        userId: 'owner-user-id',
        isActive: true,
        createdById: 'test-user-id',
        flowConfig: ({ nodes: [], edges: [] }),
      };
      const expectedAgent = { id: 'agent-1', ...mockAgentData, teamId: null, createdAt: new Date(), updatedAt: new Date() };

      (prisma.agent.create as jest.Mock).mockResolvedValue(expectedAgent as any); // Cast as any to simplify mock

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: { authorization: 'Bearer valid_token' },
        body: mockAgentData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ name: 'Test Agent User', ownerType: 'user' }));
      expect(prisma.agent.create).toHaveBeenCalledWith({
        data: expect.objectContaining(mockAgentData),
        include: { createdBy: true, user: true, team: true },
      });
    });

    it('should create a team-owned agent successfully', async () => {
        const mockAgentData = {
          name: 'Test Agent Team',
          description: 'Test Description',
          ownerType: 'team',
          teamId: 'owner-team-id',
          isActive: true,
          createdById: 'test-user-id',
          flowConfig: JSON.stringify({ nodes: [], edges: [] }),
        };
        const expectedAgent = { id: 'agent-2', ...mockAgentData, userId: null, createdAt: new Date(), updatedAt: new Date() };

        (prisma.agent.create as jest.Mock).mockResolvedValue(expectedAgent as any);

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'POST',
          headers: { authorization: 'Bearer valid_token' },
          body: mockAgentData,
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(201);
        expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ name: 'Test Agent Team', ownerType: 'team' }));
        expect(prisma.agent.create).toHaveBeenCalledWith({
          data: expect.objectContaining({ ...mockAgentData, userId: null }), // Ensure userId is null for team
          include: { createdBy: true, user: true, team: true },
        });
      });

    it('should return 401 if authentication is missing', async () => {
      mockedParseAuthHeader.mockReturnValue(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: { name: 'Test', description: 'Test' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({ error: 'Authentication required' });
    });

    it('should return 401 if token is invalid', async () => {
      mockedVerifyToken.mockReturnValue(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        headers: { authorization: 'Bearer invalid_token' },
        body: { name: 'Test', description: 'Test' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({ error: 'Invalid token' });
    });

    it('should return 400 if required fields are missing', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'POST',
          headers: { authorization: 'Bearer valid_token' },
          body: { description: 'Test Description' }, // Missing name
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData())).toEqual({ error: 'Name and description are required' });
      });

    // Add more tests for other validation errors (invalid ownerType, missing userId/teamId)
  });

  describe('GET /api/agent', () => {
    it('should return a list of agents', async () => {
      const mockAgents = [
        { id: 'agent-1', name: 'Agent 1', description: 'Desc 1', ownerType: 'user', userId: 'user-1', teamId: null, isActive: true, createdById: 'creator-1', createdAt: new Date(), updatedAt: new Date() },
        { id: 'agent-2', name: 'Agent 2', description: 'Desc 2', ownerType: 'team', userId: null, teamId: 'team-1', isActive: false, createdById: 'creator-2', createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma.agent.findMany as jest.Mock).mockResolvedValue(mockAgents as any);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: { authorization: 'Bearer valid_token' },
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toHaveLength(2);
      expect(prisma.agent.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object), // Check include structure if needed
        orderBy: { updatedAt: 'desc' },
      });
    });

    it('should filter agents by userId', async () => {
        (prisma.agent.findMany as jest.Mock).mockResolvedValue([]); // Mock return value as needed

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'GET',
          headers: { authorization: 'Bearer valid_token' },
          query: { userId: 'filter-user-id' },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(prisma.agent.findMany).toHaveBeenCalledWith(expect.objectContaining({
          where: { userId: 'filter-user-id', ownerType: 'user' },
        }));
      });

    it('should filter agents by teamId', async () => {
        (prisma.agent.findMany as jest.Mock).mockResolvedValue([]);

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'GET',
          headers: { authorization: 'Bearer valid_token' },
          query: { teamId: 'filter-team-id' },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(prisma.agent.findMany).toHaveBeenCalledWith(expect.objectContaining({
          where: { teamId: 'filter-team-id', ownerType: 'team' },
        }));
      });

      it('should filter agents by isActive=true', async () => {
        (prisma.agent.findMany as jest.Mock).mockResolvedValue([]);

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'GET',
          headers: { authorization: 'Bearer valid_token' },
          query: { isActive: 'true' },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(prisma.agent.findMany).toHaveBeenCalledWith(expect.objectContaining({
          where: { isActive: true },
        }));
      });

      it('should filter agents by isActive=false', async () => {
        (prisma.agent.findMany as jest.Mock).mockResolvedValue([]);

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'GET',
          headers: { authorization: 'Bearer valid_token' },
          query: { isActive: 'false' },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(prisma.agent.findMany).toHaveBeenCalledWith(expect.objectContaining({
          where: { isActive: false },
        }));
      });

    it('should return 401 if authentication is missing', async () => {
      mockedParseAuthHeader.mockReturnValue(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({ error: 'Authentication required' });
    });

    it('should return 401 if token is invalid', async () => {
      mockedVerifyToken.mockReturnValue(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        headers: { authorization: 'Bearer invalid_token' },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({ error: 'Invalid token' });
    });
  });

  describe('Unsupported methods', () => {
    it('should return 405 for unsupported methods', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT', // Or DELETE, PATCH, etc.
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({ message: 'Method not allowed' });
    });
  });
});
