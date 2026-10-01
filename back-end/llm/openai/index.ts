import OpenAI from 'openai';
import type {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from 'openai/resources/chat/completions';
import type { ImageGenerateParams } from 'openai/resources/images';
import type { ChatMessage } from '@n2flow/types';
import type { AgentTool, LlmRuntimeConfig } from '../types';
import {
  ensureOpenAiBaseUrl,
  validateLlmConfig,
  parseToolArgs,
  toOpenAiToolDeclarations,
  createChatOrchestrator,
  tryFetchModelsFromBase,
} from '../utils';
import { maskApiKey, withTimeout } from '../../utils/common';

/**
 * The OpenAI client is constructed against `baseURL` so it can also drive
 * OpenAI-compatible gateways, which do not always implement every endpoint or
 * return the documented envelope. The response shapes are therefore narrowed
 * defensively rather than trusted.
 */
type ModelListEntry = { id?: unknown; name?: unknown; model?: unknown; description?: unknown };
type ContentPart = { text?: unknown };
type ToolCall = {
  id?: unknown;
  function?: { name?: unknown; arguments?: unknown };
};

/** Present only when the value is a non-empty string, so `exactOptionalPropertyTypes` holds. */
const asOptionalString = (value: unknown): string | undefined =>
  typeof value === 'string' && value !== '' ? value : undefined;

/** Narrow an untrusted value to a plain record. */
const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

export const listModels = async (
  cfg: LlmRuntimeConfig,
): Promise<Array<{ id: string; name?: string; description?: string }>> => {
  const base = ensureOpenAiBaseUrl(cfg.baseUrl, cfg.provider || 'OpenAI');
  const apiKey = validateLlmConfig(cfg, cfg.provider || 'OpenAI');

  try {
    const client = new OpenAI({ baseURL: base, apiKey: apiKey || 'not-required' });
    if (client.models && typeof client.models.list === 'function') {
      const resp = (await client.models.list()) as unknown as {
        data?: unknown;
        models?: unknown;
      };
      const raw = Array.isArray(resp?.data) ? resp.data : resp?.models;
      const data: ModelListEntry[] = Array.isArray(raw) ? raw : [];
      return data.map((m) => {
        const name = asOptionalString(m.name || m.id || m.model);
        const description = asOptionalString(m.description);
        return {
          id: String(m.id || m.name || m.model || ''),
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
        };
      });
    }
  } catch (err) {
    // fallback to generic fetch for non-openai compliant but open-ai shaped APIs
    return tryFetchModelsFromBase(base, apiKey);
  }
  return [];
};

export const getOpenAIClient = (cfg: LlmRuntimeConfig) => {
  const baseURL = ensureOpenAiBaseUrl(cfg.baseUrl, cfg.provider || 'OpenAI');
  const apiKey = validateLlmConfig(cfg, cfg.provider || 'OpenAI');
  return new OpenAI({ baseURL, apiKey: apiKey || 'not-required' });
};

export const runOpenAICompatibleChat = async (
  cfg: LlmRuntimeConfig,
  systemPrompt: string,
  userPrompt: string,
  availableTools: AgentTool[],
  executeToolByName: (name: string, callArgs: Record<string, string>) => Promise<string>,
  log: (msg: string) => void,
  onStream?: (chunk: string) => void,
  chatHistory: ChatMessage[] = [],
) => {
  const base = ensureOpenAiBaseUrl(cfg.baseUrl, cfg.provider || 'OpenAI');
  const apiKey = validateLlmConfig(cfg, cfg.provider || 'OpenAI');

  log(
    `[${cfg.provider || 'LLM'}] Runtime: model=${cfg.model}, base=${base}, key=${maskApiKey(apiKey)}`,
  );

  const client = new OpenAI({ baseURL: base, apiKey: apiKey || 'not-required' });
  const tools = availableTools.length > 0 ? toOpenAiToolDeclarations(availableTools) : undefined;
  const stream = cfg.stream === true && typeof onStream === 'function';
  const timeoutMs = Number(process.env.LLM_CHAT_TIMEOUT_MS || 120000);

  const messages: ChatCompletionMessageParam[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });

  // Map history to OpenAI format
  chatHistory.forEach((msg) => {
    if (msg.role === 'system' || msg.role === 'user' || msg.role === 'assistant') {
      messages.push({ role: msg.role, content: msg.text });
    }
  });

  // Always include the current user turn if not already at the end of history
  const lastHistory = chatHistory.at(-1);
  if (!lastHistory || lastHistory.text !== userPrompt) {
    messages.push({ role: 'user', content: userPrompt });
  }

  // Use Orchestrator for manual loop
  return createChatOrchestrator({
    log,
    executeToolByName,
    onStep: async () => {
      const completion: unknown = await withTimeout(
        client.chat.completions.create({
          model: String(cfg.model),
          messages,
          ...(tools !== undefined && { tools }),
          ...(cfg.temperature !== undefined && { temperature: cfg.temperature }),
          ...(cfg.max_tokens !== undefined && { max_tokens: cfg.max_tokens }),
          ...(cfg.top_p !== undefined && { top_p: cfg.top_p }),
          ...(cfg.presence_penalty !== undefined && { presence_penalty: cfg.presence_penalty }),
          ...(cfg.frequency_penalty !== undefined && {
            frequency_penalty: cfg.frequency_penalty,
          }),
          stream,
        }),
        timeoutMs,
        `Request timed out after ${Math.round(timeoutMs / 1000)}s.`,
      ).catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (/\b401\b/.test(msg))
          throw new Error(`Unauthorized (401). Check API key for ${cfg.provider}.`);
        if (/\b404\b/.test(msg))
          throw new Error(`Model "${cfg.model}" not found (404) at ${base}.`);
        throw err;
      });

      let fullContent = '';
      if (stream) {
        for await (const chunk of completion as AsyncIterable<{
          choices?: { delta?: { content?: unknown } }[];
        }>) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (typeof delta !== 'string') continue;
          if (delta) {
            fullContent += delta;
            onStream(delta);
          }
        }
      } else {
        const first = asRecord(completion)?.['choices'] as unknown[];
        const choice = Array.isArray(first) ? asRecord(first[0]) : undefined;
        const msg = asRecord(choice?.['message']);
        const content = msg?.['content'];
        fullContent =
          typeof content === 'string'
            ? content
            : Array.isArray(content)
              ? (content as ContentPart[]).map((p) => String(p?.text ?? '')).join('')
              : '';
      }

      const choices = asRecord(completion)?.['choices'] as unknown[];
      const firstChoice = !stream && Array.isArray(choices) ? asRecord(choices[0]) : undefined;
      const message = asRecord(firstChoice?.['message']);
      const tool_calls = Array.isArray(message?.['tool_calls'])
        ? (message['tool_calls'] as ToolCall[])
        : [];

      if (tool_calls.length > 0) {
        // These objects come straight from the provider response and are echoed
        // back verbatim, so they keep the SDK's own shape.
        messages.push({
          role: 'assistant',
          content: fullContent,
          tool_calls: tool_calls as ChatCompletionMessageToolCall[],
        });
      }

      return {
        content: fullContent,
        toolCalls: tool_calls.map((tc) => ({
          id: String(tc.id),
          name: String(tc.function?.name),
          args: parseToolArgs(tc.function?.arguments),
          raw: tc,
        })),
      };
    },
    onToolResult: (tc, result) => {
      // `tool_call_id` is the only correlation field the Chat Completions API
      // defines for a tool message; there is no `name`.
      messages.push({ role: 'tool', tool_call_id: tc.id, content: result });
    },
  });
};

export const runDalleImageGeneration = async (
  cfg: LlmRuntimeConfig,
  prompt: string,
  options: { size?: string; model?: string } = {},
) => {
  const client = getOpenAIClient(cfg);
  const response = await client.images.generate({
    model: options.model || 'dall-e-3',
    prompt,
    n: 1,
    size: (options.size as ImageGenerateParams['size']) || '1024x1024',
  });
  return response.data?.[0]?.url || 'Error: No image generated.';
};

export const embedText = async (cfg: LlmRuntimeConfig, input: string): Promise<number[]> => {
  const client = getOpenAIClient(cfg);
  const payload = await client.embeddings.create({
    model: String(cfg.model || 'text-embedding-3-small'),
    input,
  });
  const first = Array.isArray(payload?.data) ? payload.data[0] : undefined;
  const embedding = first?.embedding;
  return Array.isArray(embedding)
    ? embedding.map(Number).filter(Number.isFinite)
    : [];
};
