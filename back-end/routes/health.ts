import { Router, type Request, type Response } from 'express';
import { db } from '../lib/db';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await db.exec('SELECT 1');
    dbStatus = 'connected';
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  const isHealthy = dbStatus === 'connected';
  res.status(isHealthy ? 200 : 503).json({
    ok: isHealthy,
    service: 'n2flow-backend',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

export default router;
