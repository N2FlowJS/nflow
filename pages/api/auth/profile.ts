import { NextApiRequest, NextApiResponse } from "next";
import { parseAuthHeader, verifyToken } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Get token from authorization header
    const token = parseAuthHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        authenticated: false,
        message: 'No authentication token provided'
      });
    }
    
    // Verify token and extract user ID using the existing verifyToken function
    const payload = verifyToken(token);
    
    if (!payload || !payload.userId) {
      return res.status(401).json({
        authenticated: false,
        message: 'Invalid or expired authentication token'
      });
    }

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        permission: true
      }
    });

    // If user not found, return unauthorized
    if (!user) {
      return res.status(401).json({
        authenticated: false,
        message: 'User not found'
      });
    }

    // Return user data
    return res.status(200).json({
      authenticated: true,
      userId: user.id,
      name: user.name,
      email: user.email,
      permission: user.permission
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return res.status(500).json({ 
      authenticated: false,
      error: 'Internal server error'
    });
  }
}
