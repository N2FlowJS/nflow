import { NextApiRequest, NextApiResponse } from 'next';
import { getWorkerStatus } from '../../../lib/worker-init';
import { parseAuthHeader, verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - Retrieve worker status - no auth required
  if (req.method === 'GET') {
    const status = getWorkerStatus();
    return res.status(200).json({
      initialized: status.initialized,
      workerCount: status.workerCount,
      enabled: process.env.ENABLE_FILE_PARSING_WORKER === 'true'
    });
  }
  
  // For all non-GET methods, require authentication
  const token = parseAuthHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Verify token
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
