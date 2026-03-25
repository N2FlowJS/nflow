import {
  runGoogleChat,
  runOllamaChat,
  runOpenAICompatibleChat,
  runAnthropicChat,
} from './llmAdapters';
import { Script, createContext } from 'node:vm';
import type { AgentTool, LlmRuntimeConfig } from './llmAdapters';
import { executeToolNode } from './toolAdapters';
import type { ToolDefinition } from './toolAdapters';
import type {
  ExecuteFlowInput,
  ExecuteFlowResult,
  FlowNode,
  FlowRuntimeEvent,
} from './flowTypes';

const getNodeFieldValue = (
  node: FlowNode | undefined,
  key: string,
): string | number | boolean | undefined => {
  const configValue = node?.data?.configSchema?.find((field) => field.name === key)?.value;
  if (configValue !== undefined) return configValue;
  return node?.data?.params?.[key] as string | number | boolean | undefined;
};

const makeEvents = (isSilent: boolean, onEvent?: (event: FlowRuntimeEvent) => void) => {
  const events: FlowRuntimeEvent[] = [];
  const emit = (event: FlowRuntimeEvent) => {
    if (!isSilent || event.type === 'result' || event.type === 'error') {
      events.push(event);
      if (typeof onEvent === 'function') {
        onEvent(event);
      }
    }
  };
  return { events, emit };
};

