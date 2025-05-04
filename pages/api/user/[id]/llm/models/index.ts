import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../../../../lib/auth';

/**
 * API handler for managing LLM models.
 *
 * This handler supports the following HTTP methods:
 * - `GET`: Retrieves all LLM models.
 * - `POST`: Creates a new LLM model.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 *
 * ### GET Method:
 * Retrieves a list of all LLM models with their associated providers.
 *
 * #### Response:
 * - `200 OK`: Returns an array of LLM models.
 * - `401 Unauthorized`: If authentication fails.
 * - `500 Internal Server Error`: If an error occurs while fetching models.
 *
 * ### POST Method:
 * Creates a new LLM model. Requires authentication via a token in the `Authorization` header.
 *
 * #### Request Body:
 * - `name` (string, required): The name of the model.
 * - `description` (string, optional): A description of the model.
 * - `modelType` (string, required): Type of model (e.g., "chat", "text", "embedding").
 * - `contextWindow` (number, optional): The context window size in tokens.
 * - `config` (object, optional): Additional configuration options.
 * - `providerId` (string, required): ID of the provider that offers this model.
 *
 * #### Response:
 * - `201 Created`: Returns the created model.
 * - `400 Bad Request`: If required fields are missing.
 * - `401 Unauthorized`: If authentication fails or the token is invalid.
 * - `404 Not Found`: If the specified provider does not exist.
 * - `500 Internal Server Error`: If an error occurs while creating the model.
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

  if (req.method === 'GET') {
    try {
      const models = await prisma.lLMModel.findMany({
        include: {
          provider: {
            select: {
              id: true,
              providerType: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return res.status(200).json(models);
    } catch (error: unknown) {
      console.error("Error fetching LLM models:", error);
      return res.status(500).json({ error: "Failed to fetch LLM models" });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        name,
        modelType,
        contextWindow,
        providerId
      } = req.body;

      // Validate required fields
      if (!name || !modelType || !providerId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if provider exists
      const provider = await prisma.lLMProvider.findUnique({
        where: { id: providerId }
      });
      
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }



      // Create new model
      const newModel = await prisma.lLMModel.create({
        data: {
          name,
          modelType,
          contextWindow,
          providerId
        },
        include: {
          provider: {
            select: {
              providerType: true
            }
          }
        }
      });
      
      return res.status(201).json(newModel);
    } catch (error: unknown) {
      console.error("Error creating LLM model:", error);
      return res.status(500).json({ error: "Failed to create LLM model" });
    }
  }
  
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
