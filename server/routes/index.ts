import { Router } from 'express';
import healthRoute from './health';
import sqlRoute from './sql';
import flowRoute from './flow';
import llmRoute from './llm';

const router = Router();

router.use('/api', healthRoute);
router.use('/api', sqlRoute);
router.use('/api', flowRoute);
router.use('/api', llmRoute);

export default router;
