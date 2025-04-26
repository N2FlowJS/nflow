import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@lib/prisma";
import { parseAuthHeader, verifyToken } from '@lib/auth';

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

    // Get token from Authorization header
    const token = parseAuthHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }
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


    const currentUserId = payload.userId;
    const isAdmin = await prisma.memberTeam.findFirst({
      where: {
        teamId,
        userId: currentUserId,
        permission: {
          in: ["owner", "admin", "maintainer"]
        },
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
    if (membership.permission === "admin") {
      const adminCount = await prisma.memberTeam.count({
        where: {
          teamId,
          permission: "admin",
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
    const { permission } = req.body;
    // Get token from Authorization header
    const token = parseAuthHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (!permission) {
      return res.status(400).json({ message: 'permission is required' });
    }

    if (!['owner', 'admin', 'maintainer', 'developer', 'guest'].includes(permission)) {
      return res.status(400).json({ message: 'Invalid role. Must be owner, admin, maintainer, developer, or guest' });
    }



    const currentUserId = payload.userId;

    // Get current user's role
    const currentUserMembership = await prisma.memberTeam.findFirst({
      where: {
        teamId,
        userId: currentUserId,
        leftAt: null
      }
    });

    if (!currentUserMembership || (currentUserMembership.permission !== 'owner' && currentUserMembership.permission !== 'admin')) {
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
    if (membership.permission === 'owner') {
      return res.status(403).json({ message: 'Cannot change the role of the team owner' });
    }

    // Only owner can promote to admin
    if (permission === 'admin' && currentUserMembership.permission !== 'owner') {
      return res.status(403).json({ message: 'Only team owner can promote members to admin' });
    }

    // Don't allow downgrading the last admin
    if (membership.permission === "admin" && permission !== "admin") {
      const adminCount = await prisma.memberTeam.count({
        where: {
          teamId,
          permission: "admin",
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
      data: { permission },
      include: { user: true }
    });

    return res.status(200).json(updatedMembership);
  } catch (error) {
    console.error("Request error", error);
    return res.status(500).json({ error: "Error updating member role" });
  }
}
