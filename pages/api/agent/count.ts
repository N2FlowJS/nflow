import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { parseAuthHeader, verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    // Get the token from the request headers
    const token = parseAuthHeader(req.headers.authorization);
    
    // Verify the token
    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const payload = await verifyToken(token);
    if (!payload) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Get the count of all agents in the database
    const count = await prisma.agent.count({
      where: {
        isActive: true,
        userId: payload.userId
      }
    });

    // Return the count
    res.status(200).json({ count });
    return;
  } catch (error: unknown) {
    console.error('Error getting agent count:', error);
    res.status(500).json({ error: 'Failed to get agent count' });
    return;
  }
}
