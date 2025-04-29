import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { getFileParsingWorkerStatus } from '../../lib/workers/file-worker';
import { parseAuthHeader, verifyToken } from '../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the token from the request headers
    const token = parseAuthHeader(req.headers.authorization);

    // Verify the token
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    // Check database connectivity by performing a simple query
    await prisma.$queryRaw`SELECT 1`;

    // Also get worker statistics if available
    const pendingTasks = await prisma.fileParsingTask.count({
      where: { status: 'pending' }
    });

    const processingTasks = await prisma.fileParsingTask.count({
      where: { status: 'processing' }
    });
    const fileWorkerStatus = getFileParsingWorkerStatus()
    // Return status with worker info
    return res.status(200).json({
      status: 'connected',
      error: null,
      lastChecked: Date.now(),
      setupAttempted: false,
      workers: {
        enabled: fileWorkerStatus.enabled,
        activeWorkers: processingTasks,
        pendingTasks: pendingTasks,
        maxWorkers: fileWorkerStatus.maxWorkers
      }
    });

  } catch (error: unknown) {
    console.error('Database connection check failed:', error);

    return res.status(200).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown database error',
      lastChecked: Date.now(),
      setupAttempted: false,
      workers: {
        enabled: false,
        activeWorkers: 0,
        pendingTasks: 0,
        maxWorkers: 0
      }
    });
  }
}
