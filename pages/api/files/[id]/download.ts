import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Valid file ID is required' });
  }

  // GET - Download a file
  if (req.method === 'GET') {
    try {
      const file = await prisma.file.findUnique({
        where: { id },
      });

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Check if file exists on filesystem
      if (!fs.existsSync(file.path)) {
        return res.status(404).json({ error: 'File not found on server' });
      }

      // Set headers to force download
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimetype);

      // Stream the file to the response
      const fileStream = fs.createReadStream(file.path);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Request error', error);
      return res.status(500).json({ error: 'Error downloading file' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
