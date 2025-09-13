import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../../../lib/auth';

/**
 * API handler for managing specific LLM providers.
 *
 * This handler supports the following HTTP methods:
 * - `GET`: Retrieves a specific LLM provider.
 * - `PUT`: Updates a specific LLM provider.
 * - `DELETE`: Deletes a specific LLM provider.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 *
 * ### GET Method:
 * Retrieves details of a specific LLM provider, including its models.
 *
 * #### Path Parameters:
 * - `id` (string, required): The ID of the LLM provider.
 *
 * #### Response:
 * - `200 OK`: Returns the provider with API key masked.
 * - `400 Bad Request`: If the provider ID is invalid.
 * - `401 Unauthorized`: If authentication fails.
 * - `404 Not Found`: If the provider is not found.
 * - `500 Internal Server Error`: If an error occurs while fetching the provider.
 *
 * ### PUT Method:
 * Updates a specific LLM provider.
 *
 * #### Path Parameters:
 * - `id` (string, required): The ID of the LLM provider to update.
 *
 * #### Request Body:
 * - `name` (string, optional): The updated name.
 * - `description` (string, optional): The updated description.
 * - `endpointUrl` (string, optional): The updated API endpoint URL.
 * - `apiKey` (string, optional): Updated API key (only if provided).
 * - `config` (object, optional): Updated configuration options.
 *
 * #### Response:
 * - `200 OK`: Returns the updated provider with API key masked.
 * - `400 Bad Request`: If the provider ID is invalid.
 * - `401 Unauthorized`: If authentication fails.
 * - `404 Not Found`: If the provider is not found.
 * - `500 Internal Server Error`: If an error occurs while updating the provider.
 *
 * ### DELETE Method:
 * Deletes a specific LLM provider.
 *
 * #### Path Parameters:
 * - `id` (string, required): The ID of the LLM provider to delete.
 *
 * #### Response:
 * - `200 OK`: Returns a success message.
 * - `400 Bad Request`: If the provider ID is invalid.
 * - `401 Unauthorized`: If authentication fails.
 * - `404 Not Found`: If the provider is not found.
 * - `500 Internal Server Error`: If an error occurs while deleting the provider.
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
    res.status(400).json({ error: "Invalid provider ID" });
    return;
  }

  // GET - Fetch a specific provider
  if (req.method === 'GET') {
    try {
      const provider = await prisma.lLMProvider.findUnique({
        where: { id },
        include: {
          models: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });
      
      if (!provider) {
        res.status(404).json({ error: "Provider not found" });
        return;
      }

      // Mask API key for security
      const sanitizedProvider = {
        ...provider,
        apiKey: provider.apiKey ? '********' : null,
      };
      
      res.status(200).json(sanitizedProvider);
      return;
    } catch (error: unknown) {
      console.error("Error fetching LLM provider:", error);
      res.status(500).json({ error: "Failed to fetch LLM provider" });
      return;
    }
  } 
  // PUT - Update a specific provider
  else if (req.method === 'PUT') {
    try {
      const {
        name,
        description,
        endpointUrl,
        apiKey,
        config
      } = req.body;

  

      // Create update data object
      const updateData: any = {
        name,
        description,
        endpointUrl,
        config
      };

      // Only update API key if provided
      if (apiKey) {
        updateData.apiKey = apiKey;
      }

      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      // Update provider
      const updatedProvider = await prisma.lLMProvider.update({
        where: { id },
        data: updateData
      });

      // Mask API key in response
      const sanitizedProvider = {
        ...updatedProvider,
        apiKey: updatedProvider.apiKey ? '********' : null,
      };
      
      res.status(200).json(sanitizedProvider);
      return;
    } catch (error: unknown) {
      console.error("Error updating LLM provider:", error);
      res.status(500).json({ error: "Failed to update LLM provider" });
      return;
    }
  } 
  // DELETE - Delete a specific provider
  else if (req.method === 'DELETE') {
    try {
      await prisma.lLMProvider.delete({
        where: { id }
      });
      
      res.status(200).json({ success: true });
      return;
    } catch (error: unknown) {
      console.error("Error deleting LLM provider:", error);
      res.status(500).json({ error: "Failed to delete LLM provider" });
      return;
    }
  }
  
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
  return;
}
