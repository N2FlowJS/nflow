import type { LlmRuntimeConfig, AgentTool } from "../types";
import {
  trimTrailingSlash,
  hasTemplatePlaceholder,
  toOpenAiToolDeclarations,
  clampToolResult,
} from "../utils";
import { maskApiKey, normalizeApiKey, toErrorMessage, withTimeout } from "../../utils/common";
import { createLogger } from "../../utils/logger";
import OpenAI from "openai";

const logger = createLogger("NVIDIA");
const NVIDIA_CHAT_TIMEOUT_MS = Number(
  process.env.NVIDIA_CHAT_TIMEOUT_MS || 120000,
);

type NvidiaChatStepResult = {
  fullContent: string;
  toolCalls: any[];
};

export const listModels = async (
  cfg: LlmRuntimeConfig,
): Promise<Array<{ id: string; name?: string; description?: string }>> => {
  let baseUrl = trimTrailingSlash(cfg.baseUrl || "");
  if (!baseUrl) {
    logger.warn("No baseUrl provided");
    return [];
  }

  if (baseUrl.includes("nvidia.com") && !baseUrl.endsWith("/v1")) {
    baseUrl = `${baseUrl}/v1`;
  }

  logger.debug(`Listing models from ${baseUrl}`);

  try {
    const normalizedApiKey = normalizeApiKey(cfg.apiKey);
    const client = new OpenAI({
      baseURL: baseUrl,
      apiKey: normalizedApiKey || "not-required",
      defaultHeaders: { "User-Agent": "N2Flow-Client/1.0" },
    }) as any;

    if (client.models && typeof client.models.list === "function") {
      const resp = await client.models.list();
      const data = Array.isArray(resp?.data) ? resp.data : resp?.models || [];
      const models = (data || []).map((m: any) => ({
        id: String(m.id || m.name || m.model || ""),
        name: m.name || m.id || m.model,
        description: m.description,
      }));

      if (models.length > 0) {
        logger.info(`Fetched ${models.length} models`);
        return models;
      }
    }
  } catch (err) {
    logger.warn("Failed to fetch models via OpenAI SDK", {
      error: toErrorMessage(err),
    });
  }

  return [];
};

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

  for (let step = 0; step < 8; step += 1) {
    let stepResult: NvidiaChatStepResult;
    try {
      stepResult = await withTimeout<NvidiaChatStepResult>(
        (async () => {
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

          let fullContent = "";

          if (stream) {
            for await (const chunk of completion as AsyncIterable<any>) {
              const delta = chunk.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                onStream?.(delta);
              }
            }

            return {
              fullContent,
              toolCalls: [],
            };
          }

          const first = (completion as any).choices?.[0] as any;
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

          return {
            fullContent,
            toolCalls: Array.isArray(message.tool_calls)
              ? message.tool_calls
              : [],
          };
        })(),
        NVIDIA_CHAT_TIMEOUT_MS,
        `NVIDIA chat request timed out after ${Math.round(NVIDIA_CHAT_TIMEOUT_MS / 1000)}s.`,
      );
    } catch (err) {
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
    }
    const { fullContent, toolCalls } = stepResult;

    if (toolCalls.length === 0) {
      if (fullContent) return fullContent;
      return "[Empty model response]";
    }

    messages.push({
      role: "assistant",
      content: fullContent,
      tool_calls: toolCalls,
    });

    for (const tc of toolCalls) {
      const id = String((tc as any).id || "tool_call");
      const fn = (tc as any).function || {};
      const fnName = String(fn.name || "unknown_tool");
      const fnArgs = (tc as any).arguments || tc.arguments || {};
      log(`[Agent] Tool call: ${fnName} → ${JSON.stringify(fnArgs)}`);
      const toolResult = await executeToolByName(
        fnName,
        fnArgs as Record<string, string>,
      );
      log(`[Agent] Tool result: ${String(toolResult).substring(0, 120)}`);
      const safeToolResult = clampToolResult(String(toolResult || ""));
      messages.push({
        role: "tool",
        tool_call_id: id,
        name: fnName,
        content: safeToolResult,
      });
    }
  }

  throw new Error("NVIDIA tool loop exceeded max iterations.");
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
