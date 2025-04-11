import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getUsers(req, res);
    case 'POST':
      return createUser(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Get all users
async function getUsers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const users = await prisma.user.findMany({
      include: {
        teams: true
      }
    });
    
    return res.status(200).json(users);
  } catch (error) {
    console.error("Request error", error);
    return res.status(500).json({ error: "Error fetching users" });
  }
}

// Create a new user
async function createUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, description, teamIds } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
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
    
    return res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
