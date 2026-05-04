import { Router, Request, Response } from 'express';
import { listModels } from '../llm';
import { createLogger } from '../utils/logger';

const router = Router();
const logger = createLogger('LLMRoute');

router.post('/llm/models', async (req: Request, res: Response) => {
  try {
    const { provider, baseUrl, apiKey } = req.body || {};
    if (!baseUrl && !provider) {
      res.status(400).json({ ok: false, error: 'Missing baseUrl or provider' });
      return;
    }
    try {
      const cfg = { provider: provider || '', model: '', apiKey: apiKey || '', baseUrl: baseUrl || '' };
      logger.debug('Fetching models', { provider, baseUrl: baseUrl?.substring(0, 50) });
      
      const models = await listModels(cfg);
      res.json({ ok: true, models });
      return;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error('Model fetch error', err, { baseUrl: baseUrl?.substring(0, 50) });
      res.status(500).json({ ok: false, error: `Failed to fetch models: ${errorMsg}` });
      return;
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch models';
    logger.error('LLM models endpoint error', err);
    res.status(500).json({ ok: false, error: errorMsg });
  }
});

export default router;
