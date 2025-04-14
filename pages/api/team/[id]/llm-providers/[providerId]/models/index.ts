import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@lib/prisma";
import { parseAuthHeader, verifyToken } from '@lib/auth';

/**
 * API handler for managing models for a specific team's LLM provider.
 *
 * This handler supports the following HTTP methods:
 * - `GET`: Retrieves all models for a specific team provider.
 * - `POST`: Creates a new model for a specific team provider.
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

  const { id: teamId, providerId } = req.query;
  
  if (!teamId || typeof teamId !== 'string') {
    return res.status(400).json({ error: "Invalid team ID" });
  }

  if (!providerId || typeof providerId !== 'string') {
    return res.status(400).json({ error: "Invalid provider ID" });
  }

  // Check if the provider exists and belongs to the team
  const provider = await prisma.lLMProvider.findFirst({
    where: { 
      id: providerId,
      teamOwnerId: teamId
    },
  });

  if (!provider) {
    return res.status(404).json({ error: "Provider not found or doesn't belong to this team" });
  }

  // Check if the user has permission (is member of the team)
  const membership = await prisma.memberTeam.findFirst({
    where: {
      userId: payload.userId,
      teamId,
      leftAt: null, // Only active memberships
    }
  });

  const isTeamMember = !!membership;
  const isSystemAdmin = payload.permission === 'owner';
  
  if (!isTeamMember && !isSystemAdmin) {
    return res.status(403).json({ error: "Not authorized to access this provider's models" });
  }

  // For modification operations, check if user has admin rights
  if (req.method === 'POST') {
    const hasAdminRights = membership?.role === 'owner' || 
                          membership?.role === 'admin' || 
                          isSystemAdmin;
                          
    if (!hasAdminRights) {
      return res.status(403).json({ error: "You need admin rights to add models" });
    }
  }

  // GET - Fetch all models for this provider
  if (req.method === 'GET') {
    try {
      const models = await prisma.lLMModel.findMany({
        where: { providerId },
        orderBy: { createdAt: 'desc' }
      });
      
      return res.status(200).json(models);
    } catch (error) {
      console.error("Error fetching provider models:", error);
      return res.status(500).json({ error: "Failed to fetch provider models" });
    }
  } 
  // POST - Create a new model for this provider
  else if (req.method === 'POST') {
    try {
      const {
        name,
        displayName,
        description,
        modelType,
        contextWindow,
        isActive = true,
        isDefault = false,
        config
      } = req.body;

      // Validate required fields
      if (!name || !modelType) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // If setting as default, unset any existing defaults of the same type
      if (isDefault) {
        await prisma.lLMModel.updateMany({
          where: { 
            providerId,
            modelType, 
            isDefault: true 
          },
          data: { isDefault: false }
        });
      }

      // Create new model
      const newModel = await prisma.lLMModel.create({
        data: {
          name,
          displayName,
          description,
          modelType,
          contextWindow,
          isActive,
          isDefault,
          config: config || {},
          providerId
        }
      });
      
      return res.status(201).json(newModel);
    } catch (error) {
      console.error("Error creating model:", error);
      return res.status(500).json({ error: "Failed to create model" });
    }
  }
  
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
