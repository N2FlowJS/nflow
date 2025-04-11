import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { parseAuthHeader, verifyToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow PATCH requests
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Extract file ID from path
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Valid file ID is required' });
  }

  // Check authentication
  const token = parseAuthHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    // Extract config from request body
    const { config } = req.body;

    // Update file config
    await prisma.file.update({
      where: { id },
      data: { config },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating file config:', error);
    return res.status(500).json({ error: 'Failed to update file configuration' });
  }
}
