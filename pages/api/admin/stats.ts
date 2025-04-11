import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { parseAuthHeader, verifyToken } from "../../../lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Require authentication for all methods
  const token = parseAuthHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  // Verify token
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid token" });
  }

  // GET - Fetch system statistics
  if (req.method === "GET") {
    try {
      // Fetch all statistics in parallel for efficiency
      const [
        userCount,
        teamCount,
        knowledgeCount,
        fileCount,
        fileStatusStats,
        taskCount,
        taskStatusStats,
        agentCount,
        activeAgentCount,
        inactiveAgentCount,
        chunkCount
      ] = await Promise.all([
        // User statistics
        prisma.user.count(),
        
        // Team statistics
        prisma.team.count(),
        
        // Knowledge base statistics
        prisma.knowledge.count(),
        
        // File statistics
        prisma.file.count(),
        prisma.file.groupBy({
          by: ['parsingStatus'],
          _count: { _all: true }
        }),
        
        // Task statistics
        prisma.fileParsingTask.count(),
        prisma.fileParsingTask.groupBy({
          by: ['status'],
          _count: { _all: true }
        }),
        
        // Agent statistics
        prisma.agent.count(),
        prisma.agent.count({ where: { isActive: true } }),
        prisma.agent.count({ where: { isActive: false } }),
        
        // Text chunk statistics
        prisma.textChunk.count()
      ]);

      return res.status(200).json({
        userStats: {
          total: userCount
        },
        teamStats: {
          total: teamCount
        },
        knowledgeStats: {
          total: knowledgeCount
        },
        fileStats: {
          total: fileCount,
          byStatus: fileStatusStats
        },
        taskStats: {
          total: taskCount,
          byStatus: taskStatusStats
        },
        agentStats: {
          total: agentCount,
          active: activeAgentCount,
          inactive: inactiveAgentCount
        },
        chunkStats: {
          total: chunkCount
        }
      });
    } catch (error) {
      console.error("Error fetching system statistics:", error);
      return res.status(500).json({ error: "Failed to fetch system statistics" });
    }
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
