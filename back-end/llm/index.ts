import type { LlmRuntimeConfig, AgentTool, LlmProvider } from './types';
import { runOpenAICompatibleChat, listModels as openaiList, embedText as openaiEmbed } from './openai';
import { runOllamaChat, listModels as ollamaList, embedText as ollamaEmbed } from './ollama';
import { runGoogleChat, listModels as genaiList, embedText as genaiEmbed } from './genai';
import { runAnthropicChat, listModels as anthropicList, embedText as anthropicEmbed } from './anthropic';
import { tryFetchModelsFromBase } from './utils';

export type { LlmRuntimeConfig, AgentTool, LlmProvider };

// Provider dispatch logic
export const listModels = async (cfg: LlmRuntimeConfig) => {
  const p = (cfg.provider || '').toUpperCase();
  if (p === 'ANTHROPIC') return anthropicList(cfg);
  if (p === 'GOOGLE' || p === 'GENAI') return genaiList(cfg);
  if (p === 'OLLAMA') return ollamaList(cfg);
  return openaiList(cfg);
};

export const runChat = async (
  cfg: LlmRuntimeConfig,
  systemPrompt: string,
  userPrompt: string,
  availableTools: AgentTool[] = [],
  executeToolByName?: (name: string, callArgs: Record<string, string>) => Promise<string>,
  log?: (msg: string) => void,
  onStream?: (chunk: string) => void,
) => {
  const safeLog = typeof log === 'function' ? log : () => {};
  const exec = executeToolByName || (async () => '');
  const p = (cfg.provider || '').toUpperCase();

  if (p === 'ANTHROPIC') return runAnthropicChat(cfg, systemPrompt, userPrompt, availableTools, exec, safeLog, onStream);
  if (p === 'GOOGLE' || p === 'GENAI') return runGoogleChat(cfg, systemPrompt, userPrompt, availableTools, exec, safeLog, onStream);
  if (p === 'OLLAMA') return runOllamaChat(cfg, systemPrompt, userPrompt, availableTools, exec, safeLog, onStream);

  // Default to OpenAI-compatible (covers NVIDIA, vLLM, DeepSeek, etc.)
  return runOpenAICompatibleChat(cfg, systemPrompt, userPrompt, availableTools, exec, safeLog, onStream);
};

export const embedText = async (cfg: LlmRuntimeConfig, input: string) => {
  const p = (cfg.provider || '').toUpperCase();

  if (p === 'GOOGLE' || p === 'GENAI') return genaiEmbed(cfg, input);
  if (p === 'OLLAMA') return ollamaEmbed(cfg, input);
  
  // Default to OpenAI-compatible (covers NVIDIA, etc.)
  return openaiEmbed(cfg, input);
};

export default {
  listModels,
  runChat,
  embedText,
};
