import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  switch (req.method) {
    case 'GET':
      await getAgents(req, res);
      return;
    case 'POST':
      await createAgent(req, res);
      return;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      return;
  }
}

// Get list of agents with filtering options
async function getAgents(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    // Xác thực token (tùy chọn cho request GET)
    const token = parseAuthHeader(req.headers.authorization);
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Verify token
    const payload = await verifyToken(token);
    if (!payload) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }


    const { userId: queryUserId, teamId, isActive, excludeId } = req.query;

    const where: any = {};

    // Filter by owner
    if (queryUserId) {
      where.userId = queryUserId as string;
      where.ownerType = "user";
    }

    if (teamId) {
      where.teamId = teamId as string;
      where.ownerType = "team";
    }

    // Filter by active status
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Add excludeId filter to prevent circular references in sub-agent selection
    if (excludeId && typeof excludeId === 'string') {
      where.id = {
        not: excludeId,
      };
    }

    const agents = await prisma.agent.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          }
        },
        user: {
          select: {
            id: true,
            name: true,
          }
        },
        team: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.status(200).json(agents);
    return;
  } catch (error: unknown) {
    console.error("Request error", error);
    res.status(500).json({ error: "Error fetching agents" });
    return;
  }
}

// Create a new agent
async function createAgent(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    // Get token from Authorization header
    const token = parseAuthHeader(req.headers.authorization);
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Verify token
    const payload = await verifyToken(token);
    if (!payload) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const createdById = payload.userId;
    const { name, description, flowConfig, ownerType, userId, teamId, isActive = true } = req.body;

    if (!name || !description) {
      res.status(400).json({ error: "Name and description are required" });
      return;
    }

    if (ownerType !== 'user' && ownerType !== 'team') {
      res.status(400).json({ error: "Owner type must be 'user' or 'team'" });
      return;
    }

    if (ownerType === 'user' && !userId) {
      res.status(400).json({ error: "User ID is required for user-owned agents" });
      return;
    }

    if (ownerType === 'team' && !teamId) {
      res.status(400).json({ error: "Team ID is required for team-owned agents" });
      return;
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        description,
        flowConfig: flowConfig || JSON.stringify({ nodes: [], edges: [] }),
        ownerType,
        userId: ownerType === 'user' ? userId : null,
        teamId: ownerType === 'team' ? teamId : null,
        isActive,
        createdById,
      },
      include: {
        createdBy: true,
        user: true,
        team: true
      }
    });

    res.status(201).json(agent);
    return;
  } catch (error: unknown) {
    console.error("Request error", error);
    res.status(500).json({ error: "Error creating agent" });
    return;
  }
}
