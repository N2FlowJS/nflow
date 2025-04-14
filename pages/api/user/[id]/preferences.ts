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
      defaultLLMProviderId: true,
      llmPreferences: true,
      defaultLLMProvider: {
        select: {
          id: true,
          name: true,
          providerType: true,
        },
      }
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
                  name: true,
                  providerType: true,
                  isActive: true,
                  ownerType: true,
                  teamOwnerId: true,
                  models: {
                    select: {
                      id: true,
                      name: true,
                      displayName: true,
                      modelType: true,
                      isDefault: true,
                      isActive: true
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
              displayName: true,
              modelType: true,
              isDefault: true,
              isActive: true
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
              displayName: true,
              modelType: true,
              isDefault: true,
              isActive: true
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
      const teamProviders = userTeams.flatMap(membership => 
        membership.team.ownedLLMProviders.filter(provider => provider.isActive)
      );
      
      // Return user preferences along with available providers
      return res.status(200).json({
        defaultLLMProviderId: user.defaultLLMProviderId,
        defaultLLMProvider: user.defaultLLMProvider,
        llmPreferences: user.llmPreferences,
        availableProviders: {
          userProviders,
          teamProviders,
          systemProviders,
          teams: userTeams.map(membership => ({
            teamId: membership.team.id,
            teamName: membership.team.name,
            role: membership.role
          }))
        }
      });
    } catch (error) {
      console.error('Error retrieving user preferences:', error);
      return res.status(500).json({ error: 'Failed to retrieve user preferences' });
    }
  }
  
  // Handle PUT request - Update user preferences
  if (req.method === 'PUT') {
    try {
      const { defaultLLMProviderId, llmPreferences } = req.body;
      
      // If provider ID is supplied, verify it exists and user has access
      if (defaultLLMProviderId) {
        const provider = await prisma.lLMProvider.findUnique({
          where: { id: defaultLLMProviderId },
          include: { teamOwner: true }
        });
        
        if (!provider) {
          return res.status(404).json({ error: 'Provider not found' });
        }
        
        // Check if user has access to this provider
        const hasAccess = await verifyProviderAccess(id, provider);
        
        if (!hasAccess) {
          return res.status(403).json({ 
            error: 'You do not have permission to use this provider'
          });
        }
      }
      
      // Update the user preferences
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          defaultLLMProviderId: defaultLLMProviderId === null ? null : defaultLLMProviderId,
          llmPreferences: llmPreferences || undefined,
        },
        select: {
          id: true,
          defaultLLMProviderId: true,
          llmPreferences: true,
          defaultLLMProvider: {
            select: {
              id: true,
              name: true,
              providerType: true,
            },
          }
        }
      });
      
      return res.status(200).json({
        defaultLLMProviderId: updatedUser.defaultLLMProviderId,
        defaultLLMProvider: updatedUser.defaultLLMProvider,
        llmPreferences: updatedUser.llmPreferences,
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return res.status(500).json({ error: 'Failed to update user preferences' });
    }
  }
  
  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

// Helper function to verify if a user has access to a provider
async function verifyProviderAccess(userId: string, provider: any): Promise<boolean> {
  // System providers are available to everyone
  if (provider.ownerType === 'system') {
    return true;
  }
  
  // User-owned providers are available to their owners
  if (provider.ownerType === 'user' && provider.userOwnerId === userId) {
    return true;
  }
  
  // Team-owned providers require team membership
  if (provider.ownerType === 'team' && provider.teamOwnerId) {
    // Check if user is a member of the team that owns this provider
    const membership = await prisma.memberTeam.findFirst({
      where: {
        userId,
        teamId: provider.teamOwnerId,
        leftAt: null // Only active memberships
      }
    });
    
    return !!membership;
  }
  
  return false;
}
