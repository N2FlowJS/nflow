import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Valid ID is required" });
  }
  
  switch (req.method) {
    case 'GET':
      return getUserById(req, res, id);
    case 'PUT':
      return updateUser(req, res, id);
    case 'DELETE':
      return deleteUser(req, res, id);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Get user by ID
async function getUserById(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Fetch user with basic relations
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        teams: true,
        teamMemberships: {
          include: {
            team: true
          },
          where: {
            leftAt: null // Only include active memberships
          }
        },
        ownedAgents: true // Include agents owned by this user
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create teamsWithRoles by combining direct teams and memberships
    const teamsWithRoles = user.teamMemberships.map(membership => ({
      id: membership.team.id,
      name: membership.team.name,
      description: membership.team.description,
      role: membership.role,
      joinedAt: membership.joinedAt
    }));
    
    // Return user with enhanced team information
    const enhancedUser = {
      ...user,
      teamsWithRoles
    };
    
    return res.status(200).json(enhancedUser);
  } catch (error) {
    console.error("Request error", error);
    return res.status(500).json({ error: "Error fetching user" });
  }
}

// Update user
async function updateUser(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { name, description } = req.body;
    
    if (!name && !description) {
      return res.status(400).json({ message: 'Name or description is required' });
    }
    
    // Prepare the update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Delete user
async function deleteUser(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });
    
    return res.status(204).end();
  } catch (error) {
    console.error("Request error", error);
    return res.status(500).json({ error: "Error deleting user" });
  }
}
