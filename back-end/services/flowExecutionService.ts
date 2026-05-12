import type {
  ExecuteFlowInput,
  ExecuteFlowResult,
  FlowNode,
  FlowEdge,
  FlowRuntimeEvent,
} from '../flowTypes';
import { executeNode, FlowRuntimeContext, NodeExecutionError } from '../nodes';
import { ToolDefinition, executeToolNode } from '../tools';
import { AgentTool } from '../llm';
import { resolveSecrets } from '../utils/secretResolver';
import { withTimeout } from '../utils/common';
import { resolveSecretString } from '../utils/secretResolver';

const MAX_CONCURRENCY = Math.max(1, Number(process.env.EXECUTOR_CONCURRENCY || 4));
const MAX_FLOW_NODES = Number(process.env.MAX_FLOW_NODES || 500);
const GLOBAL_FLOW_TIMEOUT = Number(process.env.GLOBAL_FLOW_TIMEOUT || 300000); // 5 minutes
const NODE_EXECUTION_TIMEOUT_MS = Number(process.env.NODE_EXECUTION_TIMEOUT_MS || 180000);

type EventHandler = (event: FlowRuntimeEvent) => void;

function makeEvents(
  isSilent: boolean,
  handler?: EventHandler,
) {
  const events: FlowRuntimeEvent[] = [];
  const emit = (event: FlowRuntimeEvent) => {
    if (!isSilent || event.type === 'result' || event.type === 'error') {
      if (!handler) events.push(event);
      try { handler?.(event); } catch {}
    }
  };
  return { events, emit };
}


