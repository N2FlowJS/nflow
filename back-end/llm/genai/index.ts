import { GoogleGenAI } from '@google/genai';
import type { LlmRuntimeConfig, AgentTool } from '../types';
import { parseToolArgs, toGoogleToolDeclarations, createChatOrchestrator } from '../utils';

export const listModels = async (
  cfg: LlmRuntimeConfig,
): Promise<Array<{ id: string; name?: string; description?: string }>> => {
  if (!cfg.apiKey) return [];
  try {
    const ai: any = new (GoogleGenAI as any)({ apiKey: cfg.apiKey });

    if (ai.models && typeof ai.models.list === 'function') {
      const resp = await ai.models.list();
      const items = resp?.models || resp?.data || [];
      return (items || []).map((m: any) => ({ id: String(m.name || m.id || m.model || ''), name: m.displayName || m.name || m.id, description: m.description }));
    }
  } catch (err) {
    // ignore
  }
  return [];
};

export const runGoogleChat = async (
  cfg: LlmRuntimeConfig,
  systemPrompt: string,
  userPrompt: string,
  availableTools: AgentTool[] = [],
  executeToolByName?: (name: string, callArgs: Record<string, string>) => Promise<string>,
  log?: (msg: string) => void,
  onStream?: (chunk: string) => void,
) => {
  if (!cfg.apiKey) throw new Error('Missing API key for Google GenAI');
  const ai: any = new (GoogleGenAI as any)({ apiKey: cfg.apiKey });
  const modelName = String(cfg.model || '');
  const messages: any[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userPrompt });
  const stream = cfg.stream === true && typeof onStream === 'function';

  const toolsDecl = availableTools.length > 0 ? toGoogleToolDeclarations(availableTools) : undefined;

  try {
    if (ai.agents && typeof ai.agents.run === 'function') {
      const agentResp = await ai.agents.run({ model: modelName, input: userPrompt, tools: toolsDecl, temperature: cfg.temperature, max_output_tokens: cfg.max_tokens });
      const text = agentResp?.output_text || agentResp?.text || (Array.isArray(agentResp?.output) && (agentResp.output[0]?.content?.[0]?.text || agentResp.output[0]?.text)) || '';
      if (text) return String(text);
    }
  } catch (err) {
    // ignore and fall back to standard SDK calls
  }

  // Orchestrator for manual loop (fallback if SDK doesn't handle tool calls automatically)
  return createChatOrchestrator({
    log: log || (() => {}),
    executeToolByName: executeToolByName || (async () => ''),
    onStep: async () => {
      // Try several SDK method shapes
      let content = '';
      let tool_calls: any[] = [];

      try {
        // ai.chat.create
        if (ai.chat && typeof ai.chat.create === 'function') {
          const resp = await ai.chat.create({ model: modelName, messages, tools: toolsDecl, temperature: cfg.temperature, max_tokens: cfg.max_tokens, stream: stream });
          
          if (stream) {
            for await (const chunk of resp) {
              const delta = chunk.text || chunk.candidates?.[0]?.content || '';
              if (delta) {
                content += delta;
                onStream!(delta);
              }
            }
          } else {
            content = resp?.output_text || resp?.text || (Array.isArray(resp?.candidates) && (resp.candidates[0]?.content?.parts?.[0]?.text || resp.candidates[0]?.content)) || (resp?.choices?.[0]?.message?.content) || (resp?.messages?.[0]?.content) || '';
            tool_calls = resp?.candidates?.[0]?.content?.parts?.filter((p: any) => p.functionCall) || [];
          }
        } else if (ai.chat?.completions && typeof ai.chat.completions.create === 'function') {
           // ai.chat.completions.create
          const resp = await ai.chat.completions.create({ model: modelName, messages, tools: toolsDecl, temperature: cfg.temperature, max_tokens: cfg.max_tokens, stream: stream });
          
          if (stream) {
            for await (const chunk of resp) {
              const delta = chunk.choices?.[0]?.message?.content || chunk.choices?.[0]?.text || '';
              if (delta) {
                content += delta;
                onStream!(delta);
              }
            }
          } else {
            content = resp?.output_text || resp?.text || (Array.isArray(resp?.choices) && (resp.choices[0]?.message?.content || resp.choices[0]?.text)) || '';
            tool_calls = resp?.choices?.[0]?.message?.tool_calls || [];
          }
        }
      } catch (err) {
        // fall through
      }

      if (tool_calls.length > 0) {
        messages.push({ role: 'assistant', content, tool_calls });
      } else {
        messages.push({ role: 'assistant', content });
      }

      return {
        content,
        toolCalls: tool_calls.map((tc: any) => ({
          id: tc.id || tc.functionCall?.name,
          name: tc.name || tc.functionCall?.name,
          args: parseToolArgs(tc.args || tc.functionCall?.args)
        }))
      };
    },
    onToolResult: (tc, result) => {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'tool_response',
            tool_call_id: tc.id,
            content: result,
          },
        ],
      });
    }
  });
};

export const embedText = async (cfg: LlmRuntimeConfig, input: string): Promise<number[]> => {
  if (!cfg.apiKey) throw new Error('Missing API key for Google GenAI');
  const ai: any = new (GoogleGenAI as any)({ apiKey: cfg.apiKey });
  const embedResp = await ai.models.embedContent({ model: cfg.model || 'text-embedding-004', contents: input });
  return (embedResp.embeddings?.[0]?.values || []).map(Number).filter(Number.isFinite);
};
