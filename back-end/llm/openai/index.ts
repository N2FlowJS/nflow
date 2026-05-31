import OpenAI from 'openai';
import type { LlmRuntimeConfig, AgentTool } from '../types';
import { 
  ensureOpenAiBaseUrl, 
  validateLlmConfig,
  toOpenAiToolDeclarations, 
  clampToolResult, 
  createChatOrchestrator, 
  tryFetchModelsFromBase 
} from '../utils';
import { maskApiKey, withTimeout } from '../../utils/common';

export const listModels = async (
  cfg: LlmRuntimeConfig,
): Promise<Array<{ id: string; name?: string; description?: string }>> => {
  const base = ensureOpenAiBaseUrl(cfg.baseUrl, cfg.provider || 'OpenAI');
  const apiKey = validateLlmConfig(cfg, cfg.provider || 'OpenAI');

  try {
    const client = new OpenAI({ baseURL: base, apiKey: apiKey || 'not-required' }) as any;
    if (client.models && typeof client.models.list === 'function') {
      const resp = await client.models.list();
      const data = Array.isArray(resp?.data) ? resp.data : resp?.models || [];
      return (data || []).map((m: any) => ({ 
        id: String(m.id || m.name || m.model || ''), 
        name: m.name || m.id || m.model, 
        description: m.description 
      }));
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
  availableTools: any[],
  executeToolByName: (name: string, callArgs: Record<string, string>) => Promise<string>,
  log: (msg: string) => void,
  onStream?: (chunk: string) => void,
  chatHistory: any[] = [],
) => {
  const base = ensureOpenAiBaseUrl(cfg.baseUrl, cfg.provider || 'OpenAI');
  const apiKey = validateLlmConfig(cfg, cfg.provider || 'OpenAI');
  
  log(`[${cfg.provider || 'LLM'}] Runtime: model=${cfg.model}, base=${base}, key=${maskApiKey(apiKey)}`);

  const client = new OpenAI({ baseURL: base, apiKey: apiKey || 'not-required' });
  const tools = availableTools.length > 0 ? toOpenAiToolDeclarations(availableTools) : undefined;
  const stream = cfg.stream === true && typeof onStream === 'function';
  const timeoutMs = Number(process.env.LLM_CHAT_TIMEOUT_MS || 120000);

  const messages: any[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });

  // Map history to OpenAI format
  chatHistory.forEach((msg: any) => {
    if (msg.role === 'system' || msg.role === 'user' || msg.role === 'assistant') {
      messages.push({ role: msg.role, content: msg.text });
    }
  });

  // Always include the current user turn if not already at the end of history
  const lastHistory = chatHistory[chatHistory.length - 1];
  if (!lastHistory || lastHistory.text !== userPrompt) {
    messages.push({ role: 'user', content: userPrompt });
  }

  // Use Orchestrator for manual loop
  return createChatOrchestrator({
    log,
    executeToolByName,
    onStep: async () => {
      const completion = await withTimeout<any>(
        client.chat.completions.create({
          model: String(cfg.model),
          messages,
          tools: tools as any,
          temperature: cfg.temperature,
          max_tokens: cfg.max_tokens,
          top_p: cfg.top_p,
          presence_penalty: cfg.presence_penalty,
          frequency_penalty: cfg.frequency_penalty,
          stream,
        }),
        timeoutMs,
        `Request timed out after ${Math.round(timeoutMs / 1000)}s.`
      ).catch(err => {
        const msg = err instanceof Error ? err.message : String(err);
        if (/\b401\b/.test(msg)) throw new Error(`Unauthorized (401). Check API key for ${cfg.provider}.`);
        if (/\b404\b/.test(msg)) throw new Error(`Model "${cfg.model}" not found (404) at ${base}.`);
        throw err;
      });

      let fullContent = '';
      if (stream) {
        for await (const chunk of completion) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) {
            fullContent += delta;
            onStream(delta);
          }
        }
      } else {
        const first = completion.choices?.[0] as any;
        const msg = first?.message || {};
        fullContent = typeof msg.content === 'string' ? msg.content : (Array.isArray(msg.content) ? msg.content.map((p: any) => p.text || '').join('') : '');
      }

      const firstChoice = !stream ? (completion.choices?.[0] as any) : null;
      const message = firstChoice?.message || {};
      const tool_calls = Array.isArray(message.tool_calls) ? message.tool_calls : [];

      if (tool_calls.length > 0) {
        messages.push({ role: 'assistant', content: fullContent, tool_calls });
      }

      return {
        content: fullContent,
        toolCalls: tool_calls.map((tc: any) => ({
          id: String(tc.id),
          name: String(tc.function?.name),
          args: tc.function?.arguments ? (typeof tc.function.arguments === 'string' ? JSON.parse(tc.function.arguments) : tc.function.arguments) : {},
          raw: tc
        }))
      };
    },
    onToolResult: (tc, result) => {
      messages.push({ role: 'tool', tool_call_id: tc.id, name: tc.name, content: result });
    }
  });
};

export const runDalleImageGeneration = async (
  cfg: LlmRuntimeConfig,
  prompt: string,
  options: { size?: string; model?: string } = {}
) => {
  const client = getOpenAIClient(cfg) as any;
  const response = await client.images.generate({
    model: options.model || 'dall-e-3',
    prompt,
    n: 1,
    size: (options.size as any) || '1024x1024',
  });
  return response.data[0]?.url || 'Error: No image generated.';
};

export const embedText = async (cfg: LlmRuntimeConfig, input: string): Promise<number[]> => {
  const client = getOpenAIClient(cfg) as any;
  const payload = await client.embeddings.create({ model: String(cfg.model || 'text-embedding-3-small'), input });
  const first = Array.isArray(payload?.data) ? payload.data[0] : undefined;
  return Array.isArray((first as any)?.embedding)
    ? ((first as any).embedding as number[]).map(Number).filter(Number.isFinite)
    : [];
};
