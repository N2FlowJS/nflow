export const trimTrailingSlash = (url: unknown) => String(url || '').replace(/\/+$/, '');

export const normalizeModelsJson = (payload: any): Array<{ id: string; name?: string; description?: string }> => {
  if (!payload) return [];

  let arr: any[] = [];
  if (Array.isArray(payload)) arr = payload;
  else if (Array.isArray(payload.data)) arr = payload.data;
  else if (Array.isArray(payload.models)) arr = payload.models;
  else if (Array.isArray(payload.modelSpecs)) arr = payload.modelSpecs;
  else if (typeof payload === 'object') {
    const keys = Object.keys(payload || {});
    const maybeModels = keys.filter(k => typeof (payload as any)[k] === 'object');
    if (maybeModels.length > 0) {
      arr = maybeModels.map(k => ({ id: k, ...(payload as any)[k] }));
    }
  }

  return arr
    .map((entry) => {
      if (!entry) return null;
      if (typeof entry === 'string') return { id: entry, name: entry };
      const id = String(entry.id || entry.name || entry.model || entry.modelId || entry.key || entry.model_name || '') || '';
      const name = String(entry.name || entry.title || entry.id || id || '');
      const description = entry.description || entry.summary || undefined;
      if (!id && !name) return null;
      return { id, name, description };
    })
    .filter(Boolean) as Array<{ id: string; name?: string; description?: string }>;
};

export const tryFetchModelsFromBase = async (baseUrl: string, apiKey?: string) => {
  const base = trimTrailingSlash(baseUrl || '');
  if (!base) return [] as Array<{ id: string; name?: string; description?: string }>;

  const endpoints = [
    '/v1/models',
    '/models',
    '/v1/engines',
    '/engines',
    '/models/list',
    '/list-models',
    '/v1/catalog/models',
  ];

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${String(apiKey)}`;
    headers['x-api-key'] = String(apiKey);
    headers['api-key'] = String(apiKey);
  }

  for (const ep of endpoints) {
    const url = `${base}${ep}`;
    try {
      const resp = await fetch(url, { headers });
      if (!resp.ok) continue;
      const json = await resp.json();
      const normalized = normalizeModelsJson(json);
      if (normalized.length > 0) return normalized;
    } catch (err) {
      continue;
    }
  }

  try {
    const resp = await fetch(base, { headers });
    if (resp.ok) {
      const json = await resp.json();
      const normalized = normalizeModelsJson(json);
      if (normalized.length > 0) return normalized;
    }
  } catch (err) {}

  return [] as Array<{ id: string; name?: string; description?: string }>;
};
// Additional helpers used by runtime adapters
import type { AgentTool } from './types';

export const parseToolArgs = (rawArgs: unknown): Record<string, string> => {
  if (rawArgs && typeof rawArgs === 'object') {
    return Object.fromEntries(Object.entries(rawArgs).map(([key, value]) => [key, String(value ?? '')]));
  }
  if (typeof rawArgs !== 'string') return {};
  try {
    const parsed = JSON.parse(rawArgs as string) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, String(value ?? '')]));
  } catch {
    return {};
  }
};

export const MAX_TOOL_RESULT_CHARS = 12000;
export const clampToolResult = (value: string): string => {
  if (value.length <= MAX_TOOL_RESULT_CHARS) return value;
  return `${value.slice(0, MAX_TOOL_RESULT_CHARS)}\n...[truncated ${value.length - MAX_TOOL_RESULT_CHARS} chars]`;
};

export const extractOllamaToolCalls = (payload: any) => {
  const candidates: any[] = [];
  if (payload?.message && typeof payload.message === 'object') {
    const msg = payload.message;
    if (Array.isArray(msg.tool_calls)) candidates.push(...msg.tool_calls);
    if (msg.function_call && typeof msg.function_call === 'object') candidates.push(msg.function_call);
  }
  if (Array.isArray(payload?.tool_calls)) candidates.push(...payload.tool_calls);
  if (payload?.function_call && typeof payload.function_call === 'object') candidates.push(payload.function_call);

  return candidates
    .map((entry, index) => {
      if (!entry || typeof entry !== 'object') return null;
      const raw = entry;
      const fnContainer = (raw.function && typeof raw.function === 'object') ? raw.function : raw;
      const fnName = String(fnContainer.name || raw.name || '').trim();
      if (!fnName) return null;
      const rawArgs = fnContainer.arguments ?? fnContainer.args ?? fnContainer.parameters ?? raw.arguments ?? raw.args ?? raw.parameters;
      return {
        id: String(raw.id || fnContainer.id || `tool_call_${index + 1}`),
        name: fnName,
        args: parseToolArgs(rawArgs),
        raw,
      };
    })
    .filter(Boolean) as Array<{ id: string; name: string; args: Record<string, string>; raw: Record<string, unknown> }>;
};

export const toOpenAiToolDeclarations = (tools: AgentTool[]) =>
  tools.map(t => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));

export default {
  trimTrailingSlash,
  normalizeModelsJson,
  tryFetchModelsFromBase,
  parseToolArgs,
  clampToolResult,
  extractOllamaToolCalls,
  toOpenAiToolDeclarations,
};
