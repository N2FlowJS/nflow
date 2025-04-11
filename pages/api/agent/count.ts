import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { parseAuthHeader, verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Get the token from the request headers
    const token = parseAuthHeader(req.headers.authorization);
    
    // Verify the token
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get the count of all agents in the database
    const count = await prisma.agent.count({
      where: {
        isActive: true,
        userId: payload.userId
      }
    });

    // Return the count
    return res.status(200).json({ count });
  } catch (error) {
    console.error('Error getting agent count:', error);
    return res.status(500).json({ error: 'Failed to get agent count' });
  }
}
