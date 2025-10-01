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
 * - `description` (string, optional): The updated description.
 * - `modelType` (string, optional): The updated model type.
 * - `contextWindow` (number, optional): The updated context window size.
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

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: "Invalid model ID" });
    return;
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
              providerType: true
            }
          }
        }
      });

      if (!model) {
        console.warn(`LLM model not found: id=${id}`);
        res.status(404).json({ error: `Model not found`, id });
        return;
      }

      res.status(200).json(model);
      return;
    } catch (error: unknown) {
      console.error("Error fetching LLM model:", error);
      res.status(500).json({ error: "Failed to fetch LLM model" });
      return;
    }
  }
  // PUT - Update a specific model
  else if (req.method === 'PUT') {
    try {
      const {
        name,
        description,
        modelType,
        contextWindow,
        config
      } = req.body as Partial<{
        name: string;
        description: string;
        modelType: string;
        contextWindow: number;
        config: unknown;
      }>;

      // Get the current model to check if modelType is changing
      const currentModel = await prisma.lLMModel.findUnique({
        where: { id }
      });

      if (!currentModel) {
        res.status(404).json({ error: "Model not found" });
        return;
      }

      if ((modelType && modelType !== currentModel.modelType)) {
        // The type to use for resetting defaults
        const typeToReset = modelType || currentModel.modelType;

        // Unset any existing defaults of the same type
        await prisma.lLMModel.updateMany({
          where: {
            modelType: typeToReset,
            id: { not: id }
          },
          data: {}
        });
      }

      // Create update data object
      const updateData: {
        name?: string;
        description?: string;
        modelType?: string;
        contextWindow?: number | null;
        config?: unknown;
      } = { name, description, modelType, contextWindow, config };

      // Remove undefined fields
      (Object.keys(updateData) as Array<keyof typeof updateData>).forEach((key) => {
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
              providerType: true
            }
          }
        }
      });

      res.status(200).json(updatedModel);
      return;
    } catch (error: unknown) {
      console.error("Error updating LLM model:", error);
      res.status(500).json({ error: "Failed to update LLM model" });
      return;
    }
  }
  // DELETE - Delete a specific model
  else if (req.method === 'DELETE') {
    try {
      await prisma.lLMModel.delete({
        where: { id }
      });

      res.status(200).json({ success: true });
      return;
    } catch (error: unknown) {
      console.error("Error deleting LLM model:", error);
      res.status(500).json({ error: "Failed to delete LLM model" });
      return;
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
  return;
}
