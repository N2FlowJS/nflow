import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Get token from Authorization header
  const token = parseAuthHeader(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // Verify token
  const payload = await verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  const { id: teamId } = req.query;

  if (!teamId || typeof teamId !== 'string') {
    res.status(400).json({ error: 'Invalid team ID' });
    return;
  }

  // Check if the team exists
  const team = await prisma.team.findUnique({
    where: { id: teamId }
  });

  if (!team) {
    res.status(404).json({ error: 'Team not found' });
    return;
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
    res.status(403).json({ error: 'You are not a member of this team' });
    return;
  }

  // Handle GET request - retrieve team's LLM providers
  if (req.method === 'GET') {
    try {
      const providers = await prisma.lLMProvider.findMany({
        where: {
          OR: [
            // Team-specific providers
            { teamOwnerId: teamId },

          ]
        },
        include: {
          models: {
            select: {
              id: true,
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Mask API keys
      const sanitizedProviders = providers.map((provider: any) => ({
        ...provider,
        apiKey: provider.apiKey ? '********' : null
      }));

      res.status(200).json(sanitizedProviders);
      return;
    } catch (error: unknown) {
      console.error("Error fetching team LLM providers:", error);
      res.status(500).json({ error: "Failed to fetch team LLM providers" });
      return;
    }
  }

  // Handle POST request - add a new LLM provider to the team
  if (req.method === 'POST') {
    // Check if user has admin permissions in the team
    if (membership?.permission !== 'owner' && membership?.permission !== 'admin' && payload.permission !== 'owner') {
      res.status(403).json({
        error: 'You do not have permission to add LLM providers to this team'
      });
      return;
    }

    try {
      const {
        providerType,
        endpointUrl,
        apiKey,
      } = req.body;

      // Validate required fields
      if ( !providerType || !endpointUrl) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      // Create the provider with team ownership
      const newProvider = await prisma.lLMProvider.create({
        data: {
          providerType,
          endpointUrl,
          apiKey,
          ownerType: 'team',
          teamOwnerId: teamId
        }
      });

      // Mask API key in response
      const { apiKey: _, ...sanitizedProvider } = newProvider;
      console.log(_);

      res.status(201).json(sanitizedProvider);
      return;
    } catch (error: unknown) {
      console.error("Error creating team LLM provider:", error);
      res.status(500).json({ error: "Failed to create team LLM provider" });
      return;
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
  return;
}
