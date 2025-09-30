import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../../lib/auth';

/**
 * API handler for managing LLM providers.
 *
 * This handler supports the following HTTP methods:
 * - `GET`: Retrieves all LLM providers.
 * - `POST`: Creates a new LLM provider.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 *
 * ### GET Method:
 * Retrieves a list of all LLM providers with their associated models.
 * The response masks API keys for security purposes.
 *
 * #### Response:
 * - `200 OK`: Returns an array of LLM providers with API keys masked.
 * - `401 Unauthorized`: If authentication fails.
 * - `500 Internal Server Error`: If an error occurs while fetching providers.
 *
 * ### POST Method:
 * Creates a new LLM provider. Requires authentication via a token in the `Authorization` header.
 *
 * #### Request Body:
 * - `name` (string, required): The name of the provider.
 * - `description` (string, optional): A description of the provider.
 * - `providerType` (string, required): Type of provider (e.g., "openai", "azure", "custom").
 * - `endpointUrl` (string, required): The API endpoint URL.
 * - `apiKey` (string, optional): API key for the provider.
 * - `config` (object, optional): Additional configuration options.
 *
 * #### Response:
 * - `201 Created`: Returns the created provider with API key masked.
 * - `400 Bad Request`: If required fields are missing.
 * - `401 Unauthorized`: If authentication fails or the token is invalid.
 * - `500 Internal Server Error`: If an error occurs while creating the provider.
 */
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
      
  const teamIds = userTeams.map((t) => t.teamId);
      
      // Build the query to get all providers the user has access to
      const providers = await prisma.lLMProvider.findMany({
        where: {
          OR: [
          
            { 
              ownerType: 'user',
              userOwnerId: payload.userId 
            },
            { 
              ownerType: 'team',
              teamOwnerId: { in: teamIds }
            }
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
      const sanitizedProviders = providers.map((provider) => ({
        ...provider,
        apiKey: provider.apiKey ? '********' : null,
      }));
      
      res.status(200).json(sanitizedProviders);
      return;
    } catch (error: unknown) {
      console.error("Error fetching LLM providers:", error);
      res.status(500).json({ error: "Failed to fetch LLM providers" });
      return;
    }
  } else if (req.method === 'POST') {
    try {
      const {
        name,
        description,
        providerType,
        endpointUrl,
        apiKey,
        config,
        ownerType = 'user',
        teamOwnerId
      } = req.body as Partial<{
        name: string;
        description: string;
        providerType: string;
        endpointUrl: string;
        apiKey: string;
        config: unknown;
        ownerType: 'user' | 'team' | 'system';
        teamOwnerId: string;
      }>;

      // Validate required fields
      if (!name || !providerType || !endpointUrl) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }
      
      // Determine the owner type and verify permissions
      const createData: {
        name: string;
        description?: string;
        providerType: string;
        endpointUrl: string;
        apiKey?: string;
        config: unknown;
        ownerType: 'user' | 'team' | 'system';
        userOwnerId?: string;
        teamOwnerId?: string;
      } = {
        name,
        description,
        providerType,
        endpointUrl,
        apiKey,
        config: config ?? {},
        ownerType,
      };
      
      // If system-owned, verify admin permissions
      if (ownerType === 'system' && payload.permission !== 'owner') {
        res.status(403).json({ 
          error: "You don't have permission to create system-wide providers" 
        });
        return;
      }
      
      // If user-owned, set the user ID
      if (ownerType === 'user') {
        createData.userOwnerId = payload.userId;
      }
      
      // If team-owned, verify team membership and permissions
      if (ownerType === 'team') {
        if (!teamOwnerId) {
          res.status(400).json({ error: "Team ID is required for team-owned providers" });
          return;
        }
        
        // Check if the user is a member of this team with appropriate role
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
          res.status(403).json({ error: "You don't have permission to add providers to this team" });
          return;
        }
        
        createData.teamOwnerId = teamOwnerId;
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
  const { apiKey: _masked, ...sanitizedProvider } = newProvider;
      
      res.status(201).json(sanitizedProvider);
      return;
    } catch (error: unknown) {
      console.error("Error creating LLM provider:", error);
      res.status(500).json({ error: "Failed to create LLM provider" });
      return;
    }
  }
  
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
  return;
}
