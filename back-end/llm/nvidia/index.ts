import type { ChatCompletionMessageParam, ChatCompletionMessageToolCall } from 'openai/resources/chat/completions';
import type { AgentTool, LlmRuntimeConfig } from '../types';
import {
  trimTrailingSlash,
  hasTemplatePlaceholder,
  toOpenAiToolDeclarations,
  createChatOrchestrator,
  normalizeChatCompletion,
} from '../utils';
import { maskApiKey, normalizeApiKey, withTimeout } from '../../utils/common';
import OpenAI from 'openai';

import { listModels as listOpenAIModels } from '../openai';

const NVIDIA_CHAT_TIMEOUT_MS = Number(process.env.NVIDIA_CHAT_TIMEOUT_MS || 120000);

export const listModels = listOpenAIModels;

export const runNvidiaChat = async (
  cfg: LlmRuntimeConfig,
  systemPrompt: string,
  userPrompt: string,
  availableTools: AgentTool[],
  executeToolByName: (name: string, callArgs: Record<string, string>) => Promise<string>,
  log: (msg: string) => void,
  onStream?: (chunk: string) => void,
) => {
  let baseUrl = trimTrailingSlash(cfg.baseUrl || '');
  if (baseUrl.includes('nvidia.com') && !baseUrl.endsWith('/v1')) {
    baseUrl = `${baseUrl}/v1`;
  }

  if (hasTemplatePlaceholder(cfg.apiKey)) {
    throw new Error(
      'NVIDIA API key placeholder was not resolved. Check the selected Global Variable name and ensure it has a value.',
    );
  }

  const normalizedApiKey = normalizeApiKey(cfg.apiKey);

  if (!normalizedApiKey) {
    throw new Error(
      'Missing NVIDIA API key. Enter a value or select a Global Variable with a non-empty value.',
    );
  }

  log(
    `[NVIDIA] Runtime config: model=${String(cfg.model || '')}, baseUrl=${baseUrl || '[missing]'}, apiKey=${maskApiKey(normalizedApiKey)}`,
  );

  const client = new OpenAI({ baseURL: baseUrl, apiKey: normalizedApiKey });

  const tools = availableTools.length > 0 ? toOpenAiToolDeclarations(availableTools) : undefined;
  const exec = executeToolByName || (async () => '');
  const stream = cfg.stream === true && typeof onStream === 'function';

  const messages: ChatCompletionMessageParam[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userPrompt });

  return createChatOrchestrator({
    log,
    executeToolByName: exec,
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
        NVIDIA_CHAT_TIMEOUT_MS,
        `NVIDIA chat request timed out after ${Math.round(NVIDIA_CHAT_TIMEOUT_MS / 1000)}s.`,
      ).catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        if (/\b401\b/.test(message)) {
          throw new Error(
            'Unauthorized by NVIDIA NIM (401). Check API key value, remove any leading "Bearer ", and verify the selected key/global variable is correct.',
          );
        }
        if (/\b404\b/.test(message)) {
          const modelName = String(cfg.model || '').trim() || '[missing model]';
          throw new Error(
            `NVIDIA NIM returned 404 for model "${modelName}". Auth appears OK, but this model id is likely not available on the chat endpoint. For Gemma, use a chat/instruct variant such as "google/gemma-2-2b-it" or "google/gemma-3-27b-it", or choose directly from Fetch Models.`,
          );
        }
        throw err;
      });

      let fullContent = '';
      if (stream) {
        for await (const chunk of completion as AsyncIterable<{
          choices?: { delta?: { content?: unknown } }[];
        }>) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (typeof delta !== 'string') continue;
          fullContent += delta;
          onStream?.(delta);
        }
      }

      const step = stream
        ? { content: fullContent, toolCalls: [] }
        : normalizeChatCompletion(completion);

      if (step.toolCalls.length > 0) {
        messages.push({
          role: 'assistant',
          content: step.content,
          tool_calls: step.toolCalls.map((tc) => tc.raw) as ChatCompletionMessageToolCall[],
        });
      } else {
        messages.push({ role: 'assistant', content: step.content });
      }

      return step;
    },
    onToolResult: (tc, result) => {
      // Only `tool_call_id` is defined for a tool message in the Chat
      // Completions API; there is no `name` field.
      messages.push({ role: 'tool', tool_call_id: tc.id, content: result });
    },
  });
};

export const embedText = async (cfg: LlmRuntimeConfig, input: string): Promise<number[]> => {
  let baseUrl = trimTrailingSlash(cfg.baseUrl || '');
  if (baseUrl.includes('nvidia.com') && !baseUrl.endsWith('/v1')) {
    baseUrl = `${baseUrl}/v1`;
  }

  const client = new OpenAI({
    baseURL: baseUrl,
    apiKey: normalizeApiKey(cfg.apiKey) || 'not-required',
  });

  const payload = await client.embeddings.create({
    model: String(cfg.model || 'NV-Embed-QA'),
    input,
  });
  const first = Array.isArray(payload?.data) ? payload.data[0] : undefined;
  const embedding = first?.embedding;
  return Array.isArray(embedding) ? embedding.map(Number).filter(Number.isFinite) : [];
};
