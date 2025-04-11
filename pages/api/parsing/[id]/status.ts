import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Valid parsing task ID is required' });
  }

  // GET - Get current parsing status
  if (req.method === 'GET') {
    try {
      const task = await prisma.fileParsingTask.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          completedAt: true,
          message: true,
          file: {
            select: {
              id: true,
              originalName: true,
              parsingStatus: true
            }
          }
        }
      });
      
      if (!task) {
        return res.status(404).json({ error: 'Parsing task not found' });
      }
      
      return res.status(200).json({
        taskId: task.id,
        status: task.status,
        fileId: task.file.id,
        fileName: task.file.originalName,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt,
        message: task.message
      });
    } catch (error) {
      console.error("Error fetching parsing status:", error);
      return res.status(500).json({ error: "Failed to fetch parsing status" });
    }
  }
  
  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
