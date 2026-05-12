import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SecretService } from '../services/secretService';
import { toErrorMessage } from '../utils/common';
import { createLogger } from '../utils/logger';
import { successResponse, errorResponse, asyncHandler } from '../utils/apiResponse';

const router = Router();
const logger = createLogger('Secrets');

router.post('/secrets', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse('Not authenticated'));
    return;
  }

  const { name, key, label } = req.body;
  if (!name || !key) {
    res.status(400).json(errorResponse('Secret name and value are required'));
    return;
  }
  const secret = await SecretService.createSecret(userId, { name, key, label });
  res.json(successResponse(secret));
}));

router.get('/secrets', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse('Not authenticated'));
    return;
  }

  const secrets = await SecretService.listSecrets(userId);
  res.json(successResponse(secrets));
}));

router.get('/secrets/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse('Not authenticated'));
    return;
  }

  const secret = await SecretService.getSecret(userId, String(req.params.id));
  res.json(successResponse(secret));
}));

router.put('/secrets/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse('Not authenticated'));
    return;
  }

  const { name, key, label } = req.body;
  const secret = await SecretService.updateSecret(userId, String(req.params.id), { name, key, label });
  res.json(successResponse(secret));
}));

router.delete('/secrets/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse('Not authenticated'));
    return;
  }

  await SecretService.deleteSecret(userId, String(req.params.id));
  res.json(successResponse({ message: 'Secret deleted successfully' }));
}));

router.post('/secrets/:id/regenerate', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json(errorResponse('Not authenticated'));
    return;
  }

  const secret = await SecretService.regenerateSecret(userId, String(req.params.id));
  res.json(successResponse(secret));
}));

export default router;
