import type { LlmRuntimeConfig } from '../types';
import { trimTrailingSlash, normalizeModelsJson } from '../utils';

export const listModels = async (
  cfg: LlmRuntimeConfig,
): Promise<Array<{ id: string; name?: string; description?: string }>> => {
  const base = trimTrailingSlash(cfg.baseUrl || '');
  if (!base) return [];
  const endpoints = ['/v1/models', '/models', '/v1/catalog/models', '/models/list'];
  for (const ep of endpoints) {
    const url = `${base}${ep}`;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (cfg.apiKey) {
        headers['Authorization'] = `Bearer ${cfg.apiKey}`;
        headers['x-api-key'] = String(cfg.apiKey);
      }
      const resp = await fetch(url, { method: 'GET', headers });
      if (!resp.ok) continue;
      const json = await resp.json();
      const normalized = normalizeModelsJson(json);
      if (normalized.length > 0) return normalized;
    } catch (err) {
      continue;
    }
  }
  return [];
};
