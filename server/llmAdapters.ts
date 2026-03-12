import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { Ollama } from 'ollama';

export type AgentTool = {
  type: 'tool';
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  nodeId: string;
  embeddingModel?: {
    kind: 'llm_embedding';
    provider?: string;
    model: string;
    apiKey?: string;
    baseUrl?: string;
  };
};

export type LlmRuntimeConfig = {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl: string;
};

const trimTrailingSlash = (url: unknown) => String(url || '').replace(/\/+$/, '');

const getOpenAIClient = (cfg: LlmRuntimeConfig) => {
  const baseURL = trimTrailingSlash(cfg.baseUrl || 'http://localhost:8000/v1');
  return new OpenAI({
    baseURL,
    apiKey: String(cfg.apiKey || 'not-required'),
  });
};

const getOllamaClient = (cfg: LlmRuntimeConfig) => {
  const host = trimTrailingSlash(cfg.baseUrl || 'http://localhost:11434');
  return new Ollama({ host });
};

const toOpenAiToolDeclarations = (tools: AgentTool[]) =>
  tools.map(t => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));

const parseToolArgs = (rawArgs: unknown): Record<string, string> => {
  if (rawArgs && typeof rawArgs === 'object') {
    return Object.fromEntries(Object.entries(rawArgs).map(([key, value]) => [key, String(value ?? '')]));
  }
  if (typeof rawArgs !== 'string') return {};
  try {
    const parsed = JSON.parse(rawArgs) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, String(value ?? '')]));
  } catch {
    return {};
  }
};

const MAX_TOOL_RESULT_CHARS = 12000;
const clampToolResult = (value: string): string => {
  if (value.length <= MAX_TOOL_RESULT_CHARS) return value;
  return `${value.slice(0, MAX_TOOL_RESULT_CHARS)}\n...[truncated ${value.length - MAX_TOOL_RESULT_CHARS} chars]`;
};

const extractOllamaToolCalls = (payload: any) => {
  const candidates: any[] = [];
  if (payload?.message && typeof payload.message === 'object') {
    const msg = payload.message;
    if (Array.isArray(msg.tool_calls)) candidates.push(...msg.tool_calls);
    if (msg.function_call && typeof msg.function_call === 'object') candidates.push(msg.function_call);
  }
  if (Array.isArray(payload?.tool_calls)) candidates.push(...payload.tool_calls);
  if (payload?.function_call && typeof payload.function_call === 'object') candidates.push(payload.function_call);

  return candidates
    .map((entry, index) => {
      if (!entry || typeof entry !== 'object') return null;
      const raw = entry;
      const fnContainer = (raw.function && typeof raw.function === 'object') ? raw.function : raw;
      const fnName = String(fnContainer.name || raw.name || '').trim();
      if (!fnName) return null;
      const rawArgs = fnContainer.arguments ?? fnContainer.args ?? fnContainer.parameters ?? raw.arguments ?? raw.args ?? raw.parameters;
      return {
        id: String(raw.id || fnContainer.id || `tool_call_${index + 1}`),
        name: fnName,
        args: parseToolArgs(rawArgs),
        raw,
      };
    })
    .filter(Boolean) as Array<{ id: string; name: string; args: Record<string, string>; raw: Record<string, unknown> }>;
};

export const runOpenAICompatibleChat = async (
  cfg: LlmRuntimeConfig,
  systemPrompt: string,
  userPrompt: string,
  availableTools: AgentTool[],
  executeToolByName: (name: string, callArgs: Record<string, string>) => Promise<string>,
  log: (msg: string) => void,
) => {
  const client = getOpenAIClient(cfg);
  const tools = availableTools.length > 0 ? toOpenAiToolDeclarations(availableTools) : undefined;

  const messages: any[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userPrompt });

  for (let step = 0; step < 8; step += 1) {
    const completion = await client.chat.completions.create({
      model: String(cfg.model),
      messages,
      tools: tools as any,
    });

    const first = completion.choices?.[0] as any;
    const message = first?.message || {};
    const toolCalls = Array.isArray(message.tool_calls) ? message.tool_calls : [];

    if (toolCalls.length === 0) {
      const content = message?.content;
      if (typeof content === 'string') return content || '[Empty model response]';
      if (Array.isArray(content)) {
        const text = content
          .map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
          .join('')
          .trim();
        return text || '[Empty model response]';
      }
      return '[Empty model response]';
    }

    messages.push({ role: 'assistant', content: typeof message.content === 'string' ? message.content : '', tool_calls: toolCalls });

    for (const tc of toolCalls) {
      const id = String((tc as any).id || 'tool_call');
      const fn = (tc as any).function || {};
      const fnName = String(fn.name || 'unknown_tool');
      const fnArgs = parseToolArgs(fn.arguments);
      log(`[Agent] Tool call: ${fnName} → ${JSON.stringify(fnArgs)}`);
      const toolResult = await executeToolByName(fnName, fnArgs);
      log(`[Agent] Tool result: ${String(toolResult).substring(0, 120)}`);
      const safeToolResult = clampToolResult(String(toolResult || ''));
      messages.push({ role: 'tool', tool_call_id: id, name: fnName, content: safeToolResult });
    }
  }

  throw new Error('OpenAI-compatible tool loop exceeded max iterations.');
};

