import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../../../../../lib/auth';

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

  const { id: teamId, providerId } = req.query;
  
  if (!teamId || typeof teamId !== 'string') {
    res.status(400).json({ error: "Invalid team ID" });
    return;
  }

  if (!providerId || typeof providerId !== 'string') {
    res.status(400).json({ error: "Invalid provider ID" });
    return;
  }

  // Check if the provider exists and belongs to the team
  const provider = await prisma.lLMProvider.findFirst({
    where: { 
      id: providerId,
      teamOwnerId: teamId
    },
  });

  if (!provider) {
    res.status(404).json({ error: "Provider not found or doesn't belong to this team" });
    return;
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
    res.status(403).json({ error: "Not authorized to access this provider's models" });
    return;
  }

  // For modification operations, check if user has admin rights
  if (req.method === 'POST') {
    const hasAdminRights = membership?.permission === 'owner' || 
                          membership?.permission === 'admin' || 
                          isSystemAdmin;
                          
    if (!hasAdminRights) {
      res.status(403).json({ error: "You need admin rights to add models" });
      return;
    }
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
