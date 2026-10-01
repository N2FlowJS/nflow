import { GoogleGenAI } from '@google/genai';
import type { ChatMessage } from '@n2flow/types';
import type { AgentTool, LlmRuntimeConfig } from '../types';
import { parseToolArgs, toGoogleToolDeclarations, createChatOrchestrator } from '../utils';
import { asRecord } from '../../utils/common';

// ---------------------------------------------------------------------------
// Model listing
// ---------------------------------------------------------------------------

export const listModels = async (
  cfg: LlmRuntimeConfig,
): Promise<Array<{ id: string; name?: string; description?: string }>> => {
  if (!cfg.apiKey) return [];
  try {
    const ai = new GoogleGenAI({ apiKey: cfg.apiKey });
    const resp = asRecord(await ai.models.list());
    const raw = resp?.['models'] ?? resp?.['data'];
    const items: Array<Record<string, unknown>> = Array.isArray(raw) ? raw : [];
    return items.map((m) => {
      const name = m['displayName'] ?? m['name'] ?? m['id'];
      const description = typeof m['description'] === 'string' ? m['description'] : undefined;
      return {
        id: String(m['name'] || m['id'] || ''),
        ...(typeof name === 'string' && name !== '' && { name }),
        ...(description !== undefined && { description }),
      };
    });
  } catch {
    return [];
  }
};

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export const runGoogleChat = async (
  cfg: LlmRuntimeConfig,
  systemPrompt: string,
  userPrompt: string,
  availableTools: AgentTool[] = [],
  executeToolByName?: (name: string, callArgs: Record<string, string>) => Promise<string>,
  log?: (msg: string) => void,
  onStream?: (chunk: string) => void,
  chatHistory: ChatMessage[] = [],
): Promise<string> => {
  if (!cfg.apiKey) throw new Error('Missing API key for Google GenAI');

  const ai = new GoogleGenAI({ apiKey: cfg.apiKey });
  const modelName = String(cfg.model || 'gemini-2.0-flash');
  const toolsDecl =
    availableTools.length > 0 ? toGoogleToolDeclarations(availableTools) : undefined;
  const stream = cfg.stream === true && typeof onStream === 'function';

  // Build the message history in a mutable array that the orchestrator loop
  // extends with assistant + tool-result turns.
  const messages: { role: string; content: string }[] = [];

  // Map history to internal format
  chatHistory.forEach((msg) => {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({ role: msg.role, content: msg.text });
    }
  });

  return createChatOrchestrator({
    log: log ?? (() => {}),
    executeToolByName: executeToolByName ?? (async () => ''),
    onStep: async () => {
      // Build native Google GenAI "contents" array (exclude system messages)
      const nativeContents = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content ?? '' }],
        }));

      // Always include the current user turn if not already in history
      const lastHistory = chatHistory[chatHistory.length - 1];
      if (!lastHistory || lastHistory.text !== userPrompt) {
        nativeContents.push({ role: 'user', parts: [{ text: userPrompt }] });
      }

      const resp = await ai.models.generateContent({
        model: modelName,
        contents: nativeContents,
        config: {
          // Optional settings are omitted rather than sent as `undefined`.
          ...(systemPrompt !== '' && { systemInstruction: systemPrompt }),
          ...(cfg.temperature !== undefined && { temperature: cfg.temperature }),
          ...(cfg.max_tokens !== undefined && { maxOutputTokens: cfg.max_tokens }),
          ...(cfg.top_p !== undefined && { topP: cfg.top_p }),
          ...(cfg.top_k !== undefined && { topK: cfg.top_k }),
          ...(toolsDecl !== undefined && { tools: [{ functionDeclarations: toolsDecl }] }),
        },
      });

      const content: string = resp.text ?? '';

      // Handle streaming if requested (generateContent supports it too via
      // generateContentStream, but here we fall back to a post-hoc split)
      if (stream && content && typeof onStream === 'function') {
        // Emit the full text as a single streaming chunk when using non-stream
        // mode (Google SDK streaming requires a different call).
        onStream(content);
      }

      // Extract function calls from the response
      const rawFunctionCalls = resp.functionCalls ?? [];
      const toolCalls = rawFunctionCalls.map((fc, idx) => ({
        id: fc.id ?? `tool_call_${idx + 1}`,
        name: fc.name ?? '',
        args: parseToolArgs(fc.args ?? fc.args),
      }));

      // Append assistant turn to history for multi-turn tool loops
      messages.push({ role: 'assistant', content });

      return { content, toolCalls };
    },
    onToolResult: (_tc, result) => {
      // Append tool result as a user turn so the next model step sees it
      messages.push({ role: 'user', content: `[Tool result]: ${result}` });
    },
  });
};

// ---------------------------------------------------------------------------
// Embeddings
// ---------------------------------------------------------------------------

export const embedText = async (cfg: LlmRuntimeConfig, input: string): Promise<number[]> => {
  if (!cfg.apiKey) throw new Error('Missing API key for Google GenAI');
  const ai = new GoogleGenAI({ apiKey: cfg.apiKey });
  const embedResp = await ai.models.embedContent({
    model: cfg.model || 'text-embedding-004',
    contents: input,
  });
  return (embedResp.embeddings?.[0]?.values ?? []).map(Number).filter(Number.isFinite);
};