export async function executeFlowOnServer({
  nodes = [],
  edges = [],
  inputMessage,
  isSilent = false,
  apiKey,
  onEvent,
  shouldStop,
  globalVariables = [],
}: ExecuteFlowInput): Promise<ExecuteFlowResult> {
  const { events, emit } = makeEvents(isSilent, onEvent);
  const log = (message: string) => emit({ type: 'log', message });
  let hasError = false;
  const isStopped = () => shouldStop?.() === true || hasError;

  log('[Server] Initializing flow execution...');

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const nonGroupCount = nodes.filter((n) => n.type !== 'cyberGroup').length;

  const inDegree = new Map<string, number>();
  const outgoingMap = new Map<string, string[]>();
  const incomingMap = new Map<string, FlowEdge[]>();

  nodes.forEach((n) => {
    if (n.type !== 'cyberGroup') {
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
    throw new Error('Cycle detected in the flow! Cannot execute.');
  }

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

  const nodeResults = new Map<string, unknown>();
  let finalOutput = '';
  let executedNodeCount = 0;
  const flowStartTime = Date.now();

  const processNode = async (nodeId: string) => {
    if (isStopped()) {
      throw new Error('Flow execution cancelled or halted.');
    }

    // Circuit Breaker: Max Nodes
    executedNodeCount += 1;
    if (executedNodeCount > MAX_FLOW_NODES) {
      const msg = `Circuit Breaker: Maximum node execution limit (${MAX_FLOW_NODES}) exceeded. Possible infinite loop detected.`;
      log(`[Error] ${msg}`);
      throw new Error(msg);
    }

    // Circuit Breaker: Global Timeout
    if (Date.now() - flowStartTime > GLOBAL_FLOW_TIMEOUT) {
      const msg = `Circuit Breaker: Flow execution exceeded global timeout of ${GLOBAL_FLOW_TIMEOUT / 1000}s.`;
      log(`[Error] ${msg}`);
      throw new Error(msg);
    }

    const node = nodeById.get(nodeId);
    if (!node) return;
    const nodeLabel = String(node.data.label || node.data.type || nodeId);

    log(`[Server] Starting node: ${nodeLabel} (${nodeId})`);

    emit({
      type: 'nodeUpdate',
      nodeId,
      data: { status: 'running', lastInput: undefined, lastOutput: undefined, errorMessage: undefined },
    });

    // Security: Resolve any {{SECRET_NAME}} placeholders before execution
    const resolvedNode = {
      ...node,
      data: {
        ...node.data,
        params: resolveSecrets(node.data?.params || {}),
        configSchema: node.data?.configSchema?.map((field: any) => ({
          ...field,
          value: typeof field.value === 'string' ? resolveSecretString(field.value) : field.value,
        }))
      }
    };

    const incoming = incomingMap.get(nodeId) || [];
    const inputs: Record<string, unknown[]> = {};
    for (const edg of incoming) {
      const key = edg.targetHandle || edg.source;
      if (!inputs[key]) inputs[key] = [];
      const val = nodeResults.get(edg.source);
      const srcNode = nodeById.get(edg.source);
      if (srcNode?.data?.type === 'ConditionComponent') {
        if (String(val) !== edg.sourceHandle) continue;
      }
      inputs[key].push(val);
    }
    
    // Inject input message into inputs for standard nodes that might expect it
    if (inputMessage) {
      if (!inputs['inputMessage']) inputs['inputMessage'] = [];
      inputs['inputMessage'].push(inputMessage);
    }

    let result: unknown = null;
    try {
      const availableTools = ((inputs.tools || []) as AgentTool[]).filter((t) => t?.type === 'tool') as unknown as ToolDefinition[];
      
      const executeToolByName = async (name: string, callArgs: Record<string, string>) => {
        const toolDef = availableTools.find((t) => t.name === name);
        if (!toolDef) return `Error: tool "${name}" not registered.`;
        const toolNode = nodeById.get(String(toolDef.nodeId || ''));
        if (!toolNode) return 'Error: tool node not found in graph.';
        return executeToolNode(toolNode, callArgs, { toolDef, log, inputs });
      };

      const ctx: FlowRuntimeContext = {
        inputs,
        node: resolvedNode,
        isStopped,
        emit,
        executeToolByName,
        availableTools,
        incomingMap,
        nodeById,
        log,
        globalVariables,
        onEvent
      };

      result = await withTimeout(
        executeNode(ctx),
        NODE_EXECUTION_TIMEOUT_MS,
        `Node execution timed out after ${Math.round(NODE_EXECUTION_TIMEOUT_MS / 1000)}s.`,
      );
      if (node.data.type === 'ChatOutput') {
        finalOutput = String(result || '');
      }

      log(`[Server] Completed node: ${nodeLabel} (${nodeId})`);

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const relatedNodeIds = err instanceof NodeExecutionError ? err.relatedNodeIds : [];
      log(`[Server] Node failed: ${nodeLabel} (${nodeId}) -> ${message}`);
      
      emit({
        type: 'nodeUpdate',
        nodeId,
        data: { status: 'error', lastInput: inputs, errorMessage: message },
      });
      emit({ type: 'error', message: `Node [${node.data.label}] failed: ${message}`, nodeId });

      relatedNodeIds.forEach((relatedNodeId) => {
        const relatedNode = nodeById.get(relatedNodeId);
        emit({
          type: 'nodeUpdate',
          nodeId: relatedNodeId,
          data: { status: 'error', errorMessage: message },
        });
        emit({ type: 'error', message: `Node [${relatedNode?.data?.label || relatedNodeId}] failed: ${message}`, nodeId: relatedNodeId });
      });

      hasError = true;
      throw err instanceof Error ? err : new Error(message);
    }

    nodeResults.set(nodeId, result);
    emit({
      type: 'nodeUpdate',
      nodeId,
      data: { status: 'success', lastInput: inputs, lastOutput: result },
    });
  };

  for (let level = 0; level <= maxDepth; level += 1) {
    const levelNodes = levels[level] || [];
    if (levelNodes.length === 0) continue;

    for (let i = 0; i < levelNodes.length; i += MAX_CONCURRENCY) {
      if (hasError) break;

      const batch = levelNodes.slice(i, i + MAX_CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map((nid) => {
          if (isStopped()) return Promise.reject(new Error('Flow execution cancelled or halted by error.'));
          return processNode(nid);
        }),
      );

      const rejected = results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
      if (rejected) {
        throw rejected.reason;
      }
    }
  }

  const output = { text: finalOutput };
  emit({ type: 'result', output });
  return { events, output };
}
