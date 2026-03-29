import { GoogleGenAI } from '@google/genai';
import type { LlmRuntimeConfig, AgentTool } from '../types';
import { parseToolArgs, clampToolResult } from '../utils';

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
) => {
  if (!cfg.apiKey) throw new Error('Missing API key for Google GenAI');
  const ai: any = new (GoogleGenAI as any)({ apiKey: cfg.apiKey });
  const modelName = String(cfg.model || '');
  const messages: any[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userPrompt });

  // Prefer provider agent APIs when available (lets SDK manage tool calls)
  const exec = executeToolByName || (async () => '');
  const toolsDecl = availableTools.length > 0 ? availableTools.map(t => ({ name: t.name, description: t.description, parameters: t.parameters })) : undefined;
  const toolsWithImpl = (availableTools || []).length > 0 ? (availableTools as AgentTool[]).map(t => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
    run: async (rawArgs: unknown) => {
      try {
        const parsed = parseToolArgs(rawArgs);
        const res = await exec(t.name, parsed);
        return clampToolResult(String(res ?? ''));
      } catch (e) {
        return `Error executing tool ${t.name}: ${String(e)}`;
      }
    },
  })) : undefined;

  try {
    if (ai.agents && typeof ai.agents.run === 'function') {
      const agentResp = await ai.agents.run({ model: modelName, input: userPrompt, tools: toolsWithImpl || toolsDecl, temperature: cfg.temperature, max_output_tokens: cfg.max_tokens });
      const text = agentResp?.output_text || agentResp?.text || (Array.isArray(agentResp?.output) && (agentResp.output[0]?.content?.[0]?.text || agentResp.output[0]?.text)) || '';
      if (text) return String(text);
    }
  } catch (err) {
    // ignore and fall back to standard SDK calls
  }

  // Try several SDK method shapes
  try {
    // ai.chat.create
    if (ai.chat && typeof ai.chat.create === 'function') {
      const resp = await ai.chat.create({ model: modelName, messages, temperature: cfg.temperature, max_tokens: cfg.max_tokens });
      const text = resp?.output_text || resp?.text || (Array.isArray(resp?.candidates) && resp.candidates[0]?.content) || (resp?.choices?.[0]?.message?.content) || (resp?.messages?.[0]?.content);
      return String(text || '');
    }

    // ai.chat.completions.create
    if (ai.chat?.completions && typeof ai.chat.completions.create === 'function') {
      const resp = await ai.chat.completions.create({ model: modelName, messages, temperature: cfg.temperature, max_tokens: cfg.max_tokens });
      const text = resp?.output_text || resp?.text || (Array.isArray(resp?.choices) && (resp.choices[0]?.message?.content || resp.choices[0]?.text)) || '';
      return String(text || '');
    }

    // ai.models.generate
    if (ai.models && typeof ai.models.generate === 'function') {
      const resp = await ai.models.generate({ model: modelName, input: messages.map(m => m.content).join('\n'), temperature: cfg.temperature, max_output_tokens: cfg.max_tokens });
      const text = resp?.output?.[0]?.content?.[0]?.text || resp?.output_text || '';
      return String(text || '');
    }
  } catch (err) {
    // fall through
  }

  throw new Error('Google GenAI chat failed');
};

export const embedText = async (cfg: LlmRuntimeConfig, input: string): Promise<number[]> => {
  if (!cfg.apiKey) throw new Error('Missing API key for Google GenAI');
  const ai: any = new (GoogleGenAI as any)({ apiKey: cfg.apiKey });
  const embedResp = await ai.models.embedContent({ model: cfg.model || 'text-embedding-004', contents: input });
  return (embedResp.embeddings?.[0]?.values || []).map(Number).filter(Number.isFinite);
};
