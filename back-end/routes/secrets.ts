import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SecretService } from '../services/secretService';
import { toErrorMessage } from '../utils/common';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('Secrets');

function requireUserId(req: AuthRequest, res: Response): string | null {
  if (!req.userId) {
    res.status(401).json({ ok: false, error: 'Not authenticated' });
    return null;
  }
  return req.userId;
}

function resolveParamId(id: string | string[]): string {
  return Array.isArray(id) ? id[0] : id;
}

router.post('/secrets', async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  try {
    const { name, key, label } = req.body;
    if (!name || !key) {
      res.status(400).json({ ok: false, error: 'Secret name and value are required' });
      return;
    }
    const secret = await SecretService.createSecret(userId, { name, key, label });
    res.json({ ok: true, secret });
  } catch (err) {
    const errorMsg = toErrorMessage(err, 'Failed to create secret');
    logger.error('Create error', err, { userId });
    res.status(400).json({ ok: false, error: errorMsg });
  }
});

router.get('/secrets', async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  try {
    const secrets = await SecretService.listSecrets(userId);
    res.json({ ok: true, secrets, count: secrets.length });
  } catch (err) {
    const errorMsg = toErrorMessage(err, 'Failed to list secrets');
    logger.error('List error', err, { userId });
    res.status(500).json({ ok: false, error: errorMsg });
  }
});

router.get('/secrets/:id', async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  try {
    const secretId = resolveParamId(req.params.id);
    const secret = await SecretService.getSecret(userId, secretId);
    res.json({ ok: true, secret });
  } catch (err) {
    const errorMsg = toErrorMessage(err, 'Failed to get secret');
    logger.error('Get error', err, { userId });
    res.status(err instanceof Error && err.message === 'Secret not found' ? 404 : 500).json({ ok: false, error: errorMsg });
  }
});

router.put('/secrets/:id', async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  try {
    const secretId = resolveParamId(req.params.id);
    const { name, key, label } = req.body;
    const secret = await SecretService.updateSecret(userId, secretId, { name, key, label });
    res.json({ ok: true, secret });
  } catch (err) {
    const errorMsg = toErrorMessage(err, 'Failed to update secret');
    logger.error('Update error', err, { userId });
    res.status(err instanceof Error && err.message === 'Secret not found' ? 404 : 400).json({ ok: false, error: errorMsg });
  }
});

router.delete('/secrets/:id', async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  try {
    const secretId = resolveParamId(req.params.id);
    await SecretService.deleteSecret(userId, secretId);
    res.json({ ok: true, message: 'Secret deleted successfully' });
  } catch (err) {
    const errorMsg = toErrorMessage(err, 'Failed to delete secret');
    logger.error('Delete error', err, { userId });
    res.status(err instanceof Error && err.message === 'Secret not found' ? 404 : 500).json({ ok: false, error: errorMsg });
  }
});

router.post('/secrets/:id/regenerate', async (req: AuthRequest, res: Response) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  try {
    const secretId = resolveParamId(req.params.id);
    const result = await SecretService.regenerateSecret(userId, secretId);
    res.json({ ok: true, key: result.key, message: 'Secret regenerated successfully' });
  } catch (err) {
    const errorMsg = toErrorMessage(err, 'Failed to regenerate secret');
    logger.error('Regenerate error', err, { userId });
    res.status(err instanceof Error && err.message === 'Secret not found' ? 404 : 500).json({ ok: false, error: errorMsg });
  }
});

export default router;
