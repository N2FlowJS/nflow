import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get token from Authorization header
    const token = parseAuthHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { teams: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user data (excluding password)
    const { password, ...userData } = user;
    res.status(200).json(userData);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
