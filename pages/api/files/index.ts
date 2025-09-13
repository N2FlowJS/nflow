import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === 'GET') {
    try {
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

      const files = await prisma.file.findMany({
        where: {
          knowledge: {
            OR: [
              { userId: payload.userId },
              { users: { some: { id: payload.userId } } },
              { teams: { some: { members: { some: { userId: payload.userId } } } } }
            ]
          }
        },
        include: {
          knowledge: {
            select: {
              id: true,
              name: true,
              description: true,
              userId: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.status(200).json(files);
      return;
    } catch (error: unknown) {
      console.error("Error fetching files:", error);
      res.status(500).json({ error: "Failed to fetch files" });
      return;
    }
  }
  
  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
  return;
}
