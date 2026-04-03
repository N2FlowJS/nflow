import type { LlmRuntimeConfig } from '../types';
import { trimTrailingSlash, normalizeModelsJson } from '../utils';
import OpenAI from 'openai';

export const listModels = async (
  cfg: LlmRuntimeConfig,
): Promise<Array<{ id: string; name?: string; description?: string }>> => {
  let baseUrl = trimTrailingSlash(cfg.baseUrl || '');
  if (!baseUrl) {
    console.warn('[NVIDIA] No baseUrl provided');
    return [];
  }

  // NVIDIA NIM requires /v1 in the base URL for OpenAI-compatible endpoints
  if (baseUrl.includes('nvidia.com') && !baseUrl.endsWith('/v1')) {
    baseUrl = `${baseUrl}/v1`;
  }

  console.debug(`[NVIDIA] Listing models from ${baseUrl}`);

  try {
    const client = new OpenAI({
      baseURL: baseUrl,
      apiKey: String(cfg.apiKey || 'not-required'),
      defaultHeaders: {
        'User-Agent': 'N2Flow-Client/1.0',
      },
    }) as any;

    if (client.models && typeof client.models.list === 'function') {
      const resp = await client.models.list();
      const data = Array.isArray(resp?.data) ? resp.data : resp?.models || [];
      const models = (data || []).map((m: any) => ({
        id: String(m.id || m.name || m.model || ''),
        name: m.name || m.id || m.model,
        description: m.description,
      }));

      if (models.length > 0) {
        console.log(`[NVIDIA] Successfully fetched ${models.length} models from OpenAI-compatible API`);
        return models;
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[NVIDIA] Failed to fetch models via OpenAI SDK: ${errorMsg}`);
  }

  return [];
};
