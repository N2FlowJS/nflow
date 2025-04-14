import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../../../lib/auth';

/**
 * API handler for setting an LLM provider as the default.
 *
 * This handler supports the following HTTP methods:
 * - `PUT`: Sets the specified LLM provider as the default.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 *
 * ### PUT Method:
 * Sets the specified LLM provider as the system default.
 * Requires authentication via a token in the `Authorization` header.
 *
 * #### Path Parameters:
 * - `id` (string, required): The ID of the LLM provider to set as default.
 *
 * #### Response:
 * - `200 OK`: Returns the updated provider with API key masked.
 * - `400 Bad Request`: If the provider ID is invalid.
 * - `401 Unauthorized`: If authentication fails or the token is invalid.
 * - `404 Not Found`: If the provider is not found.
 * - `500 Internal Server Error`: If an error occurs while updating the provider.
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

  // Only allow PUT method
  if (req.method === 'PUT') {
    try {
      // First check if the provider exists
      const provider = await prisma.lLMProvider.findUnique({
        where: { id }
      });
      
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }
      
      // Unset any existing default providers
      await prisma.lLMProvider.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
      
      // Set the specified provider as default
      const updatedProvider = await prisma.lLMProvider.update({
        where: { id },
        data: { isDefault: true }
      });
      
      // Mask API key in response
      const sanitizedProvider = {
        ...updatedProvider,
        apiKey: updatedProvider.apiKey ? '********' : null,
      };
      
      return res.status(200).json(sanitizedProvider);
    } catch (error) {
      console.error("Error setting default LLM provider:", error);
      return res.status(500).json({ error: "Failed to set default LLM provider" });
    }
  }
  
  res.setHeader('Allow', ['PUT']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
