import type { LlmRuntimeConfig, AgentTool } from '../types';
import { trimTrailingSlash, toOpenAiToolDeclarations, clampToolResult, parseToolArgs } from '../utils';
import OpenAI from 'openai';

export const listModels = async (
  cfg: LlmRuntimeConfig,
): Promise<Array<{ id: string; name?: string; description?: string }>> => {
  let baseUrl = trimTrailingSlash(cfg.baseUrl || '');
  if (!baseUrl) {
    console.warn('[NVIDIA] No baseUrl provided');
    return [];
  }

  // NVIDIA NIM requires /v1 in the base URL for OpenAI-compatible endpoints
  if (baseUrl.includes('nvidia.com') && !baseUrl.endsWith('/v1')) {
    baseUrl = `${baseUrl}/v1`;
  }

  console.debug(`[NVIDIA] Listing models from ${baseUrl}`);

  try {
    const client = new OpenAI({
      baseURL: baseUrl,
      apiKey: String(cfg.apiKey || 'not-required'),
      defaultHeaders: {
        'User-Agent': 'N2Flow-Client/1.0',
      },
    }) as any;

    if (client.models && typeof client.models.list === 'function') {
      const resp = await client.models.list();
      const data = Array.isArray(resp?.data) ? resp.data : resp?.models || [];
      const models = (data || []).map((m: any) => ({
        id: String(m.id || m.name || m.model || ''),
        name: m.name || m.id || m.model,
        description: m.description,
      }));

      if (models.length > 0) {
        console.log(`[NVIDIA] Successfully fetched ${models.length} models from OpenAI-compatible API`);
        return models;
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[NVIDIA] Failed to fetch models via OpenAI SDK: ${errorMsg}`);
  }

  return [];
};

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

  const client = new OpenAI({
    baseURL: baseUrl,
    apiKey: String(cfg.apiKey || 'not-required'),
  }) as any;

  const tools = availableTools.length > 0 ? toOpenAiToolDeclarations(availableTools) : undefined;
  const exec = executeToolByName || (async () => '');
  const stream = cfg.stream === true && typeof onStream === 'function';

  console.debug(`[NVIDIA Chat] Provider: ${cfg.provider}, Model: ${cfg.model}, Base: ${baseUrl}, Stream: ${stream}`);

  const toolsWithImpl = (availableTools || []).length > 0 ? (availableTools as AgentTool[]).map(t => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
    run: async (rawArgs: unknown) => {
      try {
        const parsed = parseToolArgs(rawArgs);
        const result = await exec(t.name, parsed);
        return clampToolResult(String(result ?? ''));
      } catch (e) {
        return `Error executing tool ${t.name}: ${String(e)}`;
      }
    },
  })) : undefined;

  const messages: any[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userPrompt });

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

  throw new Error('NVIDIA tool loop exceeded max iterations.');
};

export const embedText = async (cfg: LlmRuntimeConfig, input: string): Promise<number[]> => {
  let baseUrl = trimTrailingSlash(cfg.baseUrl || '');
  if (baseUrl.includes('nvidia.com') && !baseUrl.endsWith('/v1')) {
    baseUrl = `${baseUrl}/v1`;
  }

  const client = new OpenAI({
    baseURL: baseUrl,
    apiKey: String(cfg.apiKey || 'not-required'),
  }) as any;

  const payload = await client.embeddings.create({
    model: String(cfg.model || 'NV-Embed-QA'),
    input
  });
  const first = Array.isArray(payload?.data) ? payload.data[0] : undefined;
  return Array.isArray((first as any)?.embedding)
    ? ((first as any).embedding as number[]).map(Number).filter(Number.isFinite)
    : [];
};
