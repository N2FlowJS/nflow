import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Valid ID is required' });
    return;
  }

  switch (req.method) {
    case 'GET':
      await getUserById(res, id);
      return;
    case 'PUT':
      await updateUser(req, res, id);
      return;
    case 'DELETE':
      await deleteUser(res, id);
      return;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      return;
  }
}

// Get user by ID
async function getUserById(res: NextApiResponse, id: string): Promise<void> {
  try {
    // Fetch user with basic relations
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        teams: true,
        teamMemberships: {
          include: {
            team: true,
          },
          where: {
            leftAt: null, // Only include active memberships
          },
        },
        ownedAgents: true, // Include agents owned by this user
        apiTokens: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            expiresAt: true,
            lastUsedAt: true,
            status: true,
            
            // Don't return token values
          },
          where: {
            status: 'active', // Only include active tokens
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Create teamsWithRoles by combining direct teams and memberships
    const teamsWithRoles = user.teamMemberships.map((membership: any) => ({
      id: membership.team.id,
      name: membership.team.name,
      description: membership.team.description,
      role: membership.permission,
      joinedAt: membership.joinedAt,
    }));

    // Return user with enhanced team information
    const enhancedUser = {
      ...user,
      teamsWithRoles,
    };

    res.status(200).json(enhancedUser);
    return;
  } catch (error: unknown) {
    console.error('Request error', error);
    res.status(500).json({ error: 'Error fetching user' });
    return;
  }
}

// Update user
async function updateUser(req: NextApiRequest, res: NextApiResponse, id: string): Promise<void> {
  try {
    const { name, description, lmmConfig } = req.body;

   
    // Prepare the update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (lmmConfig) updateData.lmmConfig = lmmConfig;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(user);
    return;
  } catch (error: unknown) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
}

// Delete user
async function deleteUser(res: NextApiResponse, id: string): Promise<void> {
  try {
    await prisma.user.delete({
      where: { id },
    });
    res.status(204).end();
    return;
  } catch (error: unknown) {
    console.error('Request error', error);
    res.status(500).json({ error: 'Error deleting user' });
    return;
  }
}
