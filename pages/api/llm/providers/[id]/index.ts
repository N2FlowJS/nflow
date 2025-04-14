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
 * - `isActive` (boolean, optional): Whether the provider is active.
 * - `isDefault` (boolean, optional): Whether the provider is the default.
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
    return res.status(400).json({ error: "Invalid provider ID" });
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
        return res.status(404).json({ error: "Provider not found" });
      }

      // Mask API key for security
      const sanitizedProvider = {
        ...provider,
        apiKey: provider.apiKey ? '********' : null,
      };
      
      return res.status(200).json(sanitizedProvider);
    } catch (error) {
      console.error("Error fetching LLM provider:", error);
      return res.status(500).json({ error: "Failed to fetch LLM provider" });
    }
  } 
  // PUT - Update a specific provider
  else if (req.method === 'PUT') {
    try {
      const {
        name,
        description,
        endpointUrl,
        isActive,
        isDefault,
        apiKey,
        config
      } = req.body;

      // If setting as default, unset any existing defaults
      if (isDefault) {
        await prisma.lLMProvider.updateMany({
          where: { 
            isDefault: true,
            id: { not: id }
          },
          data: { isDefault: false }
        });
      }

      // Create update data object
      let updateData: any = {
        name,
        description,
        endpointUrl,
        isActive,
        isDefault,
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
      
      return res.status(200).json(sanitizedProvider);
    } catch (error) {
      console.error("Error updating LLM provider:", error);
      return res.status(500).json({ error: "Failed to update LLM provider" });
    }
  } 
  // DELETE - Delete a specific provider
  else if (req.method === 'DELETE') {
    try {
      await prisma.lLMProvider.delete({
        where: { id }
      });
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting LLM provider:", error);
      return res.status(500).json({ error: "Failed to delete LLM provider" });
    }
  }
  
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
