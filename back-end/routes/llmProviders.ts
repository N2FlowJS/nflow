import { Router, Response } from 'express';
import { LLMProviderService } from '../services/llmProviderService';
import { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';
import { toErrorMessage } from '../utils/common';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('LLMProviderRoute');

const asyncHandler = (fn: any) => (req: AuthRequest, res: Response, next: any) => 
  Promise.resolve(fn(req, res, next)).catch(err => {
    const errorMsg = toErrorMessage(err);
    logger.error('Route error', err);
    res.status(500).json({ ok: false, error: errorMsg });
  });

router.use(authMiddleware);

router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const providers = await LLMProviderService.listProviders(req.userId!);
  res.json({ ok: true, data: providers });
}));

router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const provider = await LLMProviderService.createProvider(req.userId!, req.body);
  res.json({ ok: true, data: provider });
}));

router.patch('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const provider = await LLMProviderService.updateProvider(req.userId!, String(req.params.id), req.body);
  res.json({ ok: true, data: provider });
}));

router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  await LLMProviderService.deleteProvider(req.userId!, String(req.params.id));
  res.json({ ok: true });
}));

router.post('/:id/test', asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await LLMProviderService.testConnection(req.userId!, String(req.params.id));
  res.json(result);
}));

export default router;
