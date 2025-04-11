import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Valid ID is required" });
  }
  
  switch (req.method) {
    case 'GET':
      return getAgentById(req, res, id);
    case 'PUT':
      return updateAgent(req, res, id);
    case 'DELETE':
      return deleteAgent(req, res, id);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Get agent by ID
async function getAgentById(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
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
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    return res.status(200).json(agent);
  } catch (error) {
    console.error("Request error", error);
    return res.status(500).json({ error: "Error fetching agent" });
  }
}

// Update agent
async function updateAgent(req: NextApiRequest, res: NextApiResponse, id: string) {
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
    
    const userId = payload.userId;
    
    // Find the agent first to ensure it exists
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        createdBy: true
      }
    });
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    // Optional: Check if user has permission to update this agent
    // For example, only allow creator or owner to update
    // This is a simple permission check, you might want to expand it
    if (agent.createdById !== userId && 
        !((agent.ownerType === 'user' && agent.userId === userId) || 
          (agent.ownerType === 'team' && await isUserTeamMember(userId, agent.teamId)))) {
      return res.status(403).json({ error: 'You do not have permission to update this agent' });
    }
    
    const { name, description, flowConfig, isActive } = req.body;
    
    // Prepare the update data
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (flowConfig !== undefined) updateData.flowConfig = flowConfig;
    if (isActive !== undefined) updateData.isActive = isActive;
    
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
    
    return res.status(200).json(updatedAgent);
  } catch (error) {
    console.error('Error updating agent:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Delete agent
async function deleteAgent(req: NextApiRequest, res: NextApiResponse, id: string) {
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
    
    const userId = payload.userId;
    
    // Find the agent first to ensure it exists
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        createdBy: true
      }
    });
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    // Optional: Check if user has permission to delete this agent
    if (agent.createdById !== userId && 
        !((agent.ownerType === 'user' && agent.userId === userId) || 
          (agent.ownerType === 'team' && await isUserTeamAdmin(userId, agent.teamId)))) {
      return res.status(403).json({ error: 'You do not have permission to delete this agent' });
    }
    
    await prisma.agent.delete({
      where: { id },
    });
    
    return res.status(204).end();
  } catch (error) {
    console.error("Request error", error);
    return res.status(500).json({ error: "Error deleting agent" });
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
      role: {
        in: ['owner', 'admin'] // Only owner or admin can delete
      }
    }
  });
  
  return !!membership;
}
