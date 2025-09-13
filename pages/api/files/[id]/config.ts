import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { parseAuthHeader, verifyToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Only allow PATCH requests
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  // Extract file ID from path
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Valid file ID is required' });
    return;
  }

  // Check authentication
  const token = parseAuthHeader(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  
  const payload = await verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  try {
    // Extract config from request body
    const { config } = req.body;

    // Update file config
    await prisma.file.update({
      where: { id },
      data: { config },
    });

    res.status(200).json({ success: true });
    return;
  } catch (error: unknown) {
    console.error('Error updating file config:', error);
    res.status(500).json({ error: 'Failed to update file configuration' });
    return;
  }
}
