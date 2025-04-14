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

  const { id, providerId, modelId } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  if (!providerId || typeof providerId !== 'string') {
    return res.status(400).json({ error: "Invalid provider ID" });
  }

  if (!modelId || typeof modelId !== 'string') {
    return res.status(400).json({ error: "Invalid model ID" });
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
    return res.status(404).json({ error: "Model not found" });
  }

  // Verify the requester is the owner of the provider or has admin permissions
  if (model.provider.userOwnerId !== id || (payload.userId !== id && payload.permission !== 'owner')) {
    return res.status(403).json({ error: "Not authorized to manage this model" });
  }

  // GET - Fetch the specific model
  if (req.method === 'GET') {
    return res.status(200).json(model);
  } 
  // PUT - Update the specific model
  else if (req.method === 'PUT') {
    try {
      const {
        name,
        displayName,
        description,
        modelType,
        contextWindow,
        isActive,
        isDefault,
        config
      } = req.body;

      // If setting as default or changing model type + is already default
      if (isDefault || (modelType && modelType !== model.modelType && model.isDefault)) {
        // The type to use for resetting defaults
        const typeToReset = modelType || model.modelType;
        
        // Unset any existing defaults of the same type
        await prisma.lLMModel.updateMany({
          where: { 
            providerId,
            modelType: typeToReset, 
            isDefault: true,
            id: { not: modelId }
          },
          data: { isDefault: false }
        });
      }

      // Create update data object
      const updateData: any = {
        name,
        displayName,
        description,
        modelType,
        contextWindow,
        isActive,
        isDefault,
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
      
      return res.status(200).json(updatedModel);
    } catch (error) {
      console.error("Error updating model:", error);
      return res.status(500).json({ error: "Failed to update model" });
    }
  } 
  // DELETE - Delete the specific model
  else if (req.method === 'DELETE') {
    try {
      await prisma.lLMModel.delete({
        where: { id: modelId }
      });
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting model:", error);
      return res.status(500).json({ error: "Failed to delete model" });
    }
  }
  
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
