import type { LlmRuntimeConfig, AgentTool } from "../types";
import {
  trimTrailingSlash,
  hasTemplatePlaceholder,
  toOpenAiToolDeclarations,
  clampToolResult,
  createChatOrchestrator,
} from "../utils";
import { maskApiKey, normalizeApiKey, toErrorMessage, withTimeout } from "../../utils/common";
import { createLogger } from "../../utils/logger";
import OpenAI from "openai";

import { listModels as listOpenAIModels, runOpenAICompatibleChat } from "../openai";

const logger = createLogger("NVIDIA");
const NVIDIA_CHAT_TIMEOUT_MS = Number(
  process.env.NVIDIA_CHAT_TIMEOUT_MS || 120000,
);

export const listModels = listOpenAIModels;

export const runNvidiaChat = async (
  cfg: LlmRuntimeConfig,
  systemPrompt: string,
  userPrompt: string,
  availableTools: AgentTool[],
  executeToolByName: (
    name: string,
    callArgs: Record<string, string>,
  ) => Promise<string>,
  log: (msg: string) => void,
  onStream?: (chunk: string) => void,
) => {
  let baseUrl = trimTrailingSlash(cfg.baseUrl || "");
  if (baseUrl.includes("nvidia.com") && !baseUrl.endsWith("/v1")) {
    baseUrl = `${baseUrl}/v1`;
  }

  if (hasTemplatePlaceholder(cfg.apiKey)) {
    throw new Error(
      "NVIDIA API key placeholder was not resolved. Check the selected Global Variable name and ensure it has a value.",
    );
  }

  const normalizedApiKey = normalizeApiKey(cfg.apiKey);

  if (!normalizedApiKey) {
    throw new Error(
      "Missing NVIDIA API key. Enter a value or select a Global Variable with a non-empty value.",
    );
  }

  log(
    `[NVIDIA] Runtime config: model=${String(cfg.model || "")}, baseUrl=${baseUrl || "[missing]"}, apiKey=${maskApiKey(normalizedApiKey)}`,
  );

  const client = new OpenAI({
    baseURL: baseUrl,
    apiKey: normalizedApiKey,
  }) as any;

  const tools =
    availableTools.length > 0
      ? toOpenAiToolDeclarations(availableTools)
      : undefined;
  const exec = executeToolByName || (async () => "");
  const stream = cfg.stream === true && typeof onStream === "function";

  const messages: any[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: userPrompt });

  return createChatOrchestrator({
    log,
    executeToolByName: exec,
    onStep: async () => {
      const completion = await withTimeout<any>(
        client.chat.completions.create({
          model: String(cfg.model),
          messages,
          tools: tools as any,
          temperature: cfg.temperature,
          max_tokens: cfg.max_tokens,
          top_p: cfg.top_p,
          presence_penalty: cfg.presence_penalty,
          frequency_penalty: cfg.frequency_penalty,
          stream: stream,
        }),
        NVIDIA_CHAT_TIMEOUT_MS,
        `NVIDIA chat request timed out after ${Math.round(NVIDIA_CHAT_TIMEOUT_MS / 1000)}s.`,
      ).catch(err => {
         const message = err instanceof Error ? err.message : String(err);
         if (/\b401\b/.test(message)) {
           throw new Error(
             'Unauthorized by NVIDIA NIM (401). Check API key value, remove any leading "Bearer ", and verify the selected key/global variable is correct.',
           );
         }
         if (/\b404\b/.test(message)) {
           const modelName = String(cfg.model || "").trim() || "[missing model]";
           throw new Error(
             `NVIDIA NIM returned 404 for model "${modelName}". Auth appears OK, but this model id is likely not available on the chat endpoint. For Gemma, use a chat/instruct variant such as "google/gemma-2-2b-it" or "google/gemma-3-27b-it", or choose directly from Fetch Models.`,
           );
         }
         throw err;
      });

      let fullContent = "";
      if (stream) {
        for await (const chunk of completion as AsyncIterable<any>) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) {
            fullContent += delta;
            onStream?.(delta);
          }
        }
      } else {
        const first = completion.choices?.[0] as any;
        const message = first?.message || {};
        const content = message?.content;
        if (typeof content === "string") fullContent = content;
        else if (Array.isArray(content)) {
          fullContent = content
            .map((part: any) =>
              typeof part?.text === "string" ? part.text : "",
            )
            .join("")
            .trim();
        }
      }

      const firstChoice = !stream ? (completion.choices?.[0] as any) : null;
      const message = firstChoice?.message || {};
      const tool_calls = Array.isArray(message.tool_calls) ? message.tool_calls : [];

      if (tool_calls.length > 0) {
        messages.push({ role: "assistant", content: fullContent, tool_calls });
      } else {
        messages.push({ role: "assistant", content: fullContent });
      }

      return {
        content: fullContent,
        toolCalls: tool_calls.map((tc: any) => ({
          id: String(tc.id),
          name: String(tc.function?.name),
          args: tc.function?.arguments ? (typeof tc.function.arguments === 'string' ? JSON.parse(tc.function.arguments) : tc.function.arguments) : {},
          raw: tc
        }))
      };
    },
    onToolResult: (tc, result) => {
      messages.push({ role: "tool", tool_call_id: tc.id, name: tc.name, content: result });
    }
  });
};

export const embedText = async (
  cfg: LlmRuntimeConfig,
  input: string,
): Promise<number[]> => {
  let baseUrl = trimTrailingSlash(cfg.baseUrl || "");
  if (baseUrl.includes("nvidia.com") && !baseUrl.endsWith("/v1")) {
    baseUrl = `${baseUrl}/v1`;
  }

  const client = new OpenAI({
    baseURL: baseUrl,
    apiKey: normalizeApiKey(cfg.apiKey) || "not-required",
  }) as any;

  const payload = await client.embeddings.create({
    model: String(cfg.model || "NV-Embed-QA"),
    input,
  });
  const first = Array.isArray(payload?.data) ? payload.data[0] : undefined;
  return Array.isArray((first as any)?.embedding)
    ? ((first as any).embedding as number[]).map(Number).filter(Number.isFinite)
    : [];
};
