// Flow executor: stream events and parallelize independent nodes.

import {
  runGoogleChat,
  runOllamaChat,
  runOpenAICompatibleChat,
  runAnthropicChat,
} from "./llmAdapters";
import { Script, createContext } from "node:vm";
import type { AgentTool, LlmRuntimeConfig } from "./llmAdapters";
import { executeToolNode, ToolDefinition } from "./toolAdapters";
import type {
  ExecuteFlowInput,
  ExecuteFlowResult,
  FlowNode,
  FlowEdge,
  FlowRuntimeEvent,
} from "./flowTypes";

type EventHandler = (event: FlowRuntimeEvent) => void;

const getNodeFieldValue = (
  node: FlowNode | undefined,
  key: string,
): string | number | boolean | undefined => {
  const configValue = node?.data?.configSchema?.find(
    (field) => field.name === key,
  )?.value;
  if (configValue !== undefined) return configValue;
  return node?.data?.params?.[key] as string | number | boolean | undefined;
};

const evaluateCondition = (expression: string, input: unknown): boolean => {
  const normalized = String(expression || "").trim();
  if (!normalized) return Boolean(input);

  const sandbox: Record<string, unknown> = {
    input,
    value: input,
    query: typeof input === "string" ? input : JSON.stringify(input ?? ""),
    JSON,
    Math,
    Date,
  };

  const context = createContext(sandbox);
  const script = new Script(`Boolean(${normalized})`);
  return Boolean(script.runInContext(context, { timeout: 500 }));
};

class NodeExecutionError extends Error {
  relatedNodeIds: string[];
  constructor(message: string, relatedNodeIds: string[] = []) {
    super(message);
    this.relatedNodeIds = relatedNodeIds;
    Object.setPrototypeOf(this, NodeExecutionError.prototype);
  }
}
const makeEvents = (
  isSilent: boolean,
  handler?: EventHandler,
) => {
  // Streaming mode: if a handler is provided, stream directly and avoid accumulating events in memory.
  if (typeof handler === "function") {
    const h = handler as EventHandler;
    const emit = (event: FlowRuntimeEvent) => {
      if (!isSilent || event.type === "result" || event.type === "error") {
        try {
          h(event);
        } catch {
          // swallow errors from consumer
        }
      }
    };
    return { events: [] as FlowRuntimeEvent[], emit };
  }

  const events: FlowRuntimeEvent[] = [];
  const emit = (event: FlowRuntimeEvent) => {
    if (!isSilent || event.type === "result" || event.type === "error") {
      events.push(event);
      try {
        const h = handler as EventHandler | undefined;
        if (typeof h === "function") h(event);
      } catch {}
    }
  };
  return { events, emit };
};

