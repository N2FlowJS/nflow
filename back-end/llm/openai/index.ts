import OpenAI from 'openai';
import type { LlmRuntimeConfig, AgentTool } from '../types';
import { trimTrailingSlash, normalizeApiKey, toOpenAiToolDeclarations, clampToolResult } from '../utils';

export const listModels = async (
  cfg: LlmRuntimeConfig,
): Promise<Array<{ id: string; name?: string; description?: string }>> => {
  const base = trimTrailingSlash(cfg.baseUrl || 'http://localhost:8000/v1');
  try {
    const client = new OpenAI({ baseURL: base, apiKey: normalizeApiKey(cfg.apiKey) }) as any;
    if (client.models && typeof client.models.list === 'function') {
      const resp = await client.models.list();
      const data = Array.isArray(resp?.data) ? resp.data : resp?.models || [];
      return (data || []).map((m: any) => ({ id: String(m.id || m.name || m.model || ''), name: m.name || m.id || m.model, description: m.description }));
    }
  } catch (err) {
    // ignore
  }
  return [];
};

export const getOpenAIClient = (cfg: LlmRuntimeConfig) => {
  let baseURL = trimTrailingSlash(cfg.baseUrl || 'http://localhost:8000/v1');
  
  // NVIDIA NIM requires /v1 in the base URL for OpenAI-compatible endpoints
  if (cfg.provider === 'NVIDIA' && baseURL.includes('nvidia.com') && !baseURL.endsWith('/v1')) {
    baseURL = `${baseURL}/v1`;
  }
  
  return new OpenAI({ baseURL, apiKey: normalizeApiKey(cfg.apiKey) || 'not-required' });
};

export const runOpenAICompatibleChat = async (
  cfg: LlmRuntimeConfig,
  systemPrompt: string,
  userPrompt: string,
  availableTools: any[],
  executeToolByName: (name: string, callArgs: Record<string, string>) => Promise<string>,
  log: (msg: string) => void,
  onStream?: (chunk: string) => void,
) => {
  const client = getOpenAIClient(cfg) as any;
  const tools = availableTools.length > 0 ? toOpenAiToolDeclarations(availableTools) : undefined;
  const exec = executeToolByName || (async () => '');
  const stream = cfg.stream === true && typeof onStream === 'function';

  const messages: any[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userPrompt });

  // Prefer SDK-managed agent/run APIs when available (lets SDK handle tool invocation)
  try {
    if (client.agents && typeof client.agents.run === 'function') {
      const agentResp = await client.agents.run({
        model: String(cfg.model),
        input: userPrompt,
        tools: tools as any,
        temperature: cfg.temperature,
        max_output_tokens: cfg.max_tokens,
        top_p: cfg.top_p,
        top_k: cfg.top_k,
      });
      const text = agentResp?.output_text || agentResp?.message?.content || (Array.isArray(agentResp?.output) && (agentResp.output[0]?.content?.[0]?.text || agentResp.output[0]?.text)) || (agentResp?.choices?.[0]?.message?.content) || '';
      if (text) return String(text);
    }

    if (client.responses && typeof client.responses.create === 'function') {
      const resp = await client.responses.create({ model: String(cfg.model), input: userPrompt, temperature: cfg.temperature, max_output_tokens: cfg.max_tokens });
      const text = resp?.output?.[0]?.content?.[0]?.text || resp?.output_text || '';
      if (text) return String(text);
    }
  } catch (e) {
    // ignore agent errors and fallback to manual tool loop
  }

  for (let step = 0; step < 8; step += 1) {
    const completion = await client.chat.completions.create({
      model: String(cfg.model),
      messages,
      tools: tools as any,
      temperature: cfg.temperature,
      max_tokens: cfg.max_tokens,
      top_p: cfg.top_p,
      presence_penalty: cfg.presence_penalty,
      frequency_penalty: cfg.frequency_penalty,
      stream: stream,
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
      const message = first?.message || {};
      const content = message?.content;
      if (typeof content === 'string') fullContent = content;
      else if (Array.isArray(content)) {
        fullContent = content
          .map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
          .join('')
          .trim();
      }
    }

    const first = !stream ? (completion.choices?.[0] as any) : null;
    const message = first?.message || {};
    const toolCalls = Array.isArray(message.tool_calls) ? message.tool_calls : [];

    if (toolCalls.length === 0) {
      if (fullContent) return fullContent;
      return '[Empty model response]';
    }

    messages.push({ role: 'assistant', content: fullContent, tool_calls: toolCalls });

    for (const tc of toolCalls) {
      const id = String((tc as any).id || 'tool_call');
      const fn = (tc as any).function || {};
      const fnName = String(fn.name || 'unknown_tool');
      const fnArgs = (tc as any).arguments || tc.arguments || {};
      log(`[Agent] Tool call: ${fnName} → ${JSON.stringify(fnArgs)}`);
      const toolResult = await executeToolByName(fnName, fnArgs as Record<string, string>);
      log(`[Agent] Tool result: ${String(toolResult).substring(0, 120)}`);
      const safeToolResult = clampToolResult(String(toolResult || ''));
      messages.push({ role: 'tool', tool_call_id: id, name: fnName, content: safeToolResult });
    }
  }

  throw new Error('OpenAI-compatible tool loop exceeded max iterations.');
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
