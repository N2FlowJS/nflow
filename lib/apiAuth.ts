import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from './prisma';
import { createHash } from 'crypto';

/**
 * Middleware to authenticate API requests using tokens
 * 
 * @param req - The Next.js API request
 * @param res - The Next.js API response
 * @returns The user if authenticated, null otherwise
 */
export async function authenticateApiRequest(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return null;
    }
    
    // Hash the token for comparison
    const tokenHash = createHash('sha256').update(token).digest('hex');
    
    // Find the token in the database
    const apiToken = await prisma.apiToken.findUnique({
      where: { token: tokenHash },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            permission: true
          }
        }
      }
    });
    
    if (!apiToken) {
      return null;
    }
    
    // Check if token is active
    if (apiToken.status !== 'active') {
      return null;
    }
    
    // Check if token is expired
    if (apiToken.expiresAt && new Date(apiToken.expiresAt) < new Date()) {
      return null;
    }
    
    // Update last used timestamp
    await prisma.apiToken.update({
      where: { id: apiToken.id },
      data: { lastUsedAt: new Date() }
    });
    
    // Return the user information
    return apiToken.user;
  } catch (error) {
    console.error('API Authentication error:', error);
    return null;
  }
}

/**
 * Higher-order function that wraps an API handler with token authentication
 * 
 * @param handler - The API route handler function
 * @returns A new handler function with authentication
 */
export function withApiAuth(
  handler: (
    req: NextApiRequest, 
    res: NextApiResponse, 
    user: any
  ) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = await authenticateApiRequest(req, res);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired API token' });
    }
    
    // Call the original handler with the authenticated user
    return handler(req, res, user);
  };
}
