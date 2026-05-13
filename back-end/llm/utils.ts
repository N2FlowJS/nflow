import { trimTrailingSlash, parseJsonSafely, normalizeApiKey } from '../utils/common';
export { trimTrailingSlash };

export const hasTemplatePlaceholder = (value: unknown): boolean =>
  typeof value === 'string' && /\{\{\s*[^{}]+\s*\}\}/.test(value);

export const ensureOpenAiBaseUrl = (url: string | undefined, provider: string): string => {
  let base = trimTrailingSlash(url || '');
  if (!base) {
    if (provider === 'Ollama') return 'http://localhost:11434/v1';
    return 'http://localhost:8000/v1';
  }

  // NVIDIA NIM and some other providers require /v1 suffix for OpenAI compatibility
  if ((provider === 'NVIDIA' || provider === 'OpenAI') && !base.endsWith('/v1')) {
    if (base.includes('nvidia.com') || base.includes('localhost') || base.includes('127.0.0.1')) {
      base = `${base}/v1`;
    }
  }
  return base;
};

export const validateLlmConfig = (cfg: { apiKey?: string; provider?: string }, logPrefix: string) => {
  if (hasTemplatePlaceholder(cfg.apiKey)) {
    throw new Error(`${logPrefix} API key placeholder was not resolved. Check the selected Global Variable name.`);
  }
  const normalized = normalizeApiKey(cfg.apiKey);
  if (!normalized && cfg.provider !== 'Ollama') {
    throw new Error(`Missing ${logPrefix} API key. Enter a value or select a Global Variable.`);
  }
  return normalized;
};

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

const toStringRecord = (obj: object): Record<string, string> =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, String(v ?? '')]));

export const parseToolArgs = (rawArgs: unknown): Record<string, string> => {
  if (rawArgs && typeof rawArgs === 'object') return toStringRecord(rawArgs);
  if (typeof rawArgs !== 'string') return {};
  const parsed = parseJsonSafely(rawArgs);
  return parsed && typeof parsed === 'object' ? toStringRecord(parsed as object) : {};
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

export const toAnthropicToolDeclarations = (tools: AgentTool[]) =>
  tools.map(t => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
  }));

export const toGoogleToolDeclarations = (tools: AgentTool[]) =>
  tools.map(t => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }));

export type NormalizedToolCall = {
  id: string;
  name: string;
  args: Record<string, string>;
  raw?: any; // The original provider-specific tool call object (needed for message history)
};

/**
 * Standard response from a single LLM step
 */
export type StepResult = {
  content: string;
  toolCalls: NormalizedToolCall[];
};

/**
 * Orchestrates multi-step tool loops (ReAct/Agentic loops) across LLM providers.
 */
export const createChatOrchestrator = async (options: {
  maxSteps?: number;
  log: (msg: string) => void;
  executeToolByName: (name: string, callArgs: Record<string, string>) => Promise<string>;
  onStep: (stepCount: number) => Promise<StepResult>;
  onToolResult: (toolCall: NormalizedToolCall, result: string) => void | Promise<void>;
}): Promise<string> => {
  const { maxSteps = 8, log, executeToolByName, onStep, onToolResult } = options;
  let lastContent = '';

  for (let step = 0; step < maxSteps; step++) {
    const { content, toolCalls } = await onStep(step);
    if (!lastContent || content) lastContent = content;

    if (toolCalls.length === 0) {
      return lastContent || '[Empty model response]';
    }

    for (const tc of toolCalls) {
      log(`[Agent] Tool call: ${tc.name} → ${JSON.stringify(tc.args)}`);
      const rawResult = await executeToolByName(tc.name, tc.args);
      log(`[Agent] Tool result: ${String(rawResult).substring(0, 120)}`);
      const safeResult = clampToolResult(String(rawResult || ''));
      await onToolResult(tc, safeResult);
    }
  }

  return lastContent;
};

export default {
  trimTrailingSlash,
  normalizeApiKey,
  normalizeModelsJson,
  tryFetchModelsFromBase,
  parseToolArgs,
  clampToolResult,
  extractOllamaToolCalls,
  toOpenAiToolDeclarations,
  createChatOrchestrator,
};
