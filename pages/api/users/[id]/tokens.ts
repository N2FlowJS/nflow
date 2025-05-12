import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../lib/prisma";
import { randomBytes, createHash } from 'crypto';
import { parseAuthHeader, verifyToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Valid user ID is required" });
  }

  // Verify authentication using token instead of session
  const token = parseAuthHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const payload = await verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid token" });
  }

  // Only allow users to manage their own tokens (or admins)
  if (payload.userId !== id && 
      payload.permission !== 'admin' && 
      payload.permission !== 'owner') {
    return res.status(403).json({ error: "Forbidden: You can only manage your own API tokens" });
  }

  switch (req.method) {
    case 'GET':
      return getUserTokens(res, id);
    case 'POST':
      return createToken(req, res, id);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// Get all tokens for a user
async function getUserTokens(res: NextApiResponse, userId: string) {
  try {
    const tokens = await prisma.apiToken.findMany({
      where: { 
        userId: userId 
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        expiresAt: true,
        lastUsedAt: true,
        status: true,
        // Don't return the actual token value for security
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ tokens });
  } catch (error) {
    console.error("Error fetching user tokens:", error);
    return res.status(500).json({ error: "Error fetching API tokens" });
  }
}

// Create a new token for the user
async function createToken(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { name, description, expiresAt } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Token name is required" });
    }

    // Generate a secure random token
    const tokenValue = randomBytes(32).toString('hex');
    
    // Create hash of the token for storage
    // In a production app, you might want to use a more sophisticated method
    const tokenHash = createHash('sha256').update(tokenValue).digest('hex');

    // Create token in database
    const token = await prisma.apiToken.create({
      data: {
        name,
        description,
        token: tokenHash, // Store the hash, not the actual token
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        status: 'active',
        user: {
          connect: { id: userId }
        }
      }
    });

    // Return the full token only once - after this, it can't be retrieved again
    return res.status(201).json({
      success: true,
      token: {
        id: token.id,
        name: token.name,
        token: tokenValue, // Send the actual token value only once
        description: token.description,
        createdAt: token.createdAt,
        expiresAt: token.expiresAt,
        status: token.status
      }
    });
  } catch (error) {
    console.error("Error creating token:", error);
    return res.status(500).json({ error: "Error creating API token" });
  }
}
