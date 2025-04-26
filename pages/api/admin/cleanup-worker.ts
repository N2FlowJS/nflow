import type { NextApiRequest, NextApiResponse } from 'next';
import { getCleanupWorkerStatus } from '../../../lib/workers/conversationCleanupWorker';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const status = getCleanupWorkerStatus();
    res.status(200).json(status);
  } catch (error: any) {
    res.status(500).json({ enabled: false, status: 'error', error: error.message });
  }
}
