import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../../../lib/auth';

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

  const { id: teamId } = req.query;
  
  if (!teamId || typeof teamId !== 'string') {
    return res.status(400).json({ error: 'Invalid team ID' });
  }
  
  // Check if the team exists
  const team = await prisma.team.findUnique({
    where: { id: teamId }
  });
  
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }
  
  // Check if the user is a member of this team
  const membership = await prisma.memberTeam.findFirst({
    where: {
      userId: payload.userId,
      teamId,
      leftAt: null // Only active memberships
    }
  });
  
  if (!membership && payload.permission !== 'owner') {
    return res.status(403).json({ error: 'You are not a member of this team' });
  }
  
  // Handle GET request - retrieve team's LLM providers
  if (req.method === 'GET') {
    try {
      const providers = await prisma.lLMProvider.findMany({
        where: {
          OR: [
            // Team-specific providers
            { teamOwnerId: teamId },
            // System providers available to all
            { ownerType: 'system' }
          ]
        },
        include: {
          models: {
            select: {
              id: true,
              displayName: true,
              modelType: true,
              isActive: true,
              isDefault: true
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Mask API keys
      const sanitizedProviders = providers.map(provider => ({
        ...provider,
        apiKey: provider.apiKey ? '********' : null
      }));
      
      return res.status(200).json(sanitizedProviders);
    } catch (error) {
      console.error("Error fetching team LLM providers:", error);
      return res.status(500).json({ error: "Failed to fetch team LLM providers" });
    }
  }
  
  // Handle POST request - add a new LLM provider to the team
  if (req.method === 'POST') {
    // Check if user has admin permissions in the team
    if (membership?.role !== 'owner' && membership?.role !== 'admin' && payload.permission !== 'owner') {
      return res.status(403).json({ 
        error: 'You do not have permission to add LLM providers to this team' 
      });
    }
    
    try {
      const {
        name,
        providerType,
        endpointUrl,
        isActive = true,
        apiKey,description,
        config
      } = req.body;
      
      // Validate required fields
      if (!name || !providerType || !endpointUrl) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Create the provider with team ownership
      const newProvider = await prisma.lLMProvider.create({
        data: {
          providerType,
          endpointUrl,
          isActive,
          name,
          description,
          apiKey,
          config: config || {},
          ownerType: 'team',
          teamOwnerId: teamId
        }
      });
      
      // Mask API key in response
      const { apiKey: _, ...sanitizedProvider } = newProvider;
      
      return res.status(201).json(sanitizedProvider);
    } catch (error) {
      console.error("Error creating team LLM provider:", error);
      return res.status(500).json({ error: "Failed to create team LLM provider" });
    }
  }
  
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
