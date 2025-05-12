import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Valid token ID is required" });
  }

  // Only allow PUT method
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify authentication using token
  const token = parseAuthHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    // First, find the token to check ownership
    const apiToken = await prisma.apiToken.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!apiToken) {
      return res.status(404).json({ error: "Token not found" });
    }

    // Only token owner or admin can revoke tokens
    if (apiToken.userId !== payload.userId && 
        payload.permission !== 'admin' && 
        payload.permission !== 'owner') {
      return res.status(403).json({ error: "Forbidden: You can only revoke your own tokens" });
    }

    // Revoke token (don't delete, just mark as revoked)
    await prisma.apiToken.update({
      where: { id },
      data: {
        status: 'revoked'
      }
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error revoking token:", error);
    return res.status(500).json({ error: "Error revoking API token" });
  }
}
