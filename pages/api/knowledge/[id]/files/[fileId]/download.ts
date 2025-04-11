import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../../lib/prisma";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, fileId } = req.query;

  if (!id || typeof id !== "string" || !fileId || typeof fileId !== "string") {
    return res.status(400).json({ error: "Valid knowledge ID and file ID are required" });
  }

  // Check if file exists
  const file = await prisma.file.findFirst({
    where: { 
      id: fileId,
      knowledgeId: id
    },
  });

  if (!file) {
    return res.status(404).json({ error: "File not found" });
  }

  if (req.method === "GET") {
    try {
      // Fix the file path to match where files are actually saved
      const filePath = path.join(process.cwd(), "uploads", "files", id, file.filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found on disk" });
      }
      
      // Set proper content type
      res.setHeader("Content-Type", file.mimetype);
      
      // Set content disposition for download with original filename
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${encodeURIComponent(file.originalName)}`
      );
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("File download error:", error);
      return res.status(500).json({ error: "Failed to download file" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
