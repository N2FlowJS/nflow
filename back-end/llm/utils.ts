import {
  asRecord,
  trimTrailingSlash,
  parseJsonSafely,
  normalizeApiKey,
} from '../utils/common';
import type { AgentTool } from './types';
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

export const validateLlmConfig = (
  cfg: { apiKey?: string; provider?: string },
  logPrefix: string,
) => {
  if (hasTemplatePlaceholder(cfg.apiKey)) {
    throw new Error(
      `${logPrefix} API key placeholder was not resolved. Check the selected Global Variable name.`,
    );
  }
  const normalized = normalizeApiKey(cfg.apiKey);
  if (!normalized && cfg.provider !== 'Ollama') {
    throw new Error(`Missing ${logPrefix} API key. Enter a value or select a Global Variable.`);
  }
  return normalized;
};

export const normalizeModelsJson = (
  payload: unknown,
): Array<{ id: string; name?: string; description?: string }> => {
  if (!payload) return [];

  const body = asRecord(payload);
  let arr: unknown[] = [];
  if (Array.isArray(payload)) arr = payload;
  else if (Array.isArray(body?.['data'])) arr = body['data'] as unknown[];
  else if (Array.isArray(body?.['models'])) arr = body['models'] as unknown[];
  else if (Array.isArray(body?.['modelSpecs'])) arr = body['modelSpecs'] as unknown[];
  else if (body) {
    // Some gateways key the model list by model id instead of returning an array.
    const maybeModels = Object.keys(body).filter((k) => asRecord(body[k]) !== undefined);
    if (maybeModels.length > 0) {
      arr = maybeModels.map((k) => ({ id: k, ...(body[k] as Record<string, unknown>) }));
    }
  }

  return arr
    .map((entry): { id: string; name?: string; description?: string } | null => {
      if (!entry) return null;
      if (typeof entry === 'string') return { id: entry, name: entry };
      // Gateways disagree on the id field, so every known spelling is accepted.
      const record = asRecord(entry) ?? {};
      const id = String(
        record['id'] ??
          record['name'] ??
          record['model'] ??
          record['modelId'] ??
          record['key'] ??
          record['model_name'] ??
          '',
      );
      const name = String(record['name'] ?? record['title'] ?? record['id'] ?? id);
      const description = record['description'] ?? record['summary'];
      if (!id && !name) return null;
      return {
        id,
        name,
        ...(typeof description === 'string' && description !== '' && { description }),
      };
    })
    .filter((entry): entry is { id: string; name?: string; description?: string } => entry !== null);
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
  } catch (err) {
    // A non-JSON body is not fatal; callers fall back to the raw text.
  }

  return [] as Array<{ id: string; name?: string; description?: string }>;
};
// Additional helpers used by runtime adapters

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

export const extractOllamaToolCalls = (payload: unknown): NormalizedToolCall[] => {
  const candidates: unknown[] = [];
  const body = asRecord(payload);
  const message = asRecord(body?.['message']);
  if (message) {
    if (Array.isArray(message['tool_calls'])) candidates.push(...message['tool_calls']);
    const fnCall = asRecord(message['function_call']);
    if (fnCall) candidates.push(fnCall);
  }
  if (Array.isArray(body?.['tool_calls'])) candidates.push(...body['tool_calls']);
  const topLevelFnCall = asRecord(body?.['function_call']);
  if (topLevelFnCall) candidates.push(topLevelFnCall);

  return candidates
    .map((entry, index): NormalizedToolCall | null => {
      const raw = asRecord(entry);
      if (!raw) return null;
      // Ollama nests the callable under `function`; some builds put it at the top level.
      const fnContainer = asRecord(raw['function']) ?? raw;
      const fnName = String(fnContainer['name'] ?? raw['name'] ?? '')
        .trim();
      if (!fnName) return null;
      const rawArgs =
        fnContainer['arguments'] ??
        fnContainer['args'] ??
        fnContainer['parameters'] ??
        raw['arguments'] ??
        raw['args'] ??
        raw['parameters'];
      return {
        id: String(raw['id'] ?? fnContainer['id'] ?? `tool_call_${index + 1}`),
        name: fnName,
        args: parseToolArgs(rawArgs),
        raw,
      };
    })
    .filter((c) => c !== null);
};

// `as const` on the discriminant keeps `type` assignable to the SDK's
// `ChatCompletionTool['type']`, which is the literal `'function'`.
export const toOpenAiToolDeclarations = (tools: AgentTool[]) =>
  tools.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));

export const toAnthropicToolDeclarations = (tools: AgentTool[]) =>
  tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
  }));

export const toGoogleToolDeclarations = (tools: AgentTool[]) =>
  tools.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }));

export type NormalizedToolCall = {
  id: string;
  name: string;
  args: Record<string, string>;
  raw?: unknown; // The original provider-specific tool call object (needed for message history)
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
/**
 * Normalize an OpenAI-shaped chat completion (from OpenAI, NVIDIA NIM, or any
 * compatible gateway) into the orchestrator's step result.
 *
 * Gateways are inconsistent about `content` (string vs. array of parts) and
 * about which optional fields are present, so everything is narrowed defensively
 * rather than trusted.
 */
export const normalizeChatCompletion = (completion: unknown): StepResult => {
  const body = asRecord(completion);
  const choices = body?.['choices'];
  const choice = asRecord(Array.isArray(choices) ? choices[0] : undefined);
  const message = asRecord(choice?.['message']);
  const content = message?.['content'];

  const text =
    typeof content === 'string'
      ? content
      : Array.isArray(content)
        ? (content as Array<{ text?: unknown }>)
            .map((part) => (typeof part?.text === 'string' ? part.text : ''))
            .join('')
        : '';

  const rawToolCalls = Array.isArray(message?.['tool_calls'])
    ? (message['tool_calls'] as Array<Record<string, unknown>>)
    : [];

  return {
    content: text,
    toolCalls: rawToolCalls.map((tc) => {
      const fn = asRecord(tc['function']);
      return {
        id: String(tc['id'] ?? ''),
        name: String(fn?.['name'] ?? ''),
        args: parseToolArgs(fn?.['arguments']),
        raw: tc,
      };
    }),
  };
};

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
  normalizeChatCompletion,
  toOpenAiToolDeclarations,
  createChatOrchestrator,
};
