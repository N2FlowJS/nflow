import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import { listModels, runChat, type LlmRuntimeConfig } from '../llm';
import { createLogger } from '../utils/logger';

/** Shape of the JSON report this diagnostic test writes. */
type ListedModel = { id: string; name?: string; description?: string };
type ModelTry = { model: string; ok: boolean; error?: string; response?: string };
type ProviderDiagnostic = {
  provider: string;
  listedModels: Array<{ id: string; name: string }>;
  tries: ModelTry[];
};
type DiagnosticReport = { runTimestamp: string; providers: ProviderDiagnostic[] };

const logger = createLogger('Tests');

describe('diagnostic: listModels and try all models for configured providers', () => {
  it('lists models and attempts chat for each (diagnostic, non-blocking)', async () => {
    const providers = (process.env.LLM_PROVIDERS || 'NVIDIA')
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const rawMaxTries = Number(process.env.LLM_MAX_TRIES || '5');
    const results: DiagnosticReport = { runTimestamp: new Date().toISOString(), providers: [] };

    for (const provider of providers) {
      // Build a minimal runtime cfg from env for each provider
      const p = provider.toLowerCase();
      const baseCfg: LlmRuntimeConfig = { provider, model: '', apiKey: '', baseUrl: '' };
      if (p === 'nvidia') {
        baseCfg.apiKey =
          process.env.NVIDIA_API_KEY ||
          process.env.NVIDIA_NIM_API_KEY ||
          process.env.SERVER_SECRET_NVIDIA_API_KEY ||
          '';
        baseCfg.baseUrl = process.env.NVIDIA_NIM_BASE_URL || 'https://integrate.api.nvidia.com/v1';
      } else if (p === 'openai' || p === 'vllm') {
        baseCfg.apiKey = process.env.OPENAI_API_KEY || '';
        baseCfg.baseUrl = process.env.OPENAI_BASE_URL || '';
      } else if (p === 'google') {
        baseCfg.apiKey = process.env.GOOGLE_API_KEY || '';
        baseCfg.baseUrl = process.env.GOOGLE_BASE_URL || '';
      } else if (p === 'anthropic') {
        baseCfg.apiKey = process.env.ANTHROPIC_API_KEY || '';
        baseCfg.baseUrl = process.env.ANTHROPIC_BASE_URL || '';
      } else if (p === 'ollama') {
        baseCfg.apiKey = '';
        baseCfg.baseUrl = process.env.OLLAMA_BASE_URL || '';
      } else {
        baseCfg.apiKey = process.env[`${provider.toUpperCase()}_API_KEY`] || '';
        baseCfg.baseUrl = process.env[`${provider.toUpperCase()}_BASE_URL`] || '';
      }

      if (!baseCfg.apiKey && !baseCfg.baseUrl) {
        // Nothing configured for this provider — skip
        logger.info(`[tests] Skipping provider ${provider} (no apiKey/baseUrl in env)`);
        continue;
      }

      // List models
      logger.info(`[tests] Listing models for ${provider}...`);
      let models: ListedModel[] = [];
      try {
        const listed = await listModels(baseCfg);
        models = Array.isArray(listed) ? listed : [];
      } catch (e) {
        logger.info(`[tests] listModels error for ${provider}: ${String(e)}`);
      }

      logger.info(`[tests] ${provider} returned ${models.length} models`);

      const providerResult: ProviderDiagnostic = {
        provider,
        listedModels: models.map((m) => ({
          id: String(m.id || m.name || ''),
          name: m.name || m.id || '',
        })),
        tries: [],
      };

      if (models.length === 0) {
        // nothing to try
        logger.info(`[tests] No models available to try for ${provider}`);
        results.providers.push(providerResult);
        continue;
      }

      const maxPerProvider = rawMaxTries <= 0 ? models.length : Math.max(1, rawMaxTries);

      // Try each returned model (capped)
      for (const m of models.slice(0, maxPerProvider)) {
        const modelId = String(m.id || m.name || '').trim();
        if (!modelId) continue;
        const cfg: LlmRuntimeConfig = {
          ...baseCfg,
          model: modelId,
          stream: false,
          temperature: 1,
          max_tokens: 128,
        };
        logger.info(`[tests] Attempting ${provider}:${modelId}`);
        try {
          const res = await runChat(
            cfg,
            'system',
            'Hello from diagnostic test',
            [],
            async () => '',
            () => {},
          );
          providerResult.tries.push({
            model: modelId,
            ok: true,
            response: String(res).slice(0, 500),
          });
          logger.info(`[tests] Success ${provider}:${modelId} -> ${String(res).slice(0, 200)}`);
        } catch (err) {
          providerResult.tries.push({ model: modelId, ok: false, error: String(err) });
          logger.info(`[tests] Fail ${provider}:${modelId} -> ${String(err)}`);
        }
      }

      results.providers.push(providerResult);
    }

    // Write diagnostic results to JSON
    try {
      const outFile =
        process.env.LLM_DIAG_OUTPUT ||
        path.resolve(process.cwd(), 'test-output', `llm-model-diagnostic-${Date.now()}.json`);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, JSON.stringify(results, null, 2), 'utf8');
      logger.info('[tests] Diagnostic results written to', outFile);
    } catch (e) {
      logger.warn('[tests] Failed to write diagnostic output:', String(e));
    }

    expect(true).toBe(true);
  }, 300000);
});
