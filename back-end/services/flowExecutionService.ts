import { prisma } from '../lib/prisma';
import { Utils } from '@n2flow/types';
import type {
  ExecuteFlowInput,
  ExecuteFlowResult,
  FlowNode,
  FlowEdge,
  FlowRuntimeEvent,
  NodeData,
} from '../flowTypes';
import { executeNode, FlowRuntimeContext, NodeExecutionError } from '../nodes';
import { ToolDefinition, executeToolNode } from '../tools';
import { AgentTool } from '../llm';
import { withTimeout } from '../utils/common';

// Engine modules
import {
  buildGraphMaps,
  performTopologicalSort,
  type NodeStatus,
} from './engine/graphBuilder';
import {
  collectNodeInputs,
  resolveNodeConfig,
  shouldSkipNode,
} from './engine/inputResolver';

// ---------------------------------------------------------------------------
// Circuit-breaker constants (env-configurable)
// ---------------------------------------------------------------------------
const MAX_CONCURRENCY       = Math.max(1, Number(process.env.EXECUTOR_CONCURRENCY   || 4));
const MAX_FLOW_NODES        = Number(process.env.MAX_FLOW_NODES                || 500);
const GLOBAL_FLOW_TIMEOUT   = Number(process.env.GLOBAL_FLOW_TIMEOUT          || 300_000); // 5 min
const NODE_EXECUTION_TIMEOUT_MS = Number(process.env.NODE_EXECUTION_TIMEOUT_MS || 180_000);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type EventHandler = (event: FlowRuntimeEvent) => void;

type PartialRuntimeEvent =
  | { type: 'log'; message: string }
  | { type: 'ping' }
  | { type: 'nodeUpdate'; nodeId: string; data: Partial<NodeData> }
  | { type: 'result'; output: any }
  | { type: 'error'; message: string; nodeId?: string }
  | { type: 'done'; output: any };

// ---------------------------------------------------------------------------
// Event helpers
// ---------------------------------------------------------------------------
function makeEvents(isSilent: boolean, handler?: EventHandler) {
  const executionId = Utils.generateId('exec');
  const events: FlowRuntimeEvent[] = [];

  const emit = (partialEvent: PartialRuntimeEvent) => {
    const event = { ...partialEvent, timestamp: Date.now() } as FlowRuntimeEvent;
    if (!isSilent || event.type === 'node_end' || event.type === 'node_error' || event.type === 'checkpoint') {
      if (!handler) events.push(event);
      try { handler?.(event); } catch { /* never crash the engine */ }
    }
  };

  return { events, emit, executionId };
}

// ---------------------------------------------------------------------------
// Main execution engine
// ---------------------------------------------------------------------------

