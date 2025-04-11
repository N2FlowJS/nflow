import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const files = await prisma.file.findMany({
        include: {
          knowledge: {
            select: {
              id: true,
              name: true,
              description: true,
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
