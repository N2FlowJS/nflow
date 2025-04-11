import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const knowledgeItems = await prisma.knowledge.findMany({
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              code: true
            }
          },
          users: {
            select: {
              id: true,
              name: true
            }
          },
          teams: {
            select: {
              id: true,
              name: true
            }
          },
          files: true
        }
      });
      
      return res.status(200).json(knowledgeItems);
    } catch (error) {
      console.error("Request error", error);
      return res.status(500).json({ error: "Error fetching knowledge" });
    }
  }
  
  if (req.method === 'POST') {
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
      
      const { name, description, userIds, teamIds } = req.body;
      
      if (!name || !description) {
        return res.status(400).json({ error: 'Name and description are required' });
      }
      
      // Create knowledge with authenticated user as creator
      const knowledge = await prisma.knowledge.create({
        data: {
          name,
          description,
          // Associate with creator
          createdBy: {
            connect: { id: payload.userId }
          },
          // Associate with specified users if any
          ...(userIds && userIds.length > 0 && {
            users: {
              connect: userIds.map((id: string) => ({ id }))
            }
          }),
          // Associate with specified teams if any
          ...(teamIds && teamIds.length > 0 && {
            teams: {
              connect: teamIds.map((id: string) => ({ id }))
            }
          })
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              code: true
            }
          },
          users: true,
          teams: true
        }
      });
      
      return res.status(201).json(knowledge);
    } catch (error) {
      console.error('Error creating knowledge:', error);
      return res.status(500).json({ error: 'Error creating knowledge' });
    }
  }
  
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
