import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../../lib/prisma";
import { isAuthenticated } from "../../../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, userId } = req.query;
  
  if (!id || typeof id !== "string" || !userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Valid team ID and user ID are required" });
  }
  
  switch (req.method) {
    case 'DELETE':
      return removeTeamMember(req, res, id, userId);
    case 'PUT':
      return updateMemberRole(req, res, id, userId);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Remove member from team by marking them as left
async function removeTeamMember(req: NextApiRequest, res: NextApiResponse, teamId: string, userId: string) {
  try {
    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { 
        members: {
          where: {
            userId,
            leftAt: null // Only active members
          }
        }
      }
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check permissions (only admins can remove members)
    const user = await isAuthenticated(req, res);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const currentUserId = user.id;
    const isAdmin = await prisma.memberTeam.findFirst({
      where: {
        teamId,
        userId: currentUserId,
        role: "admin",
        leftAt: null
      }
    });
    
    if (!isAdmin && currentUserId !== userId) {
      return res.status(403).json({ message: "Only team admins can remove other members" });
    }
    
    // Check if user is a member of the team
    const membership = await prisma.memberTeam.findFirst({
      where: {
        teamId,
        userId,
        leftAt: null
      }
    });
    
    if (!membership) {
      return res.status(400).json({ message: 'User is not an active member of this team' });
    }
    
    // Don't allow removal of the last admin
    if (membership.role === "admin") {
      const adminCount = await prisma.memberTeam.count({
        where: {
          teamId,
          role: "admin",
          leftAt: null
        }
      });
      
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot remove the last admin from the team' });
      }
    }
    
    // Mark user as left
    const updatedMembership = await prisma.memberTeam.update({
      where: { id: membership.id },
      data: {
        leftAt: new Date()
      }
    });
    
    // Also disconnect from the legacy relationship
    await prisma.team.update({
      where: { id: teamId },
      data: {
        users: {
          disconnect: { id: userId }
        }
      }
    });
    
    return res.status(200).json(updatedMembership);
  } catch (error) {
    console.error("Request error", error);
    return res.status(500).json({ error: "Error removing team member" });
  }
}

// Update a member's role
async function updateMemberRole(req: NextApiRequest, res: NextApiResponse, teamId: string, userId: string) {
  try {
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }
    
    if (!['owner', 'admin', 'maintainer', 'developer', 'guest'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be owner, admin, maintainer, developer, or guest' });
    }
    
    // Check permissions (only admins can change roles)
    const user = await isAuthenticated(req, res);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const currentUserId = user.id;
    
    // Get current user's role
    const currentUserMembership = await prisma.memberTeam.findFirst({
      where: {
        teamId,
        userId: currentUserId,
        leftAt: null
      }
    });
    
    if (!currentUserMembership || (currentUserMembership.role !== 'owner' && currentUserMembership.role !== 'admin')) {
      return res.status(403).json({ message: "Only team owners and admins can change roles" });
    }
    
    // Check if user is a member of the team
    const membership = await prisma.memberTeam.findFirst({
      where: {
        teamId,
        userId,
        leftAt: null
      }
    });
    
    if (!membership) {
      return res.status(400).json({ message: 'User is not an active member of this team' });
    }
    
    // Don't allow anyone to change owner's role
    if (membership.role === 'owner') {
      return res.status(403).json({ message: 'Cannot change the role of the team owner' });
    }
    
    // Only owner can promote to admin
    if (role === 'admin' && currentUserMembership.role !== 'owner') {
      return res.status(403).json({ message: 'Only team owner can promote members to admin' });
    }
    
    // Don't allow downgrading the last admin
    if (membership.role === "admin" && role !== "admin") {
      const adminCount = await prisma.memberTeam.count({
        where: {
          teamId,
          role: "admin",
          leftAt: null
        }
      });
      
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot change role of the last admin' });
      }
    }
    
    // Update the role
    const updatedMembership = await prisma.memberTeam.update({
      where: { id: membership.id },
      data: { role },
      include: { user: true }
    });
    
    return res.status(200).json(updatedMembership);
  } catch (error) {
    console.error("Request error", error);
    return res.status(500).json({ error: "Error updating member role" });
  }
}
