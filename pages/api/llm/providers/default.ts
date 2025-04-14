import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../../lib/auth';

/**
 * API handler for creating a default LLM provider when none exists.
 *
 * This handler supports the following HTTP methods:
 * - `POST`: Creates a new default OpenAI provider if no providers exist.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 *
 * ### POST Method:
 * Creates a new default OpenAI provider with standard models if no providers exist.
 * Requires authentication via a token in the `Authorization` header.
 *
 * #### Request Body:
 * - `apiKey` (string, required): The API key for OpenAI.
 * - `ownerType` (string, optional): The ownership type (system, user, team).
 *
 * #### Response:
 * - `201 Created`: Returns the created provider with API key masked.
 * - `400 Bad Request`: If API key is missing or providers already exist.
 * - `401 Unauthorized`: If authentication fails or the token is invalid.
 * - `403 Forbidden`: If user doesn't have required permissions.
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

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { apiKey, ownerType = 'user' } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: "API key is required" });
  }

  try {
    // Check if any providers already exist
    const existingProvidersCount = await prisma.lLMProvider.count();
    
    if (existingProvidersCount > 0) {
      return res.status(400).json({ error: "Providers already exist in the system" });
    }

    // Set ownership based on owner type
    let createData: any = {
      name: "OpenAI",
      description: "Default OpenAI provider",
      providerType: "openai",
      endpointUrl: "https://api.openai.com/v1",
      isActive: true,
      isDefault: true,
      apiKey,
      config: {},
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
      const teamOwnerId = req.body.teamOwnerId;
      
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

    // Create the default provider
    const provider = await prisma.lLMProvider.create({
      data: createData
    });

    // Create default models for the provider
    const models = await prisma.lLMModel.createMany({
      data: [
        {
          name: "gpt-4",
          displayName: "GPT-4",
          description: "Most powerful general-purpose model for complex tasks",
          modelType: "chat",
          contextWindow: 8192,
          isActive: true,
          isDefault: true,
          providerId: provider.id
        },
        {
          name: "gpt-3.5-turbo",
          displayName: "GPT-3.5 Turbo",
          description: "Fast, economical model for most common tasks",
          modelType: "chat",
          contextWindow: 4096,
          isActive: true,
          isDefault: false,
          providerId: provider.id
        },
        {
          name: "text-embedding-ada-002",
          displayName: "Ada Embeddings",
          description: "Efficient text embedding model",
          modelType: "embedding",
          isActive: true,
          isDefault: true,
          providerId: provider.id
        }
      ]
    });

    // Mask API key in response
    const sanitizedProvider = {
      ...provider,
      apiKey: "********"
    };

    return res.status(201).json({
      provider: sanitizedProvider,
      modelsCreated: models.count
    });
  } catch (error) {
    console.error("Error creating default LLM provider:", error);
    return res.status(500).json({ 
      error: "Failed to create default LLM provider",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