export const runOllamaChat = async (
  cfg: LlmRuntimeConfig,
  systemPrompt: string,
  userPrompt: string,
  availableTools: AgentTool[],
  executeToolByName: (name: string, callArgs: Record<string, string>) => Promise<string>,
  log: (msg: string) => void,
) => {
  const ollama = getOllamaClient(cfg);
  const tools = availableTools.length > 0 ? toOpenAiToolDeclarations(availableTools) : undefined;

  const messages: any[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userPrompt });

  for (let step = 0; step < 8; step += 1) {
    const payload = await ollama.chat({
      model: String(cfg.model),
      stream: false,
      messages,
      tools: tools as any,
    });
    const content = typeof payload?.message?.content === 'string' ? payload.message.content : '';
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

export const runGoogleChat = async (
  cfg: LlmRuntimeConfig,
  systemPrompt: string,
  userPrompt: string,
  availableTools: AgentTool[],
  executeToolByName: (name: string, callArgs: Record<string, string>) => Promise<string>,
) => {
  if (!cfg.apiKey) {
    throw new Error('Missing API key for Google model.');
  }

  const ai = new GoogleGenAI({ apiKey: cfg.apiKey });
  const functionDeclarations = availableTools.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }));
  const toolsConfig = functionDeclarations.length > 0 ? [{ functionDeclarations }] : undefined;

  const chat = ai.chats.create({
    model: cfg.model,
    config: { systemInstruction: systemPrompt, tools: toolsConfig },
  });

  let agentResponse = await chat.sendMessage({ message: String(userPrompt) });
  while (agentResponse.functionCalls && agentResponse.functionCalls.length > 0) {
    const call = agentResponse.functionCalls[0];
    const toolResult = await executeToolByName(String(call.name), parseToolArgs(call.args));
    agentResponse = await chat.sendMessage({
      message: [{ functionResponse: { name: call.name, response: { result: toolResult } } }],
    });
  }

  return agentResponse.text;
};

export const runEmbeddingByProvider = async (cfg: LlmRuntimeConfig, input: string): Promise<number[]> => {
  const provider = String(cfg.provider || 'Google').toLowerCase();

  if (provider === 'ollama') {
    const ollama = getOllamaClient(cfg);
    const embedResp = await ollama.embed({
      model: String(cfg.model),
      input,
    });
    const vectors = Array.isArray(embedResp?.embeddings) ? embedResp.embeddings : [];
    const first = vectors[0];
    return Array.isArray(first) ? first.map(Number).filter(Number.isFinite) : [];
  }

  if (provider === 'vllm' || provider === 'openai') {
    const client = getOpenAIClient(cfg);
    const payload = await client.embeddings.create({
      model: String(cfg.model),
      input,
    });
    const first = Array.isArray(payload?.data) ? payload.data[0] : undefined;
    return Array.isArray((first as any)?.embedding)
      ? ((first as any).embedding as number[]).map(Number).filter(Number.isFinite)
      : [];
  }

  if (!cfg.apiKey) throw new Error('Missing API key for Google embedding model.');
  const ai = new GoogleGenAI({ apiKey: cfg.apiKey });
  const embedResp = await ai.models.embedContent({ model: cfg.model, contents: input });
  return (embedResp.embeddings?.[0]?.values || []).map(Number).filter(Number.isFinite);
};
