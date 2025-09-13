import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../../../lib/prisma";
import { parseAuthHeader, verifyToken } from '../../../../../../lib/auth';

/**
 * API handler for managing a specific team's LLM provider.
 *
 * This handler supports the following HTTP methods:
 * - `DELETE`: Removes an LLM provider from a team.
 * - `PUT`: Updates an LLM provider for a team.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Get token from Authorization header
  const token = parseAuthHeader(req.headers.authorization);
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  
  // Verify token
  const payload = await verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  const { id: teamId, providerId } = req.query;
  
  if (!teamId || typeof teamId !== 'string') {
    res.status(400).json({ error: 'Invalid team ID' });
    return;
  }

  if (!providerId || typeof providerId !== 'string') {
    res.status(400).json({ error: 'Invalid provider ID' });
    return;
  }
  
  // Check if the team exists
  const team = await prisma.team.findUnique({
    where: { id: teamId }
  });
  
  if (!team) {
    res.status(404).json({ error: 'Team not found' });
    return;
  }
  
  // Check if the user is a member of this team with appropriate role
  const membership = await prisma.memberTeam.findFirst({
    where: {
      userId: payload.userId,
      teamId,
      leftAt: null, // Only active memberships
      permission: { in: ['owner', 'admin'] } // Only owners and admins can manage providers
    }
  });
  
  const isTeamAdmin = !!membership;
  const isSystemAdmin = payload.permission === 'owner';
  
  if (!isTeamAdmin && !isSystemAdmin) {
    res.status(403).json({ 
      error: 'You do not have permission to manage LLM providers for this team' 
    });
    return;
  }
  
  // Find the provider and check ownership
  const provider = await prisma.lLMProvider.findUnique({
    where: { id: providerId }
  });
  
  if (!provider) {
    res.status(404).json({ error: 'Provider not found' });
    return;
  }
  
  // Only allow management of team-owned providers
  if (provider.ownerType !== 'team' || provider.teamOwnerId !== teamId) {
    res.status(403).json({ 
      error: 'This provider does not belong to this team or cannot be managed by team admins' 
    });
    return;
  }
  
  // Handle PUT - Update provider
  if (req.method === 'PUT') {
    try {
      const {
        name,
        description,
        providerType,
        endpointUrl,
        isActive,
        apiKey,
        config
      } = req.body;
      
      // Update the provider
      const updatedProvider = await prisma.lLMProvider.update({
        where: { id: providerId },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(providerType !== undefined && { providerType }),
          ...(endpointUrl !== undefined && { endpointUrl }),
          ...(isActive !== undefined && { isActive }),
          ...(apiKey !== undefined && apiKey !== '' && { apiKey }),
          ...(config !== undefined && { config }),
        }
      });
      
      // Mask API key in response
      const { apiKey: _, ...sanitizedProvider } = updatedProvider;
      console.log(_);
      
      res.status(200).json(sanitizedProvider);
      return;
    } catch (error: unknown) {
      console.error("Error updating team LLM provider:", error);
      res.status(500).json({ error: "Failed to update team LLM provider" });
      return;
    }
  }
  
  // Handle DELETE - Remove provider from the team
  if (req.method === 'DELETE') {
    try {
      await prisma.lLMProvider.delete({
        where: { id: providerId }
      });
      
      res.status(200).json({ success: true });
      return;
    } catch (error: unknown) {
      console.error("Error deleting team LLM provider:", error);
      res.status(500).json({ error: "Failed to delete team LLM provider" });
      return;
    }
  }
  
  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
  return;
}
