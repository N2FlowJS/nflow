import { Ollama } from 'ollama';
import type { ChatResponse, Message, Tool } from 'ollama';
import type { ChatMessage } from '@n2flow/types';
import type { LlmRuntimeConfig, AgentTool } from '../types';
import {
  trimTrailingSlash,
  toOpenAiToolDeclarations,
  extractOllamaToolCalls,
  createChatOrchestrator,
} from '../utils';

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
  chatHistory: ChatMessage[] = [],
) => {
  const ollama = getOllamaClient(cfg);
  // Ollama's `Tool` shape is the OpenAI function-declaration shape, so the same
  // declaration builder is reused.
  const tools: Tool[] | undefined =
    availableTools.length > 0 ? toOpenAiToolDeclarations(availableTools) : undefined;
  const stream = cfg.stream === true && typeof onStream === 'function';

  const messages: Message[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });

  // Map history to internal format
  chatHistory.forEach((msg) => {
    if (msg.role === 'system' || msg.role === 'user' || msg.role === 'assistant') {
      messages.push({ role: msg.role, content: msg.text });
    }
  });

  // Always include the current user turn if not already in history
  const lastHistory = chatHistory.at(-1);
  if (!lastHistory || lastHistory.text !== userPrompt) {
    messages.push({ role: 'user', content: userPrompt });
  }

  // 1. Try SDK-managed agent APIs (Speculative). Not present in every SDK
  // version, so it is feature-detected through an index signature rather than
  // asserted on the client type.
  const agents = (ollama as unknown as { agents?: { run?: (req: unknown) => Promise<unknown> } })
    .agents;
  if (agents && typeof agents.run === 'function') {
    try {
      const resp = (await agents.run({
        model: String(cfg.model),
        input: userPrompt,
        tools,
        temperature: cfg.temperature,
        max_output_tokens: cfg.max_tokens,
      })) as { output_text?: unknown; message?: { content?: unknown }; text?: unknown };
      const text = resp?.output_text || resp?.message?.content || resp?.text || '';
      if (text) return String(text);
    } catch {
      // Not supported by this Ollama build; fall through to the manual loop.
    }
  }

  // 2. Use Orchestrator for manual loop
  return createChatOrchestrator({
    log,
    executeToolByName,
    onStep: async () => {
      let content = '';
      let payload: ChatResponse | undefined;
      const chatOptions = {
        model: String(cfg.model),
        messages,
        ...(tools !== undefined && { tools }),
        options: {
          ...(cfg.temperature !== undefined && { temperature: cfg.temperature }),
          ...(cfg.max_tokens !== undefined && { num_predict: cfg.max_tokens }),
          ...(cfg.top_p !== undefined && { top_p: cfg.top_p }),
          ...(cfg.top_k !== undefined && { top_k: cfg.top_k }),
        },
      };

      if (stream) {
        const streamResp = await ollama.chat({ ...chatOptions, stream: true });
        for await (const chunk of streamResp) {
          const delta = chunk.message?.content;
          if (delta) {
            content += delta;
            onStream(delta);
          }
        }
      } else {
        payload = await ollama.chat({ ...chatOptions, stream: false });
        content = typeof payload?.message?.content === 'string' ? payload.message.content : '';
      }

      const toolCalls = extractOllamaToolCalls(payload);
      if (toolCalls.length > 0) {
        // Rebuilt from the normalised fields rather than echoed from the
        // response, so the assistant message always matches Ollama's own shape.
        messages.push({
          role: 'assistant',
          content,
          tool_calls: toolCalls.map((tc) => ({
            function: { name: tc.name, arguments: tc.args },
          })),
        });
      } else {
        messages.push({ role: 'assistant', content });
      }

      return {
        content,
        toolCalls: toolCalls.map((tc) => ({ id: tc.id, name: tc.name, args: tc.args })),
      };
    },
    onToolResult: (tc, result) => {
      // Ollama correlates a tool result by `tool_name`; the Chat Completions
      // style `tool_call_id` is not part of its Message shape.
      messages.push({ role: 'tool', tool_name: tc.name, content: result });
    },
  });
};

export const listModels = async (
  cfg: LlmRuntimeConfig,
): Promise<Array<{ id: string; name?: string; description?: string }>> => {
  const host = trimTrailingSlash(cfg.baseUrl || 'http://localhost:11434');
  try {
    const client = new Ollama({ host });
    const resp = await client.list();
    return (resp?.models ?? []).map((m) => {
      const name = typeof m.name === 'string' && m.name !== '' ? m.name : undefined;
      return {
        id: String(m.name || m.model || ''),
        ...(name !== undefined && { name }),
      };
    });
  } catch {
    // A missing/unreachable Ollama is not an error for model discovery.
    return [];
  }
};

export const embedText = async (cfg: LlmRuntimeConfig, input: string): Promise<number[]> => {
  const ollama = getOllamaClient(cfg);
  const embedResp = await ollama.embed({ model: String(cfg.model || 'nomic-embed-text'), input });
  const vectors = Array.isArray(embedResp?.embeddings) ? embedResp.embeddings : [];
  const first = vectors[0];
  return Array.isArray(first) ? first.map(Number).filter(Number.isFinite) : [];
};
