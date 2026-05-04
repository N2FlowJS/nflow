import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SecretService } from '../services/secretService';

const router = Router();

/**
 * Create a new secret
 * POST /api/secrets
 */
router.post('/secrets', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ ok: false, error: 'Not authenticated' });
    }

    const { name, key, label } = req.body;

    if (!name || !key) {
      return res.status(400).json({
        ok: false,
        error: 'Secret name and value are required',
      });
    }

    const secret = await SecretService.createSecret(req.userId, {
      name,
      key,
      label,
    });

    res.json({
      ok: true,
      secret,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to create secret';
    console.error('[Secrets] Create error:', errorMsg, { userId: req.userId });
    res.status(400).json({ ok: false, error: errorMsg });
  }
});

/**
 * List all secrets for user
 * GET /api/secrets
 */
router.get('/secrets', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ ok: false, error: 'Not authenticated' });
    }

    const secrets = await SecretService.listSecrets(req.userId);

    res.json({
      ok: true,
      secrets,
      count: secrets.length,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to list secrets';
    console.error('[Secrets] List error:', errorMsg, { userId: req.userId });
    res.status(500).json({ ok: false, error: errorMsg });
  }
});

/**
 * Get a specific secret
 * GET /api/secrets/:id
 */
router.get('/secrets/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ ok: false, error: 'Not authenticated' });
    }

    const secretId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const secret = await SecretService.getSecret(req.userId, secretId);

    res.json({
      ok: true,
      secret,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to get secret';
    console.error('[Secrets] Get error:', errorMsg, { userId: req.userId });
    res.status(err instanceof Error && err.message === 'Secret not found' ? 404 : 500).json({
      ok: false,
      error: errorMsg,
    });
  }
});

/**
 * Update a secret
 * PUT /api/secrets/:id
 */
router.put('/secrets/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ ok: false, error: 'Not authenticated' });
    }

    const secretId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, key, label } = req.body;

    const secret = await SecretService.updateSecret(req.userId, secretId, {
      name,
      key,
      label,
    });

    res.json({
      ok: true,
      secret,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update secret';
    console.error('[Secrets] Update error:', errorMsg, { userId: req.userId });
    res.status(err instanceof Error && err.message === 'Secret not found' ? 404 : 400).json({
      ok: false,
      error: errorMsg,
    });
  }
});

/**
 * Delete a secret
 * DELETE /api/secrets/:id
 */
router.delete('/secrets/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ ok: false, error: 'Not authenticated' });
    }

    const secretId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await SecretService.deleteSecret(req.userId, secretId);

    res.json({
      ok: true,
      message: 'Secret deleted successfully',
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to delete secret';
    console.error('[Secrets] Delete error:', errorMsg, { userId: req.userId });
    res.status(err instanceof Error && err.message === 'Secret not found' ? 404 : 500).json({
      ok: false,
      error: errorMsg,
    });
  }
});

/**
 * Regenerate a secret (generate new value)
 * POST /api/secrets/:id/regenerate
 */
router.post('/secrets/:id/regenerate', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ ok: false, error: 'Not authenticated' });
    }

    const secretId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await SecretService.regenerateSecret(req.userId, secretId);

    res.json({
      ok: true,
      key: result.key,
      message: 'Secret regenerated successfully',
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to regenerate secret';
    console.error('[Secrets] Regenerate error:', errorMsg, { userId: req.userId });
    res.status(err instanceof Error && err.message === 'Secret not found' ? 404 : 500).json({
      ok: false,
      error: errorMsg,
    });
  }
});

export default router;
