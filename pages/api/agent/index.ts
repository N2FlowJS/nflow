import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getAgents(req, res);
    case 'POST':
      return createAgent(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Get list of agents with filtering options
async function getAgents(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Xác thực token (tùy chọn cho request GET)
    const token = parseAuthHeader(req.headers.authorization);
    let userId = null;
    
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        userId = payload.userId;
      }
    }
    
    const { userId: queryUserId, teamId, isActive } = req.query;
    
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
    
    return res.status(200).json(agents);
  } catch (error) {
    console.error("Request error", error);
    return res.status(500).json({ error: "Error fetching agents" });
  }
}

// Create a new agent
async function createAgent(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get token from Authorization header
    const token = parseAuthHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const createdById = payload.userId;
    const { name, description, flowConfig, ownerType, userId, teamId, isActive = true } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ error: "Name and description are required" });
    }
    
    if (ownerType !== 'user' && ownerType !== 'team') {
      return res.status(400).json({ error: "Owner type must be 'user' or 'team'" });
    }
    
    if (ownerType === 'user' && !userId) {
      return res.status(400).json({ error: "User ID is required for user-owned agents" });
    }
    
    if (ownerType === 'team' && !teamId) {
      return res.status(400).json({ error: "Team ID is required for team-owned agents" });
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
    
    return res.status(201).json(agent);
  } catch (error) {
    console.error("Request error", error);
    return res.status(500).json({ error: "Error creating agent" });
  }
}
