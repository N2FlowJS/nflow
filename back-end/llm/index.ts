import type { LlmRuntimeConfig, AgentTool, LlmProvider } from './types';
import { runOpenAICompatibleChat, listModels as openaiList, embedText as openaiEmbed } from './openai';
import { runOllamaChat, listModels as ollamaList, embedText as ollamaEmbed } from './ollama';
import { runGoogleChat, listModels as genaiList, embedText as genaiEmbed } from './genai';
import { runAnthropicChat, listModels as anthropicList, embedText as anthropicEmbed } from './anthropic';
import { tryFetchModelsFromBase } from './utils';

export type { LlmRuntimeConfig, AgentTool, LlmProvider };

// ---------------------------------------------------------------------------
// Provider resolution — single source of truth, no duplication
// ---------------------------------------------------------------------------

type Adapter = 'anthropic' | 'google' | 'openai-compat' | 'ollama';

/**
 * Determine which adapter to use given a runtime config.
 * Google provider with an OpenAI-compatible base URL is routed to the openai
 * adapter so it benefits from the full OpenAI streaming / tool-call path.
 */
const resolveAdapter = (cfg: LlmRuntimeConfig): Adapter => {
  const p = (cfg.provider || '').toUpperCase();
  if (p === 'ANTHROPIC') return 'anthropic';
  if (p === 'OLLAMA') return 'ollama';
  if (p === 'GOOGLE' || p === 'GENAI') {
    // If the caller supplied an OpenAI-compatible base URL, prefer that adapter
    if (cfg.baseUrl && (cfg.baseUrl.includes('/openai') || cfg.baseUrl.includes('/v1'))) {
      return 'openai-compat';
    }
    return 'google';
  }
  // Covers: OpenAI, NVIDIA, vLLM, DeepSeek, and any other OpenAI-compat provider
  return 'openai-compat';
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const listModels = async (cfg: LlmRuntimeConfig) => {
  const adapter = resolveAdapter(cfg);
  switch (adapter) {
    case 'anthropic': return anthropicList(cfg);
    case 'google':    return genaiList(cfg);
    case 'ollama':    return ollamaList(cfg);
    default:          return openaiList(cfg);
  }
};

export const runChat = async (
  cfg: LlmRuntimeConfig,
  systemPrompt: string,
  userPrompt: string,
  availableTools: AgentTool[] = [],
  executeToolByName?: (name: string, callArgs: Record<string, string>) => Promise<string>,
  log?: (msg: string) => void,
  onStream?: (chunk: string) => void,
  chatHistory: any[] = [],
) => {
  const safeLog = typeof log === 'function' ? log : () => {};
  const exec = executeToolByName || (async () => '');
  const adapter = resolveAdapter(cfg);

  switch (adapter) {
    case 'anthropic':    return runAnthropicChat(cfg, systemPrompt, userPrompt, availableTools, exec, safeLog, onStream, chatHistory);
    case 'google':       return runGoogleChat(cfg, systemPrompt, userPrompt, availableTools, exec, safeLog, onStream, chatHistory);
    case 'ollama':       return runOllamaChat(cfg, systemPrompt, userPrompt, availableTools, exec, safeLog, onStream, chatHistory);
    default:             return runOpenAICompatibleChat(cfg, systemPrompt, userPrompt, availableTools, exec, safeLog, onStream, chatHistory);
  }
};

export const embedText = async (cfg: LlmRuntimeConfig, input: string) => {
  const adapter = resolveAdapter(cfg);
  switch (adapter) {
    case 'google': return genaiEmbed(cfg, input);
    case 'ollama': return ollamaEmbed(cfg, input);
    default:       return openaiEmbed(cfg, input);
  }
};

export default {
  listModels,
  runChat,
  embedText,
};
