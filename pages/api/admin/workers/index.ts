import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { parseAuthHeader, verifyToken } from "@/lib/auth";
import { getFileParsingWorkerStatus } from "@/lib/workers/file-worker";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET - Get worker status and task statistics
  if (req.method === "GET") {
    try {
      // Get task statistics
      const taskStats = await prisma.$transaction([
        // Count tasks by status
        prisma.fileParsingTask.groupBy({
          by: ["status"],
          _count: { _all: true },
          orderBy: {
            status: 'asc' // Order by status ascending
          }
        }),

        // Get counts of tasks in various states
        prisma.fileParsingTask.count({ where: { status: "pending" } }),
        prisma.fileParsingTask.count({ where: { status: "processing" } }),
        prisma.fileParsingTask.count({ where: { status: "completed" } }),
        prisma.fileParsingTask.count({ where: { status: "failed" } }),

        // Get the most recent tasks
        prisma.fileParsingTask.findMany({
          take: 10,
          orderBy: { updatedAt: "desc" },
          include: {
            file: {
              select: {
                id: true,
                originalName: true,
                parsingStatus: true,
              },
            },
          },
        }),
      ]);

      // Extract results from transaction
      const [
        groupedStats,
        pendingCount,
        processingCount,
        completedCount,
        failedCount,
        recentTasks,
      ] = taskStats;

      // Get worker status from file
      const workerStatus = getFileParsingWorkerStatus();

      // Return statistics
      return res.status(200).json({
        workerConfig: {
          enabled: workerStatus.enabled,
          maxWorkers: workerStatus.maxWorkers,
          pollingInterval: parseInt(
            process.env.PARSING_POLLING_INTERVAL || "5000"
          ),
          status: workerStatus.status,
          activeWorkers: workerStatus.activeWorkers,
          lastUpdated: workerStatus.lastUpdated,
        },
        taskStats: {
          byStatus: groupedStats,
          pending: pendingCount,
          processing: processingCount,
          completed: completedCount,
          failed: failedCount,
          total: pendingCount + processingCount + completedCount + failedCount,
        },
        recentTasks,
      });
    } catch (error) {
      console.error("Error getting worker status:", error);
      return res.status(500).json({ error: "Failed to get worker status" });
    }
  }

  // For all non-GET methods, require authentication
  const token = parseAuthHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  // Verify token
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid token" });
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
