import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  switch (req.method) {
    case 'GET':
      await getUsers(req, res);
      return;
    case 'POST':
      await createUser(req, res);
      return;
    default:
      res.status(405).json({ message: 'Method not allowed' });
      return;
  }
}

// Get all users
async function getUsers(req: NextApiRequest, res: NextApiResponse): Promise<void> {
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
    const users = await prisma.user.findMany({
      include: {
        teams: true
      }
    });
    
    res.status(200).json(users);
    return;
  } catch (error: unknown) {
    console.error("Request error", error);
    res.status(500).json({ error: "Error fetching users" });
    return;
  }
}

// Create a new user
async function createUser(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    const { name, description, teamIds } = req.body;
    
    if (!name || !description) {
      res.status(400).json({ message: 'Name and description are required' });
      return;
    }
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
    const userData = {
      name,
      description,
      ...(teamIds && teamIds.length > 0 && {
        teams: {
          connect: teamIds.map((id: string) => ({ id }))
        }
      })
    };
    
    const user = await prisma.user.create({
      data: userData,
      include: {
        teams: true
      }
    });
    
    res.status(201).json(user);
    return;
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
}
