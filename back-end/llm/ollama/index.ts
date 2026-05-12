import { Ollama } from 'ollama';
import type { LlmRuntimeConfig, AgentTool } from '../types';
import { trimTrailingSlash, toOpenAiToolDeclarations, extractOllamaToolCalls, clampToolResult } from '../utils';

const getOllamaClient = (cfg: LlmRuntimeConfig) => {
  const host = trimTrailingSlash(cfg.baseUrl || 'http://localhost:11434');
  return new Ollama({ host });
};

export const runOllamaChat = async (
  cfg: LlmRuntimeConfig,
  systemPrompt: string,
  userPrompt: string,
  availableTools: AgentTool[],
  executeToolByName: (name: string, callArgs: Record<string, string>) => Promise<string>,
  log: (msg: string) => void,
  onStream?: (chunk: string) => void,
) => {
  const ollama = getOllamaClient(cfg);
  const ollamaAny = ollama as any;
  const tools = availableTools.length > 0 ? toOpenAiToolDeclarations(availableTools) : undefined;
  const stream = cfg.stream === true && typeof onStream === 'function';

  const messages: any[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userPrompt });

  // Prefer Ollama SDK-managed agents if present
  if (ollamaAny.agents && typeof ollamaAny.agents.run === 'function') {
    try {
      const resp = await ollamaAny.agents.run({ model: String(cfg.model), input: userPrompt, tools: tools as any, temperature: cfg.temperature, max_output_tokens: cfg.max_tokens });
      const text = resp?.output_text || resp?.message?.content || resp?.text || '';
      if (text) return String(text);
    } catch {
      // fallback to manual loop
    }
  }

  for (let step = 0; step < 8; step += 1) {
    let content = '';
    let payload: any;
    const chatOptions = {
      model: String(cfg.model),
      messages,
      tools: tools as any,
      options: {
        temperature: cfg.temperature,
        num_predict: cfg.max_tokens,
        top_p: cfg.top_p,
        top_k: cfg.top_k,
      }
    };

    if (stream) {
      const streamResp = await (ollamaAny.chat as any)({ ...chatOptions, stream: true });

      for await (const chunk of streamResp) {
        const delta = chunk.message?.content;
        if (delta) {
          content += delta;
          onStream(delta);
        }
      }
    } else {
      payload = await (ollamaAny.chat as any)({ ...chatOptions, stream: false });
      content = typeof payload?.message?.content === 'string' ? payload.message.content : '';
    }
    
    const toolCalls = extractOllamaToolCalls(payload as any);

    if (toolCalls.length === 0) {
      return content || '[Empty model response]';
    }

    messages.push({ role: 'assistant', content, tool_calls: toolCalls.map(tc => tc.raw) });

    for (const tc of toolCalls) {
      log(`[Agent] Tool call: ${tc.name} → ${JSON.stringify(tc.args)}`);
      const toolResult = await executeToolByName(tc.name, tc.args);
      log(`[Agent] Tool result: ${String(toolResult).substring(0, 120)}`);
      const safeToolResult = clampToolResult(String(toolResult || ''));
      messages.push({
        role: 'tool',
        id: tc.id,
        tool_call_id: tc.id,
        name: tc.name,
        tool_name: tc.name,
        content: safeToolResult,
      });
    }
  }

  throw new Error('Ollama tool loop exceeded max iterations.');
};

export const listModels = async (
  cfg: LlmRuntimeConfig,
): Promise<Array<{ id: string; name?: string; description?: string }>> => {
  const host = trimTrailingSlash(cfg.baseUrl || 'http://localhost:11434');
  try {
    const client: any = new Ollama({ host });
    // Ollama client may expose models() or models list
    if (typeof client.models === 'function') {
      const resp = await client.models();
      const items = Array.isArray(resp) ? resp : resp?.models || [];
      return (items || []).map((m: any) => ({ id: String(m.name || m.model || m.id || ''), name: m.name || m.model || m.id, description: m.description }));
    }
  } catch (err) {
    // ignore
  }
  return [];
};

export const embedText = async (cfg: LlmRuntimeConfig, input: string): Promise<number[]> => {
  const ollama = getOllamaClient(cfg);
  const embedResp = await ollama.embed({ model: String(cfg.model || 'nomic-embed-text'), input });
  const vectors = Array.isArray(embedResp?.embeddings) ? embedResp.embeddings : [];
  const first = vectors[0];
  return Array.isArray(first) ? first.map(Number).filter(Number.isFinite) : [];
};
