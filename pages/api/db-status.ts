import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check database connectivity by performing a simple query
    await prisma.$queryRaw`SELECT 1`;
    
    // Also get worker statistics if available
    const pendingTasks = await prisma.fileParsingTask.count({
      where: { status: 'pending' }
    });
    
    const processingTasks = await prisma.fileParsingTask.count({
      where: { status: 'processing' }
    });
    
    // Return status with worker info
    return res.status(200).json({
      status: 'connected',
      error: null,
      lastChecked: Date.now(),
      setupAttempted: false,
      workers: {
        enabled: process.env.ENABLE_FILE_PARSING_WORKER === 'true',
        activeWorkers: processingTasks, 
        pendingTasks: pendingTasks,
        maxWorkers: parseInt(process.env.MAX_PARSING_WORKERS || '3')
      }
    });
    
  } catch (error) {
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
