import type { LlmRuntimeConfig, AgentTool, LlmProvider } from './types';
import { runOpenAICompatibleChat, runDalleImageGeneration, listModels as openaiList, embedText as openaiEmbed } from './openai';
import { runOllamaChat, listModels as ollamaList, embedText as ollamaEmbed } from './ollama';
import { runGoogleChat, listModels as genaiList, embedText as genaiEmbed } from './genai';
import { runAnthropicChat, listModels as anthropicList, embedText as anthropicEmbed } from './anthropic';
import { listModels as nvidiaList, runNvidiaChat, embedText as nvidiaEmbed } from './nvidia';
import { tryFetchModelsFromBase } from './utils';
import { createLogger } from '../utils/logger';
import { toErrorMessage } from '../utils/common';

const logger = createLogger('LLM');

export type { LlmRuntimeConfig, AgentTool, LlmProvider };

export class LlmProviderRegistry {
  private static providers: Record<string, LlmProvider> = {};

  static register(provider: LlmProvider) {
    this.providers[provider.name.toLowerCase()] = provider;
  }

  static getProvider(name: string): LlmProvider | undefined {
    const n = name.toLowerCase();
    // Match partial names like 'openai-compatible' or 'google-genai'
    for (const [key, provider] of Object.entries(this.providers)) {
      if (n.includes(key)) return provider;
    }
    return undefined;
  }
}

// Register standard providers
LlmProviderRegistry.register({
  name: 'OpenAI',
  listModels: openaiList,
  runChat: runOpenAICompatibleChat,
  embedText: openaiEmbed
});

LlmProviderRegistry.register({
  name: 'Google',
  listModels: genaiList,
  runChat: runGoogleChat,
  embedText: genaiEmbed
});

LlmProviderRegistry.register({
  name: 'Ollama',
  listModels: ollamaList,
  runChat: runOllamaChat,
  embedText: ollamaEmbed
});

LlmProviderRegistry.register({
  name: 'Anthropic',
  listModels: anthropicList,
  runChat: runAnthropicChat,
  embedText: anthropicEmbed
});

LlmProviderRegistry.register({
  name: 'NVIDIA',
  listModels: async (cfg) => {
    try {
      const resp = await nvidiaList(cfg);
      if (resp.length > 0) return resp;
    } catch (err) {
      logger.warn('NVIDIA listModels fallback', { error: toErrorMessage(err) });
    }
    return openaiList(cfg);
  },
  runChat: runNvidiaChat,
  embedText: nvidiaEmbed
});

LlmProviderRegistry.register({
  name: 'vLLM',
  listModels: openaiList,
  runChat: runOpenAICompatibleChat,
  embedText: openaiEmbed
});

// Provider-aware list models
export const listModels = async (cfg: LlmRuntimeConfig) => {
  const provider = LlmProviderRegistry.getProvider(cfg.provider);
  if (provider) {
    return provider.listModels(cfg);
  }
  return tryFetchModelsFromBase(cfg.baseUrl || '', cfg.apiKey);
};

// Unified chat runner that dispatches to provider-specific implementations
export const runChat = async (
  cfg: LlmRuntimeConfig,
  systemPrompt: string,
  userPrompt: string,
  availableTools: AgentTool[] = [],
  executeToolByName?: (name: string, callArgs: Record<string, string>) => Promise<string>,
  log?: (msg: string) => void,
  onStream?: (chunk: string) => void,
) => {
  const provider = LlmProviderRegistry.getProvider(cfg.provider);
  const safeLog = typeof log === 'function' ? log : () => {};
  const exec = executeToolByName || (async () => '');

  if (provider) {
    return provider.runChat(cfg, systemPrompt, userPrompt, availableTools, exec, safeLog, onStream);
  }

  // Default: OpenAI-compatible endpoints
  return runOpenAICompatibleChat(cfg, systemPrompt, userPrompt, availableTools, exec, safeLog, onStream);
};

export const embedText = async (cfg: LlmRuntimeConfig, input: string) => {
  const provider = LlmProviderRegistry.getProvider(cfg.provider);
  if (provider) {
    return provider.embedText(cfg, input);
  }
  
  // Default to Google/GenAI if no provider matches and no base URL
  if (!cfg.baseUrl) return genaiEmbed(cfg, input);
  
  // Default to OpenAI-compatible for custom base URLs
  return openaiEmbed(cfg, input);
};

export default {
  listModels,
  runChat,
  embedText,
};
