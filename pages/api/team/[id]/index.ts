import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "Valid ID is required" });
    return;
  }

  switch (req.method) {
    case 'GET':
      await getTeamById(res, id);
      return;
    case 'PUT':
      await updateTeam(req, res, id);
      return;
    case 'DELETE':
      await deleteTeam(res, id);
      return;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      return;
  }
}

// Get team by ID
async function getTeamById(res: NextApiResponse, id: string): Promise<void> {
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
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    res.status(200).json(team);
    return;
  } catch (error: unknown) {
    console.error("Request error", error);
    res.status(500).json({ error: "Error fetching team" });
    return;
  }
}

// Update team
async function updateTeam(req: NextApiRequest, res: NextApiResponse, id: string): Promise<void> {
  try {
    const { name, description, userIds } = req.body;

    if (!name && !description && !userIds) {
      res.status(400).json({ message: 'At least one field must be provided' });
      return;
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

    res.status(200).json(team);
    return;
  } catch (error: unknown) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
}

// Delete team
async function deleteTeam(res: NextApiResponse, id: string): Promise<void> {
  try {
    await prisma.team.delete({
      where: { id },
    });
    res.status(204).end();
    return;
  } catch (error: unknown) {
    console.error("Request error", error);
    res.status(500).json({ error: "Error deleting team" });
    return;
  }
}
