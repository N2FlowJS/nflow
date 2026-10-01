import type { ChatMessage } from '@n2flow/types';
import type { AgentTool, LlmRuntimeConfig } from '../types';
import {
  parseToolArgs,
  toAnthropicToolDeclarations,
  createChatOrchestrator,
  tryFetchModelsFromBase,
  type NormalizedToolCall,
} from '../utils';
import { asRecord } from '../../utils/common';

/** The subset of Anthropic's message/content-block shapes this adapter uses. */
type AnthropicTextBlock = { type: 'text'; text: string };
type AnthropicToolResultBlock = { type: 'tool_result'; tool_use_id: string; content: string };
type AnthropicBlock = AnthropicTextBlock | AnthropicToolUseBlock | AnthropicToolResultBlock;
type AnthropicToolUseBlock = {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
};
type AnthropicMessageParam = { role: 'user' | 'assistant'; content: AnthropicBlock[] };

const textBlock = (text: string): AnthropicTextBlock => ({ type: 'text', text });
const toolUseBlock = (
  id: string,
  name: string,
  input: Record<string, unknown>,
): AnthropicToolUseBlock => ({ type: 'tool_use', id, name, input });

export const runAnthropicChat = async (
  cfg: LlmRuntimeConfig,
  systemPrompt: string,
  userPrompt: string,
  availableTools: AgentTool[],
  executeToolByName: (name: string, callArgs: Record<string, string>) => Promise<string>,
  log: (msg: string) => void,
  onStream?: (chunk: string) => void,
  chatHistory: ChatMessage[] = [],
) => {
  const apiKey = String(cfg.apiKey || '');
  if (!apiKey) throw new Error('Missing Anthropic API Key.');
  const stream = cfg.stream === true && typeof onStream === 'function';
  const toolsDecl =
    availableTools.length > 0 ? toAnthropicToolDeclarations(availableTools) : undefined;

  const messages: AnthropicMessageParam[] = [];

  // Map history to Anthropic format
  chatHistory.forEach((msg) => {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({ role: msg.role, content: [textBlock(msg.text)] });
    }
  });

  // Always include the current user turn if not already in history
  const lastHistory = chatHistory.at(-1);
  if (!lastHistory || lastHistory.text !== userPrompt) {
    messages.push({ role: 'user', content: [textBlock(userPrompt)] });
  }

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
      let toolCalls: NormalizedToolCall[] = [];

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
            } catch {
              // Streaming is best-effort; a mid-stream failure just ends the stream.
            }
          }
        }
      } else {
        // Anthropic returns a content-block array; a text block carries the
        // message and tool_use blocks carry the tool calls.
        const data = asRecord(await response.json());
        const blocks = Array.isArray(data?.['content']) ? data['content'] : [];
        content = blocks
          .map((b) => asRecord(b))
          .filter((b) => b?.['type'] === 'text')
          .map((b) => String(b?.['text'] ?? ''))
          .join('');
        toolCalls = blocks
          .map((b) => asRecord(b))
          .filter((b) => b?.['type'] === 'tool_use')
          .map((b) => ({
            id: String(b?.['id'] ?? ''),
            name: String(b?.['name'] ?? ''),
            args: parseToolArgs(b?.['input']),
            raw: b,
          }));
      }

      if (toolCalls.length > 0) {
        messages.push({
          role: 'assistant',
          content: [textBlock(content), ...toolCalls.map((tc) => toolUseBlock(tc.id, tc.name, tc.args))],
        });
      } else {
        messages.push({ role: 'assistant', content: [textBlock(content)] });
      }

      return { content, toolCalls };
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
    },
  });
};

export const listModels = async (
  cfg: LlmRuntimeConfig,
): Promise<Array<{ id: string; name?: string; description?: string }>> => {
  return tryFetchModelsFromBase('https://api.anthropic.com', cfg.apiKey);
};

export const embedText = async (): Promise<number[]> => {
  throw new Error('Anthropic does not currently support native text embeddings.');
};

export default { runAnthropicChat, listModels, embedText };
