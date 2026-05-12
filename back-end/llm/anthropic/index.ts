import type { LlmRuntimeConfig, AgentTool } from '../types';
import { parseToolArgs, clampToolResult, toAnthropicToolDeclarations, createChatOrchestrator, tryFetchModelsFromBase } from '../utils';
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
  const toolsDecl = availableTools.length > 0 ? toAnthropicToolDeclarations(availableTools) : undefined;
  
  // 1. Try SDK-managed agent/run APIs (Speculative)
  try {
    const mod: any = (AnthropicModule as any) || null;
    const Anthropic = mod?.Anthropic || mod?.default || mod;
    if (Anthropic) {
      const client: any = new Anthropic({ apiKey });

      if (client.agents && typeof client.agents.run === 'function') {
        const resp = await client.agents.run({ 
          model: cfg.model || 'claude-3-5-sonnet', 
          input: userPrompt, 
          tools: toolsDecl, 
          temperature: cfg.temperature, 
          max_output_tokens: cfg.max_tokens 
        });
        const text = resp?.output_text || resp?.text || (Array.isArray(resp?.output) && (resp.output[0]?.content?.[0]?.text || resp.output[0]?.text)) || '';
        if (text) return String(text);
      }
    }
  } catch { /* ignore */ }

  const messages: any[] = [{ role: 'user', content: userPrompt }];

  // 2. Use Orchestrator for manual loop
  return createChatOrchestrator({
    log,
    executeToolByName,
    onStep: async () => {
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
          tools: toolsDecl,
          stream: stream,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Anthropic error ${response.status}: ${errText}`);
      }

      let content = '';
      let tool_calls: any[] = [];

      if (stream) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body for streaming');
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content_block_delta' && data.delta?.text) {
                content += data.delta.text;
                onStream(data.delta.text);
              }
            } catch {}
          }
        }
      } else {
        const data = (await response.json()) as any;
        content = data.content?.find((c: any) => c.type === 'text')?.text || '';
        tool_calls = data.content?.filter((c: any) => c.type === 'tool_use') || [];
      }

      if (tool_calls.length > 0) {
        messages.push({ role: 'assistant', content, tool_calls });
      } else {
        messages.push({ role: 'assistant', content });
      }

      return {
        content,
        toolCalls: tool_calls.map((tc: any) => ({
          id: tc.id,
          name: tc.name,
          args: parseToolArgs(tc.input)
        }))
      };
    },
    onToolResult: (tc, result) => {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: tc.id,
            content: result,
          },
        ],
      });
    }
  });
};

export const listModels = async (cfg: LlmRuntimeConfig): Promise<Array<{ id: string; name?: string; description?: string }>> => {
  return tryFetchModelsFromBase('https://api.anthropic.com', cfg.apiKey);
};

export const embedText = async (cfg: LlmRuntimeConfig, input: string): Promise<number[]> => {
  throw new Error("Anthropic does not currently support native text embeddings.");
};

export default { runAnthropicChat, listModels, embedText };

