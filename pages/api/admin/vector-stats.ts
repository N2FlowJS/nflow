import { NextApiRequest, NextApiResponse } from 'next';
import { getWorkerStatus } from '../../../lib/worker-init';
import { getLocalVectorStats } from '../../../lib/services/localVectorService';
import { getFileVectorStats } from '../../../lib/services/nbaseService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const workerStatus = getWorkerStatus();
    const vectorDBType = workerStatus.vectorDBType || 'none';
    
    // Get appropriate vector stats based on vector DB type
    let vectorStats: any = { type: vectorDBType };
    
    if (vectorDBType === 'nbase') {
      // Count vectors in Qdrant 
      try {
        
        const stats = await getFileVectorStats();
        vectorStats = {
          ...vectorStats,
          status: 'available',
          ...stats
        };
      } catch (error) {
        vectorStats.status = 'error';
        vectorStats.error = error instanceof Error ? error.message : String(error);
      }
    } else if (vectorDBType === 'local') {
      // Count vectors in local DB
      try {
        const stats = await getLocalVectorStats();
        vectorStats = {
          ...vectorStats,
          status: 'available',
          ...stats
        };
      } catch (error) {
        vectorStats.status = 'error';
        vectorStats.error = error instanceof Error ? error.message : String(error);
      }
    } else {
      vectorStats.status = 'unavailable';
    }
    
    res.status(200).json({
      vectorDB: vectorStats,
      worker: workerStatus
    });
  } catch (error) {
    console.error('Error getting vector stats:', error);
    res.status(500).json({ 
      error: 'Failed to get vector database statistics',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
