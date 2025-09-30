import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "Valid ID is required" });
    return;
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
              code: true,
              permission: true
            }
          },
          users: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          teams: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          files: true,
          llmModel: true
        }
      });

      if (!knowledge) {
        res.status(404).json({ error: "Knowledge item not found" });
        return;
      }

      res.status(200).json(knowledge);
      return;
    } catch (error: unknown) {
      console.error("Request error", error);
      res.status(500).json({ error: "Error fetching knowledge item" });
      return;
    }
  }

  if (req.method === "PUT") {
    try {
      const { name, description, userIds, teamIds, config, modelId } = req.body;

      if (!name && !description && !userIds && !teamIds && !config) {
        res
          .status(400)
          .json({ error: "At least one field to update is required" });
        return;
      }

      // Prepare the update data
      const updateData: Record<string, unknown> = {
        ...(name && { name }),
        ...(description && { description }),
        ...(config && { config }),
        ...(modelId && { modelId }),
      };

      // Handle relationship updates if provided
      if (userIds) {
        updateData.users = {
          set: (userIds as string[]).map((userId) => ({ id: userId })),
        };
      }

      if (teamIds) {
        updateData.teams = {
          set: (teamIds as string[]).map((teamId) => ({ id: teamId })),
        };
      }

      const knowledge = await prisma.knowledge.update({
        where: { id },
        data: updateData,
      });

      res.status(200).json(knowledge);
      return;
    } catch (error: unknown) {
      console.error("Request error", error);
      res.status(500).json({ error: "Error updating knowledge item" });
      return;
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.knowledge.delete({
        where: { id },
      });

      res.status(204).end();
      return;
    } catch (error: unknown) {
      console.error("Request error", error);
      res.status(500).json({ error: "Error deleting knowledge item" });
      return;
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
  return;
}
