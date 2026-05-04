import type { LlmRuntimeConfig, AgentTool } from '../types';
import { parseToolArgs, clampToolResult } from '../utils';
import * as AnthropicModule from '@anthropic-ai/sdk';

export const runAnthropicChat = async (
  cfg: LlmRuntimeConfig,
  systemPrompt: string,
  userPrompt: string,
  availableTools: AgentTool[],
  executeToolByName: (name: string, callArgs: Record<string, string>) => Promise<string>,
  log: (msg: string) => void,
  onStream?: (chunk: string) => void,
) => {
  const apiKey = String(cfg.apiKey || '');
  if (!apiKey) throw new Error('Missing Anthropic API Key.');
  const stream = cfg.stream === true && typeof onStream === 'function';
  
  // Prefer static Anthropic SDK (imported at top) and use agents/responses when available
  try {
    const mod: any = (AnthropicModule as any) || null;
    const Anthropic = mod?.Anthropic || mod?.default || mod;
    if (Anthropic) {
      const client: any = new Anthropic({ apiKey });

      // agents.run style
      if (client.agents && typeof client.agents.run === 'function') {
        try {
          const toolsDecl = availableTools.length > 0 ? availableTools.map(t => ({ name: t.name, description: t.description, parameters: t.parameters })) : undefined;
          const resp = await client.agents.run({ model: cfg.model || 'claude-3-5-sonnet', input: userPrompt, tools: toolsDecl, temperature: cfg.temperature, max_output_tokens: cfg.max_tokens });
          const text = resp?.output_text || resp?.text || (Array.isArray(resp?.output) && (resp.output[0]?.content?.[0]?.text || resp.output[0]?.text)) || '';
          if (text) return String(text);
        } catch {
          // ignore SDK agent errors and fall back
        }
      }

      // responses.create style
      if (client.responses && typeof client.responses.create === 'function') {
        try {
          const resp = await client.responses.create({ model: cfg.model || 'claude-3-5-sonnet', input: userPrompt, temperature: cfg.temperature, max_output_tokens: cfg.max_tokens });
          const text = resp?.output?.[0]?.content?.find((c: any) => c.type === 'output_text')?.text || resp?.output_text || resp?.message || resp?.text || '';
          if (text) return String(text);
        } catch {
          // ignore and fall back
        }
      }
      
      // messages.create with stream
      if (client.messages && typeof client.messages.create === 'function') {
        try {
          const resp = await client.messages.create({
            model: cfg.model || 'claude-3-5-sonnet-20240620',
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
            max_tokens: cfg.max_tokens || 4096,
            temperature: cfg.temperature,
            top_p: cfg.top_p,
            top_k: cfg.top_k,
            tools: availableTools.length > 0 ? availableTools.map(t => ({
              name: t.name,
              description: t.description,
              input_schema: t.parameters,
            })) : undefined,
            stream: stream,
          });

          if (stream) {
            let fullText = '';
            for await (const chunk of resp) {
              if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
                fullText += chunk.delta.text;
                onStream(chunk.delta.text);
              }
            }
            return fullText;
          } else {
            const text = resp.content?.[0]?.text || '';
            return text || '[Empty model response]';
          }
        } catch {
          // fall back to HTTP
        }
      }
    }
  } catch {
    // ignore SDK init errors
  }

  // Fallback: HTTP messages endpoint with tool loop
  const messages: any[] = [{ role: 'user', content: userPrompt }];

  for (let step = 0; step < 8; step += 1) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: cfg.model || 'claude-3-5-sonnet-20240620',
        system: systemPrompt,
        messages,
        max_tokens: cfg.max_tokens || 4096,
        temperature: cfg.temperature,
        top_p: cfg.top_p,
        top_k: cfg.top_k,
        tools: availableTools.length > 0 ? availableTools.map(t => ({
          name: t.name,
          description: t.description,
          input_schema: t.parameters,
        })) : undefined,
        stream: stream,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic error ${response.status}: ${errText}`);
    }

    if (stream) {
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body for streaming');
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const event = JSON.parse(trimmed.slice(6));
              if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
                fullText += event.delta.text;
                onStream(event.delta.text);
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }

      if (buffer.trim() && buffer.trim() !== 'data: [DONE]') {
        try {
          const event = JSON.parse(buffer.trim().slice(6));
          if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
            fullText += event.delta.text;
            onStream(event.delta.text);
          }
        } catch {}
      }

      return fullText || '[Empty model response]';
    }

    const data: any = await response.json();
    const contentParts = data.content || [];
    const textPart = contentParts.find((p: any) => p.type === 'text');
    const toolUseParts = contentParts.filter((p: any) => p.type === 'tool_use');

    if (toolUseParts.length === 0) {
      return textPart?.text || '[Empty model response]';
    }

    // Prepare assistant message with tool_use for Anthropic's multi-turn
    messages.push({ role: 'assistant', content: (data as any).content });

    for (const tu of toolUseParts) {
      const fnName = tu.name;
      const fnArgs = tu.input || tu.arguments || {};
      log(`[Agent: Claude] Tool call: ${fnName} → ${JSON.stringify(fnArgs)}`);
      const toolResult = await executeToolByName(fnName, fnArgs as Record<string, string>);
      log(`[Agent: Claude] Tool result: ${String(toolResult).substring(0, 120)}`);

      messages.push({
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: tu.id,
            content: clampToolResult(String(toolResult || '')),
          },
        ],
      });
    }
  }

  throw new Error('Anthropic tool loop exceeded max iterations.');
};

export const listModels = async (cfg: LlmRuntimeConfig): Promise<Array<{ id: string; name?: string; description?: string }>> => {
  return [
    { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-5-haiku-latest', name: 'Claude 3.5 Haiku' },
    { id: 'claude-3-opus-latest', name: 'Claude 3 Opus' }
  ];
};

export const embedText = async (cfg: LlmRuntimeConfig, input: string): Promise<number[]> => {
  throw new Error("Anthropic does not currently support native text embeddings.");
};

export default { runAnthropicChat, listModels, embedText };
