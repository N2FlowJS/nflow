import { Router, Request, Response } from 'express';
import { listModels } from '../llm';
import { createLogger } from '../utils/logger';
import { toErrorMessage } from '../utils/common';
import { LLMProviderService } from '../services/llmProviderService';
import { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const logger = createLogger('LLMRoute');

const asyncHandler = (fn: any) => (req: Request, res: Response, next: any) => 
  Promise.resolve(fn(req, res, next)).catch(err => {
    const errorMsg = toErrorMessage(err);
    logger.error('LLM Route error', err);
    res.status(500).json({ ok: false, error: errorMsg });
  });

/**
 * @openapi
 * /api/llm/models:
 *   post:
 *     summary: Discover available models for a given provider or base URL
 *     tags: [LLM]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider: { type: string, description: "Provider name (e.g., OpenAI, Ollama, Google)" }
 *               baseUrl: { type: string, description: "Base URL for OpenAI compatible APIs" }
 *               apiKey: { type: string, description: "API Key (optional if using local Ollama)" }
 *               providerId: { type: string, description: "Saved Provider ID" }
 *     responses:
 *       200:
 *         description: List of discovered models
 *       400:
 *         description: Missing required configuration
 */
router.post('/llm/models', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response) => {
  let { provider, baseUrl, apiKey, providerId } = req.body || {};

  if (providerId) {
    try {
      const resolved = await LLMProviderService.resolveProvider(req.userId!, providerId);
      provider = resolved.provider;
      if (resolved.apiKey) apiKey = resolved.apiKey;
      if (resolved.baseUrl) baseUrl = resolved.baseUrl;
    } catch (err) {
      logger.error(`Failed to resolve provider ${providerId} for model scanning`, err);
    }
  }

  if (!baseUrl && !provider) {
    return res.status(400).json({ ok: false, error: 'Missing baseUrl or provider' });
  }

  const cfg = { 
    provider: provider || '', 
    model: '', 
    apiKey: apiKey || '', 
    baseUrl: baseUrl || '' 
  };
  
  logger.debug('Fetching models', { provider, baseUrl: baseUrl?.substring(0, 50), providerId });
  
  const models = await listModels(cfg);
  res.json({ ok: true, models });
}));

export default router;