const evaluateCondition = (expression: string, input: unknown): boolean => {
  const normalized = String(expression || '').trim();
  if (!normalized) {
    return Boolean(input);
  }

  const sandbox: Record<string, unknown> = {
    input,
    value: input,
    query: typeof input === 'string' ? input : JSON.stringify(input ?? ''),
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
    this.name = 'NodeExecutionError';
    this.relatedNodeIds = relatedNodeIds;
  }
}

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
  const log = (message: string) => emit({ type: 'log', message });
  const isStopped = () => shouldStop?.() === true;

  const executeTool = async (node: FlowNode, args: Record<string, string>, toolDef?: ToolDefinition) =>
    executeToolNode(node, args, { toolDef, apiKey, log });

  log('[Server] Initializing flow execution...');

  const inDegree = new Map<string, number>();
  const outgoingMap = new Map<string, string[]>();

  nodes.forEach((n) => {
    if (n.type !== 'cyberGroup') {
      inDegree.set(n.id, 0);
      outgoingMap.set(n.id, []);
    }
  });

  edges.forEach((edg) => {
    if (inDegree.has(edg.target)) inDegree.set(edg.target, (inDegree.get(edg.target) || 0) + 1);
    const outgoing = outgoingMap.get(edg.source);
    if (outgoing) outgoing.push(edg.target);
  });

  const queue: string[] = [];
  inDegree.forEach((deg, id) => { if (deg === 0) queue.push(id); });

  const sortedIds: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }
    sortedIds.push(current);
    (outgoingMap.get(current) || []).forEach((neighbor) => {
      const degree = inDegree.get(neighbor);
      if (degree !== undefined) {
        const nextDegree = degree - 1;
        inDegree.set(neighbor, nextDegree);
        if (nextDegree === 0) queue.push(neighbor);
      }
    });
  }

  const nonGroupCount = nodes.filter((n) => n.type !== 'cyberGroup').length;
  if (sortedIds.length !== nonGroupCount) {
    throw new Error('Cycle detected in the flow! Cannot execute.');
  }

  const toolNodeIds = new Set(edges.filter((edg) => edg.targetHandle === 'tools').map((edg) => edg.source));
  const nodeResults = new Map<string, unknown>();
  let finalOutput = '';

  for (const nodeId of sortedIds) {
    if (isStopped()) {
      throw new Error('Flow execution cancelled by client disconnect.');
    }

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    emit({ type: 'nodeUpdate', nodeId, data: { status: 'running', lastInput: undefined, lastOutput: undefined, errorMessage: undefined } });

    const inputs: Record<string, unknown[]> = {};
    edges.filter((edg) => edg.target === nodeId).forEach((edg) => {
      const key = edg.targetHandle || edg.source;
      if (!inputs[key]) inputs[key] = [];
      const srcNode = nodes.find((n) => n.id === edg.source);
      const val = nodeResults.get(edg.source);
      if (srcNode?.data?.type === 'ConditionComponent') {
        if (String(val) !== edg.sourceHandle) return;
      }
      inputs[key].push(val);
    });

    let result = null;

    try {
    if (toolNodeIds.has(nodeId)) {
      const toolName = `${node.data.type.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}_${String(nodeId).split('-')[1] || 'tool'}`;
      const toolDef: {
        type: 'tool';
        name: string;
        description: string;
        parameters: Record<string, unknown>;
        nodeId: string;
        embeddingModel?: {
          kind: 'llm_embedding';
          provider?: string;
          model: string;
          apiKey?: string;
          baseUrl?: string;
        };
      } = {
        type: 'tool',
        name: toolName,
        description: node.data.description || `Tool for ${node.data.label}`,
        parameters: {
          type: 'OBJECT',
          properties: { query: { type: 'STRING', description: 'The input query or command for the tool' } },
          required: ['query'],
        },
        nodeId,
      };

      const embeddingInput = inputs.embedding_model?.[0] as
        | {
            kind?: string;
            provider?: string;
            model?: string;
            apiKey?: string;
            baseUrl?: string;
          }
        | undefined;
      if (node.data.type === 'elasticsearch_search' && embeddingInput?.kind === 'llm_embedding' && embeddingInput.model) {
        toolDef.embeddingModel = {
          kind: 'llm_embedding',
          provider: embeddingInput.provider,
          model: embeddingInput.model,
          apiKey: embeddingInput.apiKey,
          baseUrl: embeddingInput.baseUrl,
        };
      }

      result = toolDef;
    } else {
      switch (node.data.type) {
        case 'CurrentTime':
          result = new Date().toLocaleString();
          break;
        case 'Prompt Template':
        case 'GitLabMRReviewTemplate':
        case 'GitLabMRCommentTemplate': {
          let tpl = String(getNodeFieldValue(node, 'template') || '');
          tpl = tpl.replace(/\{\s*([a-zA-Z0-9_]+)\s*\}/g, (_m, variableName) => {
            const val = inputs[variableName]?.[0];
            if (val === undefined || val === null) return `{${variableName}}`;
            return typeof val === 'string' ? val : JSON.stringify(val);
          });
          result = tpl;
          break;
        }
        case 'ChatInput':
          result = inputMessage || 'Hello, test message.';
          break;
        case 'TextInput':
          result = getNodeFieldValue(node, 'value') || '';
          break;
        case 'ConditionComponent': {
          const inputValue = Object.values(inputs).flat()[0];
          const conditionExpr = String(getNodeFieldValue(node, 'condition') || '').trim();
          try {
            const matched = evaluateCondition(conditionExpr, inputValue);
            result = matched ? 'true' : 'false';
          } catch (err) {
            result = `Error: ${err instanceof Error ? err.message : String(err)}`;
          }
          break;
        }
        case 'LanguageModelComponent':
        case 'ChatModelComponent':
        case 'OllamaChatModelComponent':
        case 'VLLMChatModelComponent':
          result = {
            kind: 'llm_chat',
            provider: getNodeFieldValue(node, 'provider') || (node.data.type.includes('Ollama') ? 'Ollama' : node.data.type.includes('VLLM') ? 'vLLM' : 'Google'),
            model: getNodeFieldValue(node, 'model') || 'gemini-2.0-flash',
            apiKey: getNodeFieldValue(node, 'apiKey') || '',
            baseUrl: getNodeFieldValue(node, 'baseUrl') || '',
            temperature: Number(getNodeFieldValue(node, 'temperature') ?? getNodeFieldValue(node, 'temp') ?? 0.7),
            max_tokens: Number(getNodeFieldValue(node, 'max_tokens') || 2048),
            top_p: Number(getNodeFieldValue(node, 'top_p') || 0.95),
            top_k: Number(getNodeFieldValue(node, 'top_k') || 40),
            presence_penalty: Number(getNodeFieldValue(node, 'presence_penalty') || 0),
            frequency_penalty: Number(getNodeFieldValue(node, 'frequency_penalty') || 0),
          };
          break;
        case 'EmbeddingModelComponent':
        case 'OllamaEmbeddingModelComponent':
        case 'VLLMEmbeddingModelComponent':
          result = {
            kind: 'llm_embedding',
            provider: getNodeFieldValue(node, 'provider') || (node.data.type.includes('Ollama') ? 'Ollama' : node.data.type.includes('VLLM') ? 'vLLM' : 'Google'),
            model: getNodeFieldValue(node, 'model') || 'text-embedding-004',
            apiKey: getNodeFieldValue(node, 'apiKey') || '',
            baseUrl: getNodeFieldValue(node, 'baseUrl') || '',
          };
          break;
        case 'Agent': {
          const nodeInstruction = String(getNodeFieldValue(node, 'instruction') || '').trim();
          const linkedSystemPrompt = String(inputs.system_prompt?.[0] || '').trim();
          const systemPrompt = [nodeInstruction, linkedSystemPrompt].filter(Boolean).join('\n\n');
          const userPrompt = String(inputs.input_value?.[0] || '');
          const llmCfg = (inputs.agent_llm?.[0] as Record<string, unknown> | undefined) || { provider: 'Google', model: 'gemini-2.0-flash', kind: 'llm_chat' };
          if (llmCfg?.kind === 'llm_embedding') {
            throw new Error('Agent only supports chat model.');
          }

          const llmEdge = edges.find(
            (edg) => edg.target === nodeId && edg.targetHandle === 'agent_llm',
          );
          const llmNodeId = llmEdge?.source;
          const llmNode = llmNodeId ? nodes.find((n) => n.id === llmNodeId) : undefined;

          const provider = String(llmCfg?.provider || 'Google').toLowerCase();
          const runtimeCfg: LlmRuntimeConfig = {
            provider: String(llmCfg?.provider || 'Google'),
            model: String(llmCfg?.model || 'gemini-2.0-flash'),
            apiKey: String(llmCfg?.apiKey || apiKey || ''),
            baseUrl: String(llmCfg?.baseUrl || ''),
            temperature: llmCfg?.temperature as number | undefined,
            max_tokens: llmCfg?.max_tokens as number | undefined,
            top_p: llmCfg?.top_p as number | undefined,
            top_k: llmCfg?.top_k as number | undefined,
            presence_penalty: llmCfg?.presence_penalty as number | undefined,
            frequency_penalty: llmCfg?.frequency_penalty as number | undefined,
          };

          const availableTools = ((inputs.tools || []) as AgentTool[]).filter((t) => t?.type === 'tool');
          const executeToolByName = async (name: string, callArgs: Record<string, string>) => {
            const toolDef = availableTools.find((t) => t.name === name);
            if (!toolDef) return `Error: tool "${name}" not registered.`;
            const toolNode = nodes.find((n) => n.id === String(toolDef.nodeId || ''));
            if (!toolNode) return 'Error: tool node not found in graph.';

            const embeddingEdge = edges.find(
              (edg) => edg.target === toolNode.id && edg.targetHandle === 'embedding_model',
            );
            const embeddingNodeId = embeddingEdge?.source;
            const embeddingNode = embeddingNodeId
              ? nodes.find((n) => n.id === embeddingNodeId)
              : undefined;

            const toolResult = await executeTool(toolNode, callArgs, toolDef);
            const normalizedToolResult = String(toolResult || '').trim();

            if (/^error\b/i.test(normalizedToolResult)) {
              const relatedNodeIds: string[] = [];
              if (embeddingNodeId) relatedNodeIds.push(embeddingNodeId);
              relatedNodeIds.push(toolNode.id);

              const sourceLabel =
                embeddingNode?.data?.label ||
                toolNode.data?.label ||
                toolNode.data?.type ||
                'Tool node';

              throw new NodeExecutionError(
                `${sourceLabel} failed: ${normalizedToolResult}`,
                relatedNodeIds,
              );
            }

            return toolResult;
          };

          const adapters: Record<string, () => Promise<unknown>> = {
            ollama: () => runOllamaChat(runtimeCfg, systemPrompt, userPrompt, availableTools, executeToolByName, log),
            vllm: () => runOpenAICompatibleChat(runtimeCfg, systemPrompt, userPrompt, availableTools, executeToolByName, log),
            openai: () => runOpenAICompatibleChat(runtimeCfg, systemPrompt, userPrompt, availableTools, executeToolByName, log),
            anthropic: () => runAnthropicChat(runtimeCfg, systemPrompt, userPrompt, availableTools, executeToolByName, log),
            google: () => runGoogleChat(runtimeCfg, systemPrompt, userPrompt, availableTools, executeToolByName),
          };

          const runner = adapters[provider] || adapters.google;
          try {
            result = await runner();
          } catch (err) {
            if (err instanceof NodeExecutionError) {
              throw err;
            }
            const rawMessage = err instanceof Error ? err.message : String(err);
            const llmLabel = llmNode?.data?.label || llmNode?.data?.type || 'LLM node';
            const wrappedMessage = `LLM "${llmLabel}" failed: ${rawMessage}`;
            throw new NodeExecutionError(
              wrappedMessage,
              llmNodeId ? [llmNodeId] : [],
            );
          }
          if (isStopped()) {
            throw new Error('Flow execution cancelled by client disconnect.');
          }
          break;
        }
        case 'VariableComponent':
          result = getNodeFieldValue(node, 'value') || '';
          break;
        case 'ImageGenerationComponent': {
          const prompt = String(inputs.prompt?.[0] || Object.values(inputs).flat()[0] || '');
          result = await executeTool(node, { query: prompt }, undefined);
          break;
        }
        case 'FileSystemComponent': {
          const content = String(inputs.content?.[0] || Object.values(inputs).flat()[0] || '');
          result = await executeTool(node, { query: content }, undefined);
          break;
        }
        case 'GitLabMergeRequestComponent':
        case 'GitHubMergeRequestComponent': {
          const flatInput = String(Object.values(inputs).flat()[0] || '');
          result = await executeTool(node, { query: flatInput }, undefined);
          break;
        }
        case 'WaitComponent': {
          const delay = Number(getNodeFieldValue(node, 'delayMs') || 1000);
          await new Promise(res => setTimeout(res, delay));
          result = `Waited for ${delay}ms`;
          break;
        }
        case 'CodeExecutionComponent':
        case 'HTTPRequestComponent':
        case 'elasticsearch_search':
        case 'SerperSearchComponent':
        case 'DataStreamComponent':
        case 'JSONParserComponent': {
          const flatInput = String(Object.values(inputs).flat()[0] || '');
          result = await executeTool(node, { query: flatInput }, undefined);
          if (typeof result === 'string') {
            try {
              const parsed = JSON.parse(result);
              result = parsed;
            } catch {
              // keep as string
            }
          }
          break;
        }
        case 'MSSQLPyODBCComponent': {
          const flatInputs = Object.values(inputs).flat();
          const firstInput = flatInputs[0];
          const inputQuery =
            typeof firstInput === 'string'
              ? firstInput
              : (firstInput && typeof firstInput === 'object' && 'query' in firstInput)
                ? String((firstInput as Record<string, unknown>).query || '')
                : '';
          const sqlResult = await executeTool(node, { query: inputQuery }, undefined);
          if (isStopped()) {
            throw new Error('Flow execution cancelled by client disconnect.');
          }
          try { result = JSON.parse(sqlResult); } catch { result = sqlResult; }
          break;
        }
        case 'ChatOutput':
          result = inputs.response?.[0] ?? Object.values(inputs).flat()[0];
          finalOutput = String(result || '');
          break;
        default:
          result = `Executed ${node.data.label}`;
      }
    }

    nodeResults.set(nodeId, result);
    emit({ type: 'nodeUpdate', nodeId, data: { status: 'success', lastInput: inputs, lastOutput: result } });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const relatedNodeIds = err instanceof NodeExecutionError ? err.relatedNodeIds : [];
      emit({
        type: 'nodeUpdate',
        nodeId,
        data: {
          status: 'error',
          lastInput: inputs,
          errorMessage: message,
        },
      });
      emit({
        type: 'error',
        message: `Node [${node.data.label}] failed: ${message}`,
        nodeId,
      });

      relatedNodeIds.forEach((relatedNodeId) => {
        const relatedNode = nodes.find((n) => n.id === relatedNodeId);
        emit({
          type: 'nodeUpdate',
          nodeId: relatedNodeId,
          data: {
            status: 'error',
            errorMessage: message,
          },
        });
        emit({
          type: 'error',
          message: `Node [${relatedNode?.data?.label || relatedNodeId}] failed: ${message}`,
          nodeId: relatedNodeId,
        });
      });

      throw err instanceof Error ? err : new Error(message);
    }
  }

  const output = { text: finalOutput };
  emit({ type: 'result', output });
  return { events, output };
}
