import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "../../../../lib/prisma";
import { isAuthenticated } from "../../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Valid team ID is required" });
  }
  
  switch (req.method) {
    case 'GET':
      return getTeamMembers(req, res, id);
    case 'POST':
      return addTeamMembers(req, res, id);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Get team members with their roles
async function getTeamMembers(req: NextApiRequest, res: NextApiResponse, teamId: string) {
  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { 
        members: {
          where: {
            leftAt: null // Only active members
          },
          include: {
            user: true
          }
        }
      }
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    return res.status(200).json(team.members);
  } catch (error) {
    console.error("Request error", error);
    return res.status(500).json({ error: "Error fetching team members" });
  }
}

// Add members to team with specified roles
async function addTeamMembers(req: NextApiRequest, res: NextApiResponse, teamId: string) {
  try {
    const { members } = req.body;
    
    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: 'Members data is required' });
    }
    
    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if current user has permission (is admin of the team)
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
    
    if (!isAdmin) {
      return res.status(403).json({ message: "Only team admins can add members" });
    }
    
    // Process each member to add
    const membershipData = members.map((member: { userId: string, role: string }) => ({
      userId: member.userId,
      role: member.role || 'guest', // Default to guest if role not specified
    }));
    
    // Add members to team with their roles
    const results = await Promise.all(
      membershipData.map(async (member) => {
        // Check if user is already a member
        const existingMembership = await prisma.memberTeam.findFirst({
          where: {
            teamId,
            userId: member.userId,
          }
        });
        
        if (existingMembership) {
          if (existingMembership.leftAt) {
            // Reactivate former member
            return prisma.memberTeam.update({
              where: { id: existingMembership.id },
              data: {
                leftAt: null,
                role: member.role
              },
              include: { user: true }
            });
          } else {
            // User is already an active member
            return existingMembership;
          }
        }
        
        // Create new membership
        return prisma.memberTeam.create({
          data: {
            teamId,
            userId: member.userId,
            role: member.role
          },
          include: { user: true }
        });
      })
    );
    
    // Also connect to the legacy relationship
    await prisma.team.update({
      where: { id: teamId },
      data: {
        users: {
          connect: membershipData.map(member => ({ id: member.userId }))
        }
      }
    });
    
    return res.status(200).json(results);
  } catch (error) {
    console.error("Request error", error);
    return res.status(500).json({ error: "Error adding team members" });
  }
}
