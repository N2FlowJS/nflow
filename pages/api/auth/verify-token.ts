import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../lib/prisma";
import { createHash } from 'crypto';
import { parseAuthHeader } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check if token is passed in body or header
    let token;
    
    // First check Authorization header (for API usage)
    const authToken = parseAuthHeader(req.headers.authorization);
    if (authToken) {
      token = authToken;
    } 
    // Then check body (for testing/direct verification)
    else if (req.body && req.body.token) {
      token = req.body.token;
    }

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    // Hash the provided token to compare with stored hash
    const tokenHash = createHash('sha256').update(token).digest('hex');

    // Find token in database
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
      return res.status(401).json({ valid: false, error: "Invalid token" });
    }

    // Check if token is active
    if (apiToken.status !== 'active') {
      return res.status(401).json({ valid: false, error: "Token has been revoked" });
    }

    // Check if token is expired
    if (apiToken.expiresAt && new Date(apiToken.expiresAt) < new Date()) {
      return res.status(401).json({ valid: false, error: "Token has expired" });
    }

    // Update last used timestamp
    await prisma.apiToken.update({
      where: { id: apiToken.id },
      data: { lastUsedAt: new Date() }
    });

    // Return token verification result
    return res.status(200).json({
      valid: true,
      userId: apiToken.userId,
      user: {
        id: apiToken.user.id,
        name: apiToken.user.name,
        email: apiToken.user.email,
        permission: apiToken.user.permission
      },
      tokenInfo: {
        id: apiToken.id,
        name: apiToken.name,
        lastUsedAt: apiToken.lastUsedAt
      }
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(500).json({ valid: false, error: "Error verifying token" });
  }
}
