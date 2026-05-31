import { GoogleGenAI } from '@google/genai';
import type { LlmRuntimeConfig, AgentTool } from '../types';
import { parseToolArgs, toGoogleToolDeclarations, createChatOrchestrator } from '../utils';

// ---------------------------------------------------------------------------
// Model listing
// ---------------------------------------------------------------------------

export const listModels = async (
  cfg: LlmRuntimeConfig,
): Promise<Array<{ id: string; name?: string; description?: string }>> => {
  if (!cfg.apiKey) return [];
  try {
    const ai = new GoogleGenAI({ apiKey: cfg.apiKey });
    const resp = await (ai as any).models.list();
    const items: any[] = resp?.models || resp?.data || [];
    return items.map((m: any) => ({
      id: String(m.name || m.id || ''),
      name: m.displayName || m.name || m.id,
      description: m.description,
    }));
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
  chatHistory: any[] = [],
): Promise<string> => {
  if (!cfg.apiKey) throw new Error('Missing API key for Google GenAI');

  const ai = new GoogleGenAI({ apiKey: cfg.apiKey });
  const modelName = String(cfg.model || 'gemini-2.0-flash');
  const toolsDecl = availableTools.length > 0 ? toGoogleToolDeclarations(availableTools) : undefined;
  const stream = cfg.stream === true && typeof onStream === 'function';

  // Build the message history in a mutable array that the orchestrator loop
  // extends with assistant + tool-result turns.
  const messages: { role: string; content: string }[] = [];

  // Map history to internal format
  chatHistory.forEach((msg: any) => {
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

      const resp = await (ai as any).models.generateContent({
        model: modelName,
        contents: nativeContents,
        config: {
          systemInstruction: systemPrompt || undefined,
          temperature: cfg.temperature,
          maxOutputTokens: cfg.max_tokens,
          topP: cfg.top_p,
          topK: cfg.top_k,
          tools: toolsDecl ? [{ functionDeclarations: toolsDecl }] : undefined,
        },
      });

      let content: string = resp.text ?? '';

      // Handle streaming if requested (generateContent supports it too via
      // generateContentStream, but here we fall back to a post-hoc split)
      if (stream && content && typeof onStream === 'function') {
        // Emit the full text as a single streaming chunk when using non-stream
        // mode (Google SDK streaming requires a different call).
        onStream(content);
      }

      // Extract function calls from the response
      const rawFunctionCalls: any[] = resp.functionCalls ?? [];
      const toolCalls = rawFunctionCalls.map((fc: any, idx: number) => ({
        id: fc.id ?? `tool_call_${idx + 1}`,
        name: fc.name ?? '',
        args: parseToolArgs(fc.args ?? fc.arguments),
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
  const embedResp = await (ai as any).models.embedContent({
    model: cfg.model || 'text-embedding-004',
    contents: input,
  });
  return (embedResp.embeddings?.[0]?.values ?? []).map(Number).filter(Number.isFinite);
};
