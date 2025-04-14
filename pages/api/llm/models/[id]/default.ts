import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../../../lib/auth';

/**
 * API handler for setting an LLM model as the default for its type.
 *
 * This handler supports the following HTTP methods:
 * - `PUT`: Sets the specified LLM model as the default for its type.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 *
 * ### PUT Method:
 * Sets the specified LLM model as the default for its model type.
 * Requires authentication via a token in the `Authorization` header.
 *
 * #### Path Parameters:
 * - `id` (string, required): The ID of the LLM model to set as default.
 *
 * #### Response:
 * - `200 OK`: Returns the updated model with provider information.
 * - `400 Bad Request`: If the model ID is invalid.
 * - `401 Unauthorized`: If authentication fails or the token is invalid.
 * - `404 Not Found`: If the model is not found.
 * - `500 Internal Server Error`: If an error occurs while updating the model.
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

  // Only allow PUT method
  if (req.method === 'PUT') {
    try {
      // First check if the model exists
      const model = await prisma.lLMModel.findUnique({
        where: { id }
      });
      
      if (!model) {
        return res.status(404).json({ error: "Model not found" });
      }
      
      // Unset any existing default models of the same type
      await prisma.lLMModel.updateMany({
        where: { 
          modelType: model.modelType,
          isDefault: true 
        },
        data: { isDefault: false }
      });
      
      // Set the specified model as default
      const updatedModel = await prisma.lLMModel.update({
        where: { id },
        data: { isDefault: true },
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
      console.error("Error setting default LLM model:", error);
      return res.status(500).json({ error: "Failed to set default LLM model" });
    }
  }
  
  res.setHeader('Allow', ['PUT']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
