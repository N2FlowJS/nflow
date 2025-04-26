import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@lib/prisma";
import { parseAuthHeader, verifyToken } from '@lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const token = parseAuthHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const payload = verifyToken(token);
      if (!payload) {
        return res.status(401).json({ error: 'Invalid token' });
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
      
      return res.status(200).json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      return res.status(500).json({ error: "Failed to fetch files" });
    }
  }
  
  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
