import type { NextApiRequest, NextApiResponse } from 'next';
import { getCleanupWorkerStatus } from '../../../lib/workers/cleanup-worker';
import { parseAuthHeader, verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // For all other methods, require authentication
    const token = parseAuthHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const status = getCleanupWorkerStatus();
    res.status(200).json(status);
  } catch (error: any) {
    res.status(500).json({ enabled: false, status: 'error', error: error.message });
  }
}
