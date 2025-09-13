import { NextApiRequest, NextApiResponse } from 'next';
import { getWorkerStatus } from '../../../lib/worker-init';
import { parseAuthHeader, verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // GET - Retrieve worker status - no auth required
  if (req.method === 'GET') {
    const status = getWorkerStatus();
    res.status(200).json({
      initialized: status.initialized,
      workerCount: status.workerCount,
      enabled: process.env.ENABLE_FILE_PARSING_WORKER === 'true'
    });
    return;
  }
  
  // For all non-GET methods, require authentication
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
  
  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
  return;
}
