import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import { prisma } from '../../../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, fileId } = req.query;

  if (!id || typeof id !== 'string' || !fileId || typeof fileId !== 'string') {
    return res.status(400).json({ error: 'Valid knowledge ID and file ID are required' });
  }

  // Get file info
  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Verify that the file belongs to the specified knowledge
    if (file.knowledgeId !== id) {
      return res.status(403).json({ error: 'File does not belong to the specified knowledge' });
    }

    if (req.method === 'GET') {
      return res.status(200).json(file);
    } 
    
    if (req.method === 'DELETE') {
      // Delete file from disk
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (error) {
        console.error('Error deleting file from disk:', error);
        // Continue with database deletion even if file deletion fails
      }

      // Delete file from database
      await prisma.file.delete({
        where: { id: fileId },
      });

      return res.status(204).end();
    }

    res.setHeader('Allow', ['GET', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Error processing file request:', error);
    return res.status(500).json({ error: 'Failed to process file request' });
  }
}
