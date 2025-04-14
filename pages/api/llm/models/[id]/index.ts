import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../../../lib/auth';

/**
 * API handler for managing specific LLM models.
 *
 * This handler supports the following HTTP methods:
 * - `GET`: Retrieves a specific LLM model.
 * - `PUT`: Updates a specific LLM model.
 * - `DELETE`: Deletes a specific LLM model.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 *
 * ### GET Method:
 * Retrieves details of a specific LLM model, including its provider information.
 *
 * #### Path Parameters:
 * - `id` (string, required): The ID of the LLM model.
 *
 * #### Response:
 * - `200 OK`: Returns the model with provider information.
 * - `400 Bad Request`: If the model ID is invalid.
 * - `401 Unauthorized`: If authentication fails.
 * - `404 Not Found`: If the model is not found.
 * - `500 Internal Server Error`: If an error occurs while fetching the model.
 *
 * ### PUT Method:
 * Updates a specific LLM model.
 *
 * #### Path Parameters:
 * - `id` (string, required): The ID of the LLM model to update.
 *
 * #### Request Body:
 * - `name` (string, optional): The updated name.
 * - `displayName` (string, optional): The updated display name.
 * - `description` (string, optional): The updated description.
 * - `modelType` (string, optional): The updated model type.
 * - `contextWindow` (number, optional): The updated context window size.
 * - `isActive` (boolean, optional): Whether the model is active.
 * - `isDefault` (boolean, optional): Whether the model is the default for its type.
 * - `config` (object, optional): Updated configuration options.
 *
 * #### Response:
 * - `200 OK`: Returns the updated model with provider information.
 * - `400 Bad Request`: If the model ID is invalid.
 * - `401 Unauthorized`: If authentication fails.
 * - `404 Not Found`: If the model is not found.
 * - `500 Internal Server Error`: If an error occurs while updating the model.
 *
 * ### DELETE Method:
 * Deletes a specific LLM model.
 *
 * #### Path Parameters:
 * - `id` (string, required): The ID of the LLM model to delete.
 *
 * #### Response:
 * - `200 OK`: Returns a success message.
 * - `400 Bad Request`: If the model ID is invalid.
 * - `401 Unauthorized`: If authentication fails.
 * - `404 Not Found`: If the model is not found.
 * - `500 Internal Server Error`: If an error occurs while deleting the model.
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

  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: "Invalid model ID" });
  }

  // GET - Fetch a specific model
  if (req.method === 'GET') {
    try {
      const model = await prisma.lLMModel.findUnique({
        where: { id },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              providerType: true
            }
          }
        }
      });
      
      if (!model) {
        return res.status(404).json({ error: "Model not found" });
      }
      
      return res.status(200).json(model);
    } catch (error) {
      console.error("Error fetching LLM model:", error);
      return res.status(500).json({ error: "Failed to fetch LLM model" });
    }
  } 
  // PUT - Update a specific model
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

      // Get the current model to check if modelType is changing
      const currentModel = await prisma.lLMModel.findUnique({
        where: { id }
      });
      
      if (!currentModel) {
        return res.status(404).json({ error: "Model not found" });
      }

      // If setting as default or changing model type + is already default
      if (isDefault || (modelType && modelType !== currentModel.modelType && currentModel.isDefault)) {
        // The type to use for resetting defaults
        const typeToReset = modelType || currentModel.modelType;
        
        // Unset any existing defaults of the same type
        await prisma.lLMModel.updateMany({
          where: { 
            modelType: typeToReset, 
            isDefault: true,
            id: { not: id }
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
        where: { id },
        data: updateData,
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              providerType: true
            }
          }
        }
      });
      
      return res.status(200).json(updatedModel);
    } catch (error) {
      console.error("Error updating LLM model:", error);
      return res.status(500).json({ error: "Failed to update LLM model" });
    }
  } 
  // DELETE - Delete a specific model
  else if (req.method === 'DELETE') {
    try {
      await prisma.lLMModel.delete({
        where: { id }
      });
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting LLM model:", error);
      return res.status(500).json({ error: "Failed to delete LLM model" });
    }
  }
  
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
