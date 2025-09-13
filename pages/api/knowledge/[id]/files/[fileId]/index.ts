import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import { prisma } from '../../../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { id, fileId } = req.query;

  if (!id || typeof id !== 'string' || !fileId || typeof fileId !== 'string') {
    res.status(400).json({ error: 'Valid knowledge ID and file ID are required' });
    return;
  }

  // Get file info
  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Verify that the file belongs to the specified knowledge
    if (file.knowledgeId !== id) {
      res.status(403).json({ error: 'File does not belong to the specified knowledge' });
      return;
    }

    if (req.method === 'GET') {
      res.status(200).json(file);
      return;
    } 
    
    if (req.method === 'DELETE') {
      // Delete file from disk
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (error: unknown) {
        console.error('Error deleting file from disk:', error);
        // Continue with database deletion even if file deletion fails
      }

      // Delete file from database
      await prisma.file.delete({
        where: { id: fileId },
      });

      res.status(204).end();
      return;
    }

    res.setHeader('Allow', ['GET', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  } catch (error: unknown) {
    console.error('Error processing file request:', error);
    res.status(500).json({ error: 'Failed to process file request' });
    return;
  }
}
