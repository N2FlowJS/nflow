import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../../lib/auth';

/**
 * API handler for managing user LLM preferences.
 *
 * This handler supports the following HTTP methods:
 * - `GET`: Retrieves the LLM preferences for a user.
 * - `PUT`: Updates the LLM preferences for a user.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
  
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  // Verify the user exists
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
     
    }
  });
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Verify the requester is the same user or has admin permissions
  if (payload.userId !== id && payload.permission !== 'owner') {
    return res.status(403).json({ error: 'Not authorized to access these preferences' });
  }
  
  // Handle GET request - Retrieve user preferences
  if (req.method === 'GET') {
    try {
      // Get user teams to find accessible team providers
      const userTeams = await prisma.memberTeam.findMany({
        where: { 
          userId: id,
          leftAt: null // Only active team memberships
        },
        include: {
          team: {
            include: {
              ownedLLMProviders: {
                select: {
                  id: true,
                  providerType: true,
                  isActive: true,
                  ownerType: true,
                  teamOwnerId: true,
                  models: {
                    select: {
                      id: true,
                      name: true,
                      modelType: true,
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      // Get user-owned providers
      const userProviders = await prisma.lLMProvider.findMany({
        where: {
          userOwnerId: id,
          isActive: true
        },
        include: {
          models: {
            select: {
              id: true,
              name: true,
              modelType: true,
            }
          }
        }
      });
      
      // Get system-wide providers
      const systemProviders = await prisma.lLMProvider.findMany({
        where: {
          ownerType: "system",
          isActive: true
        },
        include: {
          models: {
            select: {
              id: true,
              name: true,
              modelType: true,
            }
          },
          userOwner: {
            select: {
              id: true,
              name: true
            }
          },
          teamOwner: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      
      // Collect all team-owned providers from user's teams
      const teamProviders = userTeams.flatMap((membership: any) => 
        membership.team.ownedLLMProviders.filter((provider: any) => provider.isActive)
      );
      
      // Return user preferences along with available providers
      return res.status(200).json({
        availableProviders: {
          userProviders,
          teamProviders,
          systemProviders,
          teams: userTeams.map((membership: any) => ({
            teamId: membership.team.id,
            teamName: membership.team.name,
            permission: membership.permission
          }))
        }
      });
    } catch (error: unknown) {
      console.error('Error retrieving user preferences:', error);
      return res.status(500).json({ error: 'Failed to retrieve user preferences' });
    }
  }
  

}