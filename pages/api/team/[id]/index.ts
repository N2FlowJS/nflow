import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Valid ID is required" });
  }
  
  switch (req.method) {
    case 'GET':
      return getTeamById(req, res, id);
    case 'PUT':
      return updateTeam(req, res, id);
    case 'DELETE':
      return deleteTeam(req, res, id);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Get team by ID
async function getTeamById(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        users: true,
        createdBy: true,
        members: {
          include: {
            user: true
          }
        },
        ownedAgents: true // Include owned agents in the response
      }
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    return res.status(200).json(team);
  } catch (error) {
    console.error("Request error", error);
    return res.status(500).json({ error: "Error fetching team" });
  }
}

// Update team
async function updateTeam(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { name, description, userIds } = req.body;
    
    if (!name && !description && !userIds) {
      return res.status(400).json({ message: 'At least one field must be provided' });
    }
    
    // Prepare the update data
    const updateData: any = {
      ...(name && { name }),
      ...(description && { description }),
    };

    // Handle user relationship updates if provided
    if (userIds) {
      updateData.users = {
        set: userIds.map((userId: string) => ({ id: userId })),
      };
    }
    
    const team = await prisma.team.update({
      where: { id },
      data: updateData,
      include: {
        users: true
      }
    });
    
    return res.status(200).json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Delete team
async function deleteTeam(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    await prisma.team.delete({
      where: { id },
    });
    
    return res.status(204).end();
  } catch (error) {
    console.error("Request error", error);
    return res.status(500).json({ error: "Error deleting team" });
  }
}
