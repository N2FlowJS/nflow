import { Router } from 'express';
import healthRoute from './health';
import sqlRoute from './sql';
import flowRoute from './flow';
import llmRoute from './llm';
import toolsRoute from './tools';
import authRoute from './auth';
import secretsRoute from './secrets';

const router = Router();

router.use('/api/auth', authRoute);
router.use('/api', secretsRoute);
router.use('/api', healthRoute);
router.use('/api', sqlRoute);
router.use('/api', flowRoute);
router.use('/api', llmRoute);
router.use('/api', toolsRoute);

export default router;
