import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Valid agent ID is required" });
  }
  
  // Only allow GET requests for flow configuration
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get the token from authorization header if available
    const token = parseAuthHeader(req.headers.authorization);
    let userId = null;
    
    // Verify the token if it exists
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        userId = payload.userId;
      }
    }
    
    // Fetch the agent with minimal fields needed
    const agent = await prisma.agent.findUnique({
      where: { id },
      select: {
        id: true,
        flowConfig: true,
        userId: true,
        teamId: true,
        ownerType: true,
      }
    });
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // If we have a logged-in user, check permissions
    if (userId) {
      // If user-owned agent, check if current user is the owner
      if (agent.ownerType === 'user' && agent.userId !== userId) {
        return res.status(403).json({ error: 'You do not have permission to access this agent' });
      }
      
      // If team-owned agent, check if user is a team member
      if (agent.ownerType === 'team' && agent.teamId) {
        const isMember = await prisma.memberTeam.findFirst({
          where: {
            userId,
            teamId: agent.teamId,
            leftAt: null // Only active memberships
          }
        });
        
        if (!isMember) {
          return res.status(403).json({ error: 'You do not have permission to access this agent' });
        }
      }
    }
    
    // Return the flow configuration (with a default if it's null)
    return res.status(200).json({ 
      flowConfig: agent.flowConfig || '{"nodes":[],"edges":[]}'
    });
    
  } catch (error) {
    console.error('Error fetching agent flow configuration:', error);
    return res.status(500).json({ error: 'Failed to retrieve flow configuration' });
  }
}
