import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "Valid ID is required" });
    return;
  }

  switch (req.method) {
    case 'GET':
      await getAgentById(req, res, id);
      return;
    case 'PUT':
      await updateAgent(req, res, id);
      return;
    case 'DELETE':
      await deleteAgent(req, res, id);
      return;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      return;
  }
}

// Get agent by ID
async function getAgentById(req: NextApiRequest, res: NextApiResponse, id: string): Promise<void> {
  try {
    const token = parseAuthHeader(req.headers.authorization);

    // Verify the token
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const payload = await verifyToken(token);
    if (!payload) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    const agent = await prisma.agent.findUnique({
      where: { id },
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
      }
    });

    if (!agent) {
      res.status(404).json({ message: 'Agent not found' });
      return;
    }

    res.status(200).json(agent);
    return;
  } catch (error: unknown) {
    console.error("Request error", error);
    res.status(500).json({ error: "Error fetching agent" });
    return;
  }
}

// Update agent
async function updateAgent(req: NextApiRequest, res: NextApiResponse, id: string): Promise<void> {
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

    const userId = payload.userId;

    // Find the agent first to ensure it exists
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        createdBy: true
      }
    });

    if (!agent) {
      res.status(404).json({ message: 'Agent not found' });
      return;
    }

    // Optional: Check if user has permission to update this agent
    // For example, only allow creator or owner to update
    // This is a simple permission check, you might want to expand it
    if (agent.createdById !== userId &&
      !((agent.ownerType === 'user' && agent.userId === userId) ||
        (agent.ownerType === 'team' && await isUserTeamMember(userId, agent.teamId)))) {
      res.status(403).json({ error: 'You do not have permission to update this agent' });
      return;
    }

    const { name, description, flowConfig, isActive } = req.body as Partial<{
      name: string;
      description: string;
      flowConfig: any;
      isActive: boolean;
    }>;

    // Prepare the update data
    const updateData: {
      name?: string;
      description?: string;
      flowConfig?: any;
      isActive?: boolean;
      updatedAt?: Date;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (flowConfig !== undefined) updateData.flowConfig = flowConfig as any;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedAt = new Date(); // Update the timestamp

    // Update the agent
    const updatedAgent = await prisma.agent.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: true,
        user: true,
        team: true
      }
    });

    res.status(200).json(updatedAgent);
    return;
  } catch (error: unknown) {
    console.error('Error updating agent:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
}

// Delete agent
async function deleteAgent(req: NextApiRequest, res: NextApiResponse, id: string): Promise<void> {
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

    const userId = payload.userId;

    // Find the agent first to ensure it exists
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        createdBy: true
      }
    });

    if (!agent) {
      res.status(404).json({ message: 'Agent not found' });
      return;
    }

    // Optional: Check if user has permission to delete this agent
    if (agent.createdById !== userId &&
      !((agent.ownerType === 'user' && agent.userId === userId) ||
        (agent.ownerType === 'team' && await isUserTeamAdmin(userId, agent.teamId)))) {
      res.status(403).json({ error: 'You do not have permission to delete this agent' });
      return;
    }

    await prisma.agent.delete({
      where: { id },
    });

    res.status(204).end();
    return;
  } catch (error: unknown) {
    console.error("Request error", error);
    res.status(500).json({ error: "Error deleting agent" });
    return;
  }
}

// Helper function to check if user is a member of the team
async function isUserTeamMember(userId: string, teamId: string | null): Promise<boolean> {
  if (!teamId) return false;

  const membership = await prisma.memberTeam.findFirst({
    where: {
      userId,
      teamId,
      leftAt: null // Only active memberships
    }
  });

  return !!membership;
}

// Helper function to check if user is an admin of the team
async function isUserTeamAdmin(userId: string, teamId: string | null): Promise<boolean> {
  if (!teamId) return false;

  const membership = await prisma.memberTeam.findFirst({
    where: {
      userId,
      teamId,
      leftAt: null,
      permission: {
        in: ['owner', 'admin'] // Only owner or admin can delete
      }
    }
  });

  return !!membership;
}