export async function executeFlowOnServer({
  nodes = [],
  edges = [],
  inputMessage,
  isSilent = false,
  apiKey,
  onEvent,
  shouldStop,
}: ExecuteFlowInput): Promise<ExecuteFlowResult> {
  const { events, emit } = makeEvents(isSilent, onEvent);
  const log = (message: string) => emit({ type: "log", message });
  const isStopped = () => shouldStop?.() === true;

  const executeTool = async (
    node: FlowNode,
    args: Record<string, string>,
    toolDef?: ToolDefinition,
  ) => executeToolNode(node, args, { toolDef, apiKey, log });

  log("[Server] Initializing flow execution...");

  // Build maps once to avoid repeated O(n) lookups
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const nonGroupCount = nodes.filter((n) => n.type !== "cyberGroup").length;

  const inDegree = new Map<string, number>();
  const outgoingMap = new Map<string, string[]>();
  const incomingMap = new Map<string, FlowEdge[]>();

  nodes.forEach((n) => {
    if (n.type !== "cyberGroup") {
      inDegree.set(n.id, 0);
      outgoingMap.set(n.id, []);
    }
  });

  edges.forEach((edg) => {
    if (inDegree.has(edg.target))
      inDegree.set(edg.target, (inDegree.get(edg.target) || 0) + 1);
    const out = outgoingMap.get(edg.source);
    if (out) out.push(edg.target);
    const inc = incomingMap.get(edg.target) || [];
    inc.push(edg);
    incomingMap.set(edg.target, inc);
  });

  // Topological sort (Kahn) to detect cycles and produce order
  const degreeClone = new Map(inDegree);
  const q: string[] = [];
  degreeClone.forEach((deg, id) => {
    if (deg === 0) q.push(id);
  });

  const sortedIds: string[] = [];
  while (q.length > 0) {
    const cur = q.shift();
    if (!cur) continue;
    sortedIds.push(cur);
    (outgoingMap.get(cur) || []).forEach((nbr) => {
      const d = degreeClone.get(nbr);
      if (d !== undefined) {
        const nd = d - 1;
        degreeClone.set(nbr, nd);
        if (nd === 0) q.push(nbr);
      }
    });
  }

  if (sortedIds.length !== nonGroupCount) {
    throw new Error("Cycle detected in the flow! Cannot execute.");
  }

  // Compute depth (level) per node to run independent nodes in parallel
  const depth = new Map<string, number>();
  for (const id of sortedIds) {
    const inc = incomingMap.get(id) || [];
    let d = 0;
    for (const e of inc) {
      const pd = depth.get(e.source);
      if (pd !== undefined) d = Math.max(d, pd + 1);
    }
    depth.set(id, d);
  }

  const maxDepth = Math.max(...Array.from(depth.values()).concat([0]));
  const levels: string[][] = [];
  depth.forEach((d, id) => {
    if (!levels[d]) levels[d] = [];
    levels[d].push(id);
  });

  // Concurrency (per-level batches)
  const MAX_CONCURRENCY = Math.max(
    1,
    Number(process.env.EXECUTOR_CONCURRENCY || 4),
  );

  const nodeResults = new Map<string, unknown>();
  let finalOutput = "";

  const processNode = async (nodeId: string) => {
    if (isStopped())
      throw new Error("Flow execution cancelled by client disconnect.");
    const node = nodeById.get(nodeId);
    if (!node) return;

    emit({
      type: "nodeUpdate",
      nodeId,
      data: {
        status: "running",
        lastInput: undefined,
        lastOutput: undefined,
        errorMessage: undefined,
      },
    });

    // Gather inputs from incomingMap (reused, avoids edges.filter allocations)
    const incoming = incomingMap.get(nodeId) || [];
    const inputs: Record<string, unknown[]> = {};
    for (const edg of incoming) {
      const key = edg.targetHandle || edg.source;
      if (!inputs[key]) inputs[key] = [];
      const val = nodeResults.get(edg.source);
      const srcNode = nodeById.get(edg.source);
      if (srcNode?.data?.type === "ConditionComponent") {
        if (String(val) !== edg.sourceHandle) continue;
      }
      inputs[key].push(val);
    }

    let result: unknown = null;

    try {
      switch (node.data.type) {
        case "CurrentTime":
          result = new Date().toLocaleString();
          break;

        case "Prompt Template":
        case "GitLabMRReviewTemplate":
        case "GitLabMRCommentTemplate": {
          let tpl = String(getNodeFieldValue(node, "template") || "");
          tpl = tpl.replace(
            /\{\s*([a-zA-Z0-9_]+)\s*\}/g,
            (_m, variableName) => {
              const val = inputs[variableName]?.[0];
              if (val === undefined || val === null) return `{${variableName}}`;
              return typeof val === "string" ? val : JSON.stringify(val);
            },
          );
          result = tpl;
          break;
        }

        case "ChatInput":
          result = inputMessage || "Hello, test message.";
          break;

        case "TextInput":
          result = getNodeFieldValue(node, "value") || "";
          break;

        case "ConditionComponent": {
          const inputValue = Object.values(inputs).flat()[0];
          const conditionExpr = String(
            getNodeFieldValue(node, "condition") || "",
          ).trim();
          try {
            const matched = evaluateCondition(conditionExpr, inputValue);
            result = matched ? "true" : "false";
          } catch (err) {
            result = `Error: ${err instanceof Error ? err.message : String(err)}`;
          }
          break;
        }

        case "LanguageModelComponent":
        case "ChatModelComponent":
        case "OllamaChatModelComponent":
        case "VLLMChatModelComponent":
          result = {
            kind: "llm_chat",
            provider:
              getNodeFieldValue(node, "provider") ||
              (node.data.type.includes("Ollama")
                ? "Ollama"
                : node.data.type.includes("VLLM")
                  ? "vLLM"
                  : "Google"),
            model: getNodeFieldValue(node, "model") || "gemini-2.0-flash",
            apiKey: getNodeFieldValue(node, "apiKey") || "",
            baseUrl: getNodeFieldValue(node, "baseUrl") || "",
            temperature: Number(
              getNodeFieldValue(node, "temperature") ??
                getNodeFieldValue(node, "temp") ??
                0.7,
            ),
            max_tokens: Number(getNodeFieldValue(node, "max_tokens") || 2048),
            top_p: Number(getNodeFieldValue(node, "top_p") || 0.95),
            top_k: Number(getNodeFieldValue(node, "top_k") || 40),
            presence_penalty: Number(
              getNodeFieldValue(node, "presence_penalty") || 0,
            ),
            frequency_penalty: Number(
              getNodeFieldValue(node, "frequency_penalty") || 0,
            ),
          };
          break;

        case "Agent": {
          const nodeInstruction = String(
            getNodeFieldValue(node, "instruction") || "",
          ).trim();
          const linkedSystemPrompt = String(
            inputs.system_prompt?.[0] || "",
          ).trim();
          const systemPrompt = [nodeInstruction, linkedSystemPrompt]
            .filter(Boolean)
            .join("\n\n");
          const userPrompt = String(inputs.input_value?.[0] || "");

          const llmCfg = (inputs.agent_llm?.[0] as
            | Record<string, unknown>
            | undefined) || {
            provider: "Google",
            model: "gemini-2.0-flash",
            kind: "llm_chat",
          };
          if (llmCfg?.kind === "llm_embedding") {
            throw new Error("Agent only supports chat model.");
          }

          const incomingForNode = incomingMap.get(nodeId) || [];
          const llmEdge = incomingForNode.find(
            (e: any) => e.targetHandle === "agent_llm",
          );
          const llmNodeId = llmEdge?.source;
          const llmNode = llmNodeId ? nodeById.get(llmNodeId) : undefined;

          const provider = String(llmCfg?.provider || "Google").toLowerCase();
          const runtimeCfg: LlmRuntimeConfig = {
            provider: String(llmCfg?.provider || "Google"),
            model: String(llmCfg?.model || "gemini-2.0-flash"),
            apiKey: String(llmCfg?.apiKey || apiKey || ""),
            baseUrl: String(llmCfg?.baseUrl || ""),
            temperature: llmCfg?.temperature as number | undefined,
            max_tokens: llmCfg?.max_tokens as number | undefined,
            top_p: llmCfg?.top_p as number | undefined,
            top_k: llmCfg?.top_k as number | undefined,
          };

          const availableTools = ((inputs.tools || []) as AgentTool[]).filter(
            (t) => t?.type === "tool",
          );

          const executeToolByName = async (
            name: string,
            callArgs: Record<string, string>,
          ) => {
            const toolDef = availableTools.find((t) => t.name === name);
            if (!toolDef) return `Error: tool "${name}" not registered.`;
            const toolNode = nodeById.get(String(toolDef.nodeId || ""));
            if (!toolNode) return "Error: tool node not found in graph.";

            const incomingForTool = incomingMap.get(toolNode.id) || [];
            const embeddingEdge = incomingForTool.find(
              (e: any) => e.targetHandle === "embedding_model",
            );
            const embeddingNodeId = embeddingEdge?.source;
            const embeddingNode = embeddingNodeId
              ? nodeById.get(embeddingNodeId)
              : undefined;

            const toolResult = await executeTool(toolNode, callArgs, toolDef);
            const normalizedToolResult = String(toolResult || "").trim();

            if (/^error\b/i.test(normalizedToolResult)) {
              const relatedNodeIds: string[] = [];
              if (embeddingNodeId) relatedNodeIds.push(embeddingNodeId);
              relatedNodeIds.push(toolNode.id);

              const sourceLabel =
                (embeddingNode &&
                  embeddingNode.data &&
                  embeddingNode.data.label) ||
                toolNode.data?.label ||
                toolNode.data?.type ||
                "Tool node";

              throw new NodeExecutionError(
                `${sourceLabel} failed: ${normalizedToolResult}`,
                relatedNodeIds,
              );
            }

            return toolResult;
          };

          const adapters: Record<string, () => Promise<unknown>> = {
            ollama: () =>
              runOllamaChat(
                runtimeCfg,
                systemPrompt,
                userPrompt,
                availableTools,
                executeToolByName,
                log,
              ),
            vllm: () =>
              runOpenAICompatibleChat(
                runtimeCfg,
                systemPrompt,
                userPrompt,
                availableTools,
                executeToolByName,
                log,
              ),
            openai: () =>
              runOpenAICompatibleChat(
                runtimeCfg,
                systemPrompt,
                userPrompt,
                availableTools,
                executeToolByName,
                log,
              ),
            nvidia: () =>
              runOpenAICompatibleChat(
                runtimeCfg,
                systemPrompt,
                userPrompt,
                availableTools,
                executeToolByName,
                log,
              ),
            anthropic: () =>
              runAnthropicChat(
                runtimeCfg,
                systemPrompt,
                userPrompt,
                availableTools,
                executeToolByName,
                log,
              ),
            google: () =>
              runGoogleChat(
                runtimeCfg,
                systemPrompt,
                userPrompt,
                availableTools,
                executeToolByName,
              ),
          };

          const runner = adapters[provider] || adapters.google;
          try {
            result = await runner();
          } catch (err) {
            if (err instanceof NodeExecutionError) throw err;
            const rawMessage = err instanceof Error ? err.message : String(err);
            const llmLabel =
              llmNode?.data?.label ||
              (llmNode && llmNode.data?.type) ||
              "LLM node";
            const wrappedMessage = `LLM "${llmLabel}" failed: ${rawMessage}`;
            throw new NodeExecutionError(
              wrappedMessage,
              llmNodeId ? [llmNodeId] : [],
            );
          }
          break;
        }

        case "MSSQLPyODBCComponent": {
          const flatInputs = Object.values(inputs).flat();
          const firstInput = flatInputs[0];
          const inputQuery =
            typeof firstInput === "string"
              ? firstInput
              : firstInput &&
                  typeof firstInput === "object" &&
                  "query" in firstInput
                ? String((firstInput as Record<string, unknown>).query || "")
                : "";
          const sqlResult = await executeTool(
            node,
            { query: inputQuery },
            undefined,
          );
          if (isStopped())
            throw new Error("Flow execution cancelled by client disconnect.");
          try {
            result = JSON.parse(String(sqlResult));
          } catch {
            result = sqlResult;
          }
          break;
        }

        case "ChatOutput":
          result = inputs.response?.[0] ?? Object.values(inputs).flat()[0];
          finalOutput = String(result || "");
          break;

        case "WaitComponent": {
          const delay = Number(getNodeFieldValue(node, "delayMs") || 1000);
          await new Promise((res) => setTimeout(res, delay));
          result = `Waited for ${delay}ms`;
          break;
        }

        case "CodeExecutionComponent":
        case "HTTPRequestComponent":
        case "elasticsearch_search":
        case "SerperSearchComponent":
        case "DataStreamComponent":
        case "JSONParserComponent":
        case "ImageGenerationComponent":
        case "FileSystemComponent":
        case "GitLabMergeRequestComponent": {
          const flatInput = String(Object.values(inputs).flat()[0] || "");
          result = await executeTool(node, { query: flatInput }, undefined);
          break;
        }

        case "VariableComponent":
          result = getNodeFieldValue(node, "value") || "";
          break;

        default:
          result = `Executed ${node.data.label}`;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const relatedNodeIds =
        err instanceof NodeExecutionError ? err.relatedNodeIds : [];
      emit({
        type: "nodeUpdate",
        nodeId,
        data: {
          status: "error",
          lastInput: inputs,
          errorMessage: message,
        },
      });
      emit({
        type: "error",
        message: `Node [${node.data.label}] failed: ${message}`,
        nodeId,
      });

      relatedNodeIds.forEach((relatedNodeId) => {
        const relatedNode = nodeById.get(relatedNodeId);
        emit({
          type: "nodeUpdate",
          nodeId: relatedNodeId,
          data: {
            status: "error",
            errorMessage: message,
          },
        });
        emit({
          type: "error",
          message: `Node [${relatedNode?.data?.label || relatedNodeId}] failed: ${message}`,
          nodeId: relatedNodeId,
        });
      });

      throw err instanceof Error ? err : new Error(message);
    }

    nodeResults.set(nodeId, result);
    emit({
      type: "nodeUpdate",
      nodeId,
      data: { status: "success", lastInput: inputs, lastOutput: result },
    });
  };

  // Execute by level, parallelizing nodes inside same level (independent)
  for (let level = 0; level <= maxDepth; level += 1) {
    const levelNodes = levels[level] || [];
    if (levelNodes.length === 0) continue;

    // run in batches to respect MAX_CONCURRENCY
    for (let i = 0; i < levelNodes.length; i += MAX_CONCURRENCY) {
      const batch = levelNodes.slice(i, i + MAX_CONCURRENCY);
      await Promise.all(
        batch.map((nid) => {
          if (isStopped())
            return Promise.reject(
              new Error("Flow execution cancelled by client disconnect."),
            );
          return processNode(nid);
        }),
      );
    }
  }

  const output = { text: finalOutput };
  emit({ type: "result", output });
  return { events, output };
}
