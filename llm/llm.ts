import { MessagePart } from '../models/MessagePart';
import { llmOpenAI } from './openai';
import { llmGemini } from './gemini';

export type SupportedProvider = 'openai' | 'openai-compatible' | 'custom' | 'grok' | 'gemini';

export interface LLMClientProvider {
  readonly name?: string;
  readonly icon?: string;
  completions: (
    baseURL: string,
    apiKey: string,
    model: string,
    message: MessagePart[],
    options?: any,
    callback?: (result: string) => void
  ) => Promise<string>;
  embeddings: (
    baseURL: string,
    apiKey: string,
    model: string,
    input: string | string[]
  ) => Promise<any>;
  models: (baseURL: string, apiKey: string) => Promise<any>;
}

class LLMDispatcher {
  async completions(
    providerType: SupportedProvider,
    baseURL: string,
    apiKey: string,
    model: string,
    message: MessagePart[],
    options?: any,
    callback?: (result: string) => void
  ): Promise<string> {
    switch (providerType) {
      case 'openai':
      case 'openai-compatible':
      case 'custom':
      case 'grok':
        return llmOpenAI.completions(baseURL, apiKey, model, message, options, callback);
      case 'gemini':
        return llmGemini.completions(baseURL, apiKey, model, message, options, callback);
      default:
        throw new Error(`Unsupported provider type: ${providerType}`);
    }
  }

  async embeddings(
    providerType: SupportedProvider,
    baseURL: string,
    apiKey: string,
    model: string,
    input: string | string[]
  ): Promise<any> {
    switch (providerType) {
      case 'openai':
      case 'openai-compatible':
      case 'custom':
      case 'grok':
        return llmOpenAI.embeddings(baseURL, apiKey, model, input);
      case 'gemini':
        return llmGemini.embeddings(baseURL, apiKey, model, input);
      default:
        throw new Error(`Unsupported provider type: ${providerType}`);
    }
  }

  async models(
    providerType: SupportedProvider,
    baseURL: string,
    apiKey: string
  ): Promise<Array<{ id: string; displayName?: string }>> {
    switch (providerType) {
      case 'openai':
      case 'openai-compatible':
      case 'custom':
      case 'grok':
        // llmOpenAI.models returns OpenAI.Models.Model[]; normalize id/displayName
        const list = await llmOpenAI.models(baseURL, apiKey);
        return list.map((m: any) => ({ id: m.id, displayName: (m as any).display_name || undefined }));
      case 'gemini':
        return llmGemini.models(baseURL, apiKey);
      default:
        throw new Error(`Unsupported provider type: ${providerType}`);
    }
  }

  /**
   * Get a dynamic provider client (no static imports needed on the caller).
   * Note: Callers must still supply baseURL/apiKey; do not expose secrets to browsers.
   */
  getProvider(providerType: SupportedProvider): LLMClientProvider {
    switch (providerType) {
      case 'openai':
      case 'openai-compatible':
      case 'custom':
      case 'grok':
  return llmOpenAI as unknown as LLMClientProvider;
      case 'gemini':
        return llmGemini as unknown as LLMClientProvider;
      default:
        throw new Error(`Unsupported provider type: ${providerType}`);
    }
  }
}

export const llm = new LLMDispatcher();
export default llm;
