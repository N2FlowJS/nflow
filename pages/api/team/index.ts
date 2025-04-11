import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../lib/prisma";
import { isAuthenticated, parseAuthHeader, verifyToken } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getTeams(req, res);
    case 'POST':
      return createTeam(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Get all teams
async function getTeams(req: NextApiRequest, res: NextApiResponse) {
  try {
    const teams = await prisma.team.findMany({
      include: {
        users: true,
        createdBy: {
          select: {
            id: true,
            name: true
          }
        },
        members: {
          where: {
            leftAt: null
          },
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
    
    return res.status(200).json(teams);
  } catch (error) {
    console.error("Request error", error);
    return res.status(500).json({ error: "Error fetching teams" });
  }
}

// Create a new team
async function createTeam(req: NextApiRequest, res: NextApiResponse) {
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
       
    
       const { name, description, userIds } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }
    
    // Create team with creator
    const team = await prisma.team.create({
      data: {
        name,
        description,
        createdById: payload.userId,
        // Add the creator as an owner instead of admin
        members: {
          create: {
            userId: payload.userId,
            role: "owner",
          }
        },
        // Add other users if specified
        ...(userIds && userIds.length > 0 && {
          users: {
            connect: userIds.map((id: string) => ({ id }))
          }
        })
      },
      include: {
        users: true,
        members: {
          include: {
            user: true
          }
        },
        createdBy: true
      }
    });
    
    return res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
