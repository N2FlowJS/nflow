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
 * - `isActive` (boolean, optional): Whether the provider is active, defaults to true.
 * - `isDefault` (boolean, optional): Whether the provider is the default, defaults to false.
 * - `apiKey` (string, optional): API key for the provider.
 * - `config` (object, optional): Additional configuration options.
 *
 * #### Response:
 * - `201 Created`: Returns the created provider with API key masked.
 * - `400 Bad Request`: If required fields are missing.
 * - `401 Unauthorized`: If authentication fails or the token is invalid.
 * - `500 Internal Server Error`: If an error occurs while creating the provider.
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
          role: true
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
            // Team providers from teams the user belongs to
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
        
        // Check if the user is a member of this team with appropriate role
        const membership = await prisma.memberTeam.findFirst({
          where: {
            userId: payload.userId,
            teamId: teamOwnerId,
            leftAt: null,
            // Only owners and admins can add providers
            role: { in: ['owner', 'admin'] }
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
