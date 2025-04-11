import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  console.log(id);

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Valid file ID is required" });
  }

  // GET - Retrieve file content
  if (req.method === "GET") {
    try {
      const file = await prisma.file.findUnique({
        where: { id },
        select: {
          id: true,
          originalName: true,
          mimetype: true,
          content: true,
          parsingStatus: true,
        },
      });

      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      if (file.parsingStatus !== "completed") {
        return res
          .status(200)
          .json({
            id: file.id,
            originalName: file.originalName,
            content: "File content is still being processed",
          });
      }

      return res.status(200).json({
        id: file.id,
        originalName: file.originalName,
        content: file.content || "File content not available",
      });
    } catch (error) {
      console.error("Error fetching file content:", error);
      return res.status(500).json({ error: "Failed to fetch file content" });
    }
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
