import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "Valid token ID is required" });
    return;
  }

  // Only allow PUT method
  if (req.method !== 'PUT') {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Verify authentication using token
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

  try {
    // First, find the token to check ownership
    const apiToken = await prisma.apiToken.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!apiToken) {
      res.status(404).json({ error: "Token not found" });
      return;
    }

    // Only token owner or admin can revoke tokens
    if (apiToken.userId !== payload.userId && 
        payload.permission !== 'admin' && 
        payload.permission !== 'owner') {
      res.status(403).json({ error: "Forbidden: You can only revoke your own tokens" });
      return;
    }

    // Revoke token (don't delete, just mark as revoked)
    await prisma.apiToken.update({
      where: { id },
      data: {
        status: 'revoked'
      }
    });

    res.status(200).json({ success: true });
    return;
  } catch (error) {
    console.error("Error revoking token:", error);
    res.status(500).json({ error: "Error revoking API token" });
    return;
  }
}
