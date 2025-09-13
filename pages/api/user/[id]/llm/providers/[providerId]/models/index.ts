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

  const { id, providerId } = req.query;
  
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  if (!providerId || typeof providerId !== 'string') {
    res.status(400).json({ error: "Invalid provider ID" });
    return;
  }

  // Check if the user has access to this provider
  const provider = await prisma.lLMProvider.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    res.status(404).json({ error: "Provider not found" });
    return;
  }

  // Verify the requester is the owner of the provider or has admin permissions
  if (provider.userOwnerId !== id || (payload.userId !== id && payload.permission !== 'owner')) {
    res.status(403).json({ error: "Not authorized to access this provider's models" });
    return;
  }

  // GET - Fetch all models for this provider
  if (req.method === 'GET') {
    try {
      const models = await prisma.lLMModel.findMany({
        where: { providerId },
        orderBy: { createdAt: 'desc' }
      });
      
      res.status(200).json(models);
      return;
    } catch (error: unknown) {
      console.error("Error fetching provider models:", error);
      res.status(500).json({ error: "Failed to fetch provider models" });
      return;
    }
  } 
  // POST - Create a new model for this provider
  else if (req.method === 'POST') {
    try {
      const {
        name,
        modelType,
        contextWindow,
      } = req.body;

      // Validate required fields
      if (!name || !modelType) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

     
      // Create new model
      const newModel = await prisma.lLMModel.create({
        data: {
          name,
          modelType,
          contextWindow,
          providerId
        }
      });
      
      res.status(201).json(newModel);
      return;
    } catch (error: unknown) {
      console.error("Error creating model:", error);
      res.status(500).json({ error: "Failed to create model" });
      return;
    }
  }
  
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
  return;
}
