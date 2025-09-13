import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../lib/prisma";
import { randomBytes, createHash } from 'crypto';
import { parseAuthHeader, verifyToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "Valid user ID is required" });
    return;
  }

  // Verify authentication using token instead of session
  const token = parseAuthHeader(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  
  const payload = await verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  // Only allow users to manage their own tokens (or admins)
  if (payload.userId !== id && 
      payload.permission !== 'admin' && 
      payload.permission !== 'owner') {
    res.status(403).json({ error: "Forbidden: You can only manage your own API tokens" });
    return;
  }

  switch (req.method) {
    case 'GET':
      await getUserTokens(res, id);
      return;
    case 'POST':
      await createToken(req, res, id);
      return;
    default:
      res.status(405).json({ error: "Method not allowed" });
      return;
  }
}

// Get all tokens for a user
async function getUserTokens(res: NextApiResponse, userId: string): Promise<void> {
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

    res.status(200).json({ tokens });
    return;
  } catch (error) {
    console.error("Error fetching user tokens:", error);
    res.status(500).json({ error: "Error fetching API tokens" });
    return;
  }
}

// Create a new token for the user
async function createToken(req: NextApiRequest, res: NextApiResponse, userId: string): Promise<void> {
  try {
    const { name, description, expiresAt } = req.body;

    if (!name) {
      res.status(400).json({ error: "Token name is required" });
      return;
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
    res.status(201).json({
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
    return;
  } catch (error) {
    console.error("Error creating token:", error);
    res.status(500).json({ error: "Error creating API token" });
    return;
  }
}
