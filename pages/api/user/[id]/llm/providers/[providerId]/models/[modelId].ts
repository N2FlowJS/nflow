import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../../../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../../../../../../lib/auth';

/**
 * API handler for managing a specific model of a user's LLM provider.
 *
 * This handler supports the following HTTP methods:
 * - `GET`: Retrieves a specific model.
 * - `PUT`: Updates a specific model.
 * - `DELETE`: Deletes a specific model.
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

  const { id, providerId, modelId } = req.query;
  
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  if (!providerId || typeof providerId !== 'string') {
    res.status(400).json({ error: "Invalid provider ID" });
    return;
  }

  if (!modelId || typeof modelId !== 'string') {
    res.status(400).json({ error: "Invalid model ID" });
    return;
  }

  // Check if the model exists and belongs to the specified provider
  const model = await prisma.lLMModel.findFirst({
    where: { 
      id: modelId,
      providerId 
    },
    include: {
      provider: true
    }
  });

  if (!model) {
    console.warn(`User model not found: userId=${id} providerId=${providerId} modelId=${modelId}`);
    res.status(404).json({ error: "Model not found", id: modelId });
    return;
  }

  // Verify the requester is the owner of the provider or has admin permissions
  if (model.provider.userOwnerId !== id || (payload.userId !== id && payload.permission !== 'owner')) {
    res.status(403).json({ error: "Not authorized to manage this model" });
    return;
  }

  // GET - Fetch the specific model
  if (req.method === 'GET') {
    res.status(200).json(model);
    return;
  } 
  // PUT - Update the specific model
  else if (req.method === 'PUT') {
    try {
      const {
        name,
        description,
        modelType,
        contextWindow,

        config
      } = req.body;



      // Create update data object
      const updateData: any = {
        name,
        description,
        modelType,
        contextWindow,
        config
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      // Update model
      const updatedModel = await prisma.lLMModel.update({
        where: { id: modelId },
        data: updateData
      });
      
      res.status(200).json(updatedModel);
      return;
    } catch (error: unknown) {
      console.error("Error updating model:", error);
      res.status(500).json({ error: "Failed to update model" });
      return;
    }
  } 
  // DELETE - Delete the specific model
  else if (req.method === 'DELETE') {
    try {
      await prisma.lLMModel.delete({
        where: { id: modelId }
      });
      
      res.status(200).json({ success: true });
      return;
    } catch (error: unknown) {
      console.error("Error deleting model:", error);
      res.status(500).json({ error: "Failed to delete model" });
      return;
    }
  }
  
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
  return;
}
