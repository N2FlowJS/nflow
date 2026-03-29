import { Router, Request, Response } from 'express';
import { listModels } from '../llm';

const router = Router();

router.post('/llm/models', async (req: Request, res: Response) => {
  try {
    const { provider, baseUrl, apiKey } = req.body || {};
    if (!baseUrl && !provider) {
      res.status(400).json({ error: 'Missing baseUrl or provider' });
      return;
    }
    try {
      const cfg = { provider: provider || '', model: '', apiKey: apiKey || '', baseUrl: baseUrl || '' };
      const models = await listModels(cfg);
      res.json({ ok: true, models });
      return;
    } catch (err) {
      // fall through to final error
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: err instanceof Error ? err.message : 'Failed to fetch models' });
  }
});

export default router;
