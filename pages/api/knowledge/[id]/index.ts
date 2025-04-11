import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Valid ID is required" });
  }

  if (req.method === "GET") {
    try {
      const knowledge = await prisma.knowledge.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          users: {
            select: {
              id: true,
              name: true,
            }
          },
          teams: {
            select: {
              id: true,
              name: true,
            }
          },
          files: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!knowledge) {
        return res.status(404).json({ error: "Knowledge item not found" });
      }

      return res.status(200).json(knowledge);
    } catch (error) {
      console.error("Request error", error);
      return res.status(500).json({ error: "Error fetching knowledge item" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { name, description, userIds, teamIds , config } = req.body;

      if (!name && !description && !userIds && !teamIds && !config) {
        return res
          .status(400)
          .json({ error: "At least one field to update is required" });
      }

      // Prepare the update data
      const updateData: any = {
        ...(name && { name }),
        ...(description && { description }),
        ...(config && { config }),
      };

      // Handle relationship updates if provided
      if (userIds) {
        updateData.users = {
          set: userIds.map((userId: string) => ({ id: userId })),
        };
      }

      if (teamIds) {
        updateData.teams = {
          set: teamIds.map((teamId: string) => ({ id: teamId })),
        };
      }

      const knowledge = await prisma.knowledge.update({
        where: { id },
        data: updateData,
      });

      return res.status(200).json(knowledge);
    } catch (error) {
      console.error("Request error", error);
      return res.status(500).json({ error: "Error updating knowledge item" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.knowledge.delete({
        where: { id },
      });

      return res.status(204).end();
    } catch (error) {
      console.error("Request error", error);
      return res.status(500).json({ error: "Error deleting knowledge item" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
