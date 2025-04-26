import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@lib/prisma";
import { parseAuthHeader, verifyToken } from '@lib/auth';

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

  if (req.method === 'GET') {
    try {
      // Get user teams to find accessible team providers
      const userTeams = await prisma.memberTeam.findMany({
        where: { 
          userId: payload.userId,
          leftAt: null // Only active team memberships
        },
        select: {
          teamId: true,
          permission: true
        }
      });
      
      const teamIds = userTeams.map(t => t.teamId);
      
      // Build the query to get all providers the user has access to
      const providers = await prisma.lLMProvider.findMany({
        where: {
          OR: [
            // System providers
            { ownerType: 'system' },
            // User's own providers
            { 
              ownerType: 'user',
              userOwnerId: payload.userId 
            },
           
          ]
        },
        include: {
          models: {
            orderBy: {
              createdAt: 'desc'
            }
          },
          userOwner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          teamOwner: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Mask API keys for security
      const sanitizedProviders = providers.map(provider => ({
        ...provider,
        apiKey: provider.apiKey ? '********' : null,
      }));
      
      return res.status(200).json(sanitizedProviders);
    } catch (error) {
      console.error("Error fetching LLM providers:", error);
      return res.status(500).json({ error: "Failed to fetch LLM providers" });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        name,
        description,
        providerType,
        endpointUrl,
        isActive = true,
        isDefault = false,
        apiKey,
        config,
        ownerType = 'user',
        teamOwnerId
      } = req.body;

      // Validate required fields
      if (!name || !providerType || !endpointUrl) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Determine the owner type and verify permissions
      let createData: any = {
        name,
        description,
        providerType,
        endpointUrl,
        isActive,
        isDefault,
        apiKey,
        config: config || {},
        ownerType
      };
      
      // If system-owned, verify admin permissions
      if (ownerType === 'system' && payload.permission !== 'owner') {
        return res.status(403).json({ 
          error: "You don't have permission to create system-wide providers" 
        });
      }
      
      // If user-owned, set the user ID
      if (ownerType === 'user') {
        createData.userOwnerId = payload.userId;
      }
      
      // If team-owned, verify team membership and permissions
      if (ownerType === 'team') {
        if (!teamOwnerId) {
          return res.status(400).json({ error: "Team ID is required for team-owned providers" });
        }
        
        // Check if the user is a member of this team with appropriate permission
        const membership = await prisma.memberTeam.findFirst({
          where: {
            userId: payload.userId,
            teamId: teamOwnerId,
            leftAt: null,
            // Only owners and admins can add providers
            permission: { in: ['owner', 'admin'] }
          }
        });
        
        if (!membership) {
          return res.status(403).json({ error: "You don't have permission to add providers to this team" });
        }
        
        createData.teamOwnerId = teamOwnerId;
      }

      // If setting as default, unset any existing defaults
      if (isDefault) {
        await prisma.lLMProvider.updateMany({
          where: { isDefault: true },
          data: { isDefault: false }
        });
      }

      // Create new provider
      const newProvider = await prisma.lLMProvider.create({
        data: createData,
        include: {
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

      // Mask API key in response
      const { apiKey: _, ...sanitizedProvider } = newProvider;
      
      return res.status(201).json(sanitizedProvider);
    } catch (error) {
      console.error("Error creating LLM provider:", error);
      return res.status(500).json({ error: "Failed to create LLM provider" });
    }
  }
  
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