export async function executeFlowOnServer({
  userId,
  nodes = [],
  edges = [],
  flowId,
  inputMessage,
  chatHistory = [],
  isSilent = false,
  apiKey,
  onEvent,
  shouldStop,
  globalVariables = [],
}: ExecuteFlowInput): Promise<ExecuteFlowResult> {
  // --- Setup ------------------------------------------------------------------
  const { events, emit, executionId } = makeEvents(isSilent, onEvent);
  const log = (message: string) => emit({ type: 'log', message });

  // Persist execution start if flowId is present
  let dbExecutionId: string | undefined;
  if (flowId && !isSilent) {
    try {
      const execution = await prisma.flowExecution.create({
        data: {
          flowId,
          status: 'running',
          input: inputMessage || '',
          startedAt: new Date(),
        },
      });
      dbExecutionId = execution.id;
    } catch (err) {
      console.error('Failed to create execution record:', err);
    }
  }

  log(`[Server] Initializing flow execution [${executionId}]...`);

  // AbortController: single source of truth for cancellation
  const abortController = new AbortController();
  const { signal } = abortController;

  // Combine external shouldStop with our AbortSignal
  const isStopped = () => signal.aborted || shouldStop?.() === true;

  // Abort helper called when we want to stop everything
  const abortAll = (reason?: string) => {
    if (!signal.aborted) {
      abortController.abort(reason || 'Flow stopped');
    }
  };

  // --- Graph setup ------------------------------------------------------------
  const { nodeById, nonGroupCount, inDegree, outgoingMap, incomingMap } =
    buildGraphMaps(nodes, edges);

  // Topological sort + cycle detection (still needed to compute initial queue)
  const sortedIds = performTopologicalSort(inDegree, outgoingMap, nonGroupCount);

  // --- Runtime state ----------------------------------------------------------
  const nodeResults  = new Map<string, unknown>();
  const nodeStatus   = new Map<string, NodeStatus>();
  const pendingCount = new Map<string, number>(inDegree); // mutable copy

  sortedIds.forEach(id => nodeStatus.set(id, 'pending'));

  let finalOutput = '';
  let finalError: string | null = null;
  let executedNodeCount = 0;
  const flowStartTime = Date.now();

  // ---------------------------------------------------------------------------
  // processNode – executes a single node, updates status & results
  // ---------------------------------------------------------------------------
  const processNode = async (nodeId: string): Promise<void> => {
    if (isStopped()) return; // honour abort signal silently

    // Circuit Breaker: max node count
    executedNodeCount += 1;
    if (executedNodeCount > MAX_FLOW_NODES) {
      const msg = `Circuit Breaker: Maximum node execution limit (${MAX_FLOW_NODES}) exceeded. Possible infinite loop detected.`;
      log(`[Error] ${msg}`);
      abortAll(msg);
      throw new Error(msg);
    }

    // Circuit Breaker: global timeout
    if (Date.now() - flowStartTime > GLOBAL_FLOW_TIMEOUT) {
      const msg = `Circuit Breaker: Flow execution exceeded global timeout of ${GLOBAL_FLOW_TIMEOUT / 1000}s.`;
      log(`[Error] ${msg}`);
      abortAll(msg);
      throw new Error(msg);
    }

    const node = nodeById.get(nodeId);
    if (!node) return;
    const nodeLabel = String(node.data.label || node.data.type || nodeId);

    // --- Dead-Path Elimination -----------------------------------------------
    if (shouldSkipNode(nodeId, incomingMap, nodeById, nodeResults, nodeStatus)) {
      log(`[Server] Skipping node (dead path): ${nodeLabel} (${nodeId})`);
      nodeStatus.set(nodeId, 'skipped');
      emit({
        type: 'nodeUpdate',
        nodeId,
        data: { status: 'idle', errorMessage: undefined },
      });
      return; // skip quietly – children resolved by the scheduler below
    }

    // --- Execute -------------------------------------------------------------
    log(`[Server] Starting node: ${nodeLabel} (${nodeId})`);
    nodeStatus.set(nodeId, 'running');
    emit({
      type: 'nodeUpdate',
      nodeId,
      data: { status: 'running', lastInput: undefined, lastOutput: undefined, errorMessage: undefined },
    });

    // Resolve config with dynamic node-output references
    const resolvedNode = resolveNodeConfig(node, globalVariables, nodeResults);

    // Collect live inputs (DPE-aware)
    const inputs = collectNodeInputs(nodeId, incomingMap, nodeById, nodeResults, nodeStatus, inputMessage);

    let result: unknown = null;
    try {
      const availableTools = ((inputs.tools || []) as AgentTool[])
        .filter(t => t?.type === 'tool') as unknown as ToolDefinition[];

      const executeToolByName = async (name: string, callArgs: Record<string, string>) => {
        const toolDef = availableTools.find(t => t.name === name);
        if (!toolDef) return `Error: tool "${name}" not registered.`;
        const toolNode = nodeById.get(String(toolDef.nodeId || ''));
        if (!toolNode) return 'Error: tool node not found in graph.';
        return executeToolNode(toolNode, callArgs, { toolDef, log, inputs });
      };

      const ctx: FlowRuntimeContext = {
        userId,
        inputs,
        node: resolvedNode,
        isStopped,
        signal,              // AbortSignal for cancellable fetch / LLM calls
        emit,
        executeToolByName,
        availableTools,
        incomingMap,
        nodeById,
        nodeResults,         // Live results for dynamic resolution
        log,
        globalVariables,
        onEvent,
        chatHistory,
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
      // If aborted externally, swallow – don't double-report
      if (signal.aborted) {
        nodeStatus.set(nodeId, 'error');
        return;
      }

      const message = err instanceof Error ? err.message : String(err);
      const relatedNodeIds = err instanceof NodeExecutionError ? err.relatedNodeIds : [];

      log(`[Server] Node failed: ${nodeLabel} (${nodeId}) -> ${message}`);
      emit({
        type: 'nodeUpdate',
        nodeId,
        data: { status: 'error', lastInput: inputs, errorMessage: message },
      });
      emit({ type: 'error', message: `Node [${node.data.label}] failed: ${message}`, nodeId });

      relatedNodeIds.forEach(relatedNodeId => {
        const relatedNode = nodeById.get(relatedNodeId);
        emit({ type: 'nodeUpdate', nodeId: relatedNodeId, data: { status: 'error', errorMessage: message } });
        emit({ type: 'error', message: `Node [${relatedNode?.data?.label || relatedNodeId}] failed: ${message}`, nodeId: relatedNodeId });
      });

      nodeStatus.set(nodeId, 'error');
      abortAll(message); // Cancel remaining running nodes immediately
      throw err instanceof Error ? err : new Error(message);
    }

    nodeStatus.set(nodeId, 'success');
    nodeResults.set(nodeId, result);
    emit({
      type: 'nodeUpdate',
      nodeId,
      data: { status: 'success', lastInput: inputs, lastOutput: result },
    });
  };

  // ---------------------------------------------------------------------------
  // Event-Driven Dynamic Scheduler
  // ---------------------------------------------------------------------------

  const readyQueue: string[] = sortedIds.filter(id => (pendingCount.get(id) ?? 0) === 0);
  const inFlight = new Set<string>();
  let firstError: Error | null = null;

  try {
    await new Promise<void>((resolve, reject) => {
      const tryDispatch = () => {
        if (firstError) {
          if (inFlight.size === 0) {
            reject(firstError);
          }
          return;
        }

        while (readyQueue.length > 0 && inFlight.size < MAX_CONCURRENCY) {
          const nodeId = readyQueue.shift()!;
          inFlight.add(nodeId);

          processNode(nodeId)
            .then(() => {
              inFlight.delete(nodeId);

              for (const childId of (outgoingMap.get(nodeId) || [])) {
                const remaining = (pendingCount.get(childId) ?? 0) - 1;
                pendingCount.set(childId, remaining);
                if (remaining <= 0) {
                  readyQueue.push(childId);
                }
              }

              tryDispatch(); 
            })
            .catch((err: Error) => {
              inFlight.delete(nodeId);
              if (!firstError) {
                firstError = err;
                abortAll();
              }
              tryDispatch();
            });
        }

        if (readyQueue.length === 0 && inFlight.size === 0) {
          if (firstError) {
            reject(firstError);
          } else {
            resolve();
          }
        }
      };

      tryDispatch();
    });

    // Update DB on success
    if (dbExecutionId) {
      await prisma.flowExecution.update({
        where: { id: dbExecutionId },
        data: {
          status: 'success',
          output: finalOutput,
          endedAt: new Date(),
        },
      }).catch(err => console.error('Failed to update execution success:', err));
    }
  } catch (err: any) {
    finalError = err.message || String(err);
    // Update DB on error
    if (dbExecutionId) {
      await prisma.flowExecution.update({
        where: { id: dbExecutionId },
        data: {
          status: 'error',
          error: finalError,
          endedAt: new Date(),
        },
      }).catch(e => console.error('Failed to update execution error:', e));
    }
    throw err;
  }

  // ---------------------------------------------------------------------------
  // Finalise
  // ---------------------------------------------------------------------------
  const output = { text: finalOutput };
  emit({ type: 'result', output });
  return { events, output };
}
