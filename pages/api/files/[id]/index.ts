import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Valid file ID is required' });
  }

  // DELETE - Remove a file
  if (req.method === 'DELETE') {
    try {
      const file = await prisma.file.findUnique({
        where: { id },
        include: {
          knowledge: {
            select: { id: true }
          }
        }
      });

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Delete the file from the filesystem
      try {
        // The path should now point to the knowledge-specific folder
        fs.unlinkSync(file.path);
        
        // Check if the folder is empty and remove it if it is
        const folderPath = path.dirname(file.path);
        const remainingFiles = fs.readdirSync(folderPath);
        
        if (remainingFiles.length === 0) {
          fs.rmdirSync(folderPath);
        }
      } catch (fileError) {
        console.error('Error deleting physical file:', fileError);
        // Continue even if physical file deletion fails
      }

      // Delete the file record from the database
      await prisma.file.delete({
        where: { id },
      });

      return res.status(204).end();
    } catch (error) {
      console.error('Request error', error);
      return res.status(500).json({ error: 'Error deleting file' });
    }
  }
  
  // GET - Retrieve file details
  if (req.method === 'GET') {
    console.log("Fetching file:", id);
    
    try {
      const file = await prisma.file.findUnique({
        where: { id },
        include: {
          knowledge: {
            select: {
              id: true,
              name: true,
              description: true,
              
            }
          }
        }
      });
      
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      return res.status(200).json(file);
    } catch (error) {
      console.error("Error fetching file:", error);
      return res.status(500).json({ error: "Failed to fetch file" });
    }
  }

  res.setHeader('Allow', ['DELETE', 'GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
