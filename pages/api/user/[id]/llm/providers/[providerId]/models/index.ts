import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../../../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../../../../../../lib/auth';

/**
 * API handler for managing models for a specific user's LLM provider.
 *
 * This handler supports the following HTTP methods:
 * - `GET`: Retrieves all models for a specific provider.
 * - `POST`: Creates a new model for a specific provider.
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

  const { id, providerId } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  if (!providerId || typeof providerId !== 'string') {
    return res.status(400).json({ error: "Invalid provider ID" });
  }

  // Check if the user has access to this provider
  const provider = await prisma.lLMProvider.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    return res.status(404).json({ error: "Provider not found" });
  }

  // Verify the requester is the owner of the provider or has admin permissions
  if (provider.userOwnerId !== id || (payload.userId !== id && payload.permission !== 'owner')) {
    return res.status(403).json({ error: "Not authorized to access this provider's models" });
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
