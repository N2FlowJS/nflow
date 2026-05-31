import type { FlowNode, FlowEdge } from '../../flowTypes';
import { resolveVariablePlaceholders } from '../../utils/common';
import type { NodeStatus } from './graphBuilder';

// ---------------------------------------------------------------------------
// Input resolution
// ---------------------------------------------------------------------------

/**
 * Collect data inputs for a target node from its incoming edges, applying:
 *   - Dead-Path Elimination (DPE): skip values from skipped nodes
 *   - ConditionComponent routing: only pass the edge that matches the result
 *   - Dynamic node-output referencing: resolve {{nodes.ID.field}} placeholders
 */
export function collectNodeInputs(
  nodeId: string,
  incomingMap: Map<string, FlowEdge[]>,
  nodeById: Map<string, FlowNode>,
  nodeResults: Map<string, unknown>,
  nodeStatus: Map<string, NodeStatus>,
  inputMessage?: string,
): Record<string, unknown[]> {
  const incoming = incomingMap.get(nodeId) || [];
  const inputs: Record<string, unknown[]> = {};

  for (const edg of incoming) {
    // DPE: ignore data coming from a skipped source
    const srcStatus = nodeStatus.get(edg.source);
    if (srcStatus === 'skipped') continue;

    const key = edg.targetHandle || edg.source;
    if (!inputs[key]) inputs[key] = [];

    const val = nodeResults.get(edg.source);
    const srcNode = nodeById.get(edg.source);

    // ConditionComponent: only accept the matching branch handle
    if (srcNode?.data?.type === 'ConditionComponent') {
      if (String(val) !== edg.sourceHandle) continue;
    }

    inputs[key].push(val);
  }

  if (inputMessage) {
    if (!inputs['inputMessage']) inputs['inputMessage'] = [];
    inputs['inputMessage'].push(inputMessage);
  }

  return inputs;
}

// ---------------------------------------------------------------------------
// Config resolution
// ---------------------------------------------------------------------------

/**
 * Resolve static variable placeholders in node params/configSchema,
 * AND dynamic node-output references: {{nodes.NODE_ID}} or {{nodes.NODE_ID.fieldName}}.
 */
export function resolveNodeConfig(
  node: FlowNode,
  globalVariables: any[],
  nodeResults: Map<string, unknown>,
): FlowNode {
  const nodeResultsObj = Object.fromEntries(nodeResults.entries());

  const resolveDynamic = (value: unknown): unknown => {
    // Recursively handle objects and arrays
    if (Array.isArray(value)) {
      return value.map(v => resolveDynamic(v));
    }
    if (value && typeof value === 'object') {
      const resolved: Record<string, any> = {};
      for (const [k, v] of Object.entries(value)) {
        resolved[k] = resolveDynamic(v);
      }
      return resolved;
    }

    // First pass: static globals + env secrets
    const afterStatic = resolveVariablePlaceholders(value, globalVariables) as unknown;

    // Second pass: {{nodes.ID}} / {{nodes.ID.field}}
    if (typeof afterStatic !== 'string') return afterStatic;
    return afterStatic.replace(/\{\{\s*nodes\.([^.}\s]+)(?:\.([^}\s]+))?\s*\}\}/g, (_m, id, field) => {
      const nodeOutput = nodeResultsObj[id];
      if (nodeOutput === undefined) return _m;
      if (!field) return String(nodeOutput ?? '');
      if (nodeOutput && typeof nodeOutput === 'object') {
        return String((nodeOutput as Record<string, unknown>)[field] ?? '');
      }
      return _m;
    });
  };

  return {
    ...node,
    data: {
      ...node.data,
      params: resolveDynamic(node.data?.params || {}) as Record<string, unknown>,
      configSchema: node.data?.configSchema?.map((field: any) => ({
        ...field,
        value: resolveDynamic(field.value),
      })),
    },
  };
}

// ---------------------------------------------------------------------------
// Dead-Path Elimination (DPE)
// ---------------------------------------------------------------------------

/**
 * Determines whether a node should be SKIPPED based on its incoming edges:
 * - A node is skipped when ALL active (non-skipped) source nodes have been
 *   resolved AND none of them contributed a live input value to this node.
 *
 * Returns true  → skip this node
 * Returns false → execute this node normally
 */
export function shouldSkipNode(
  nodeId: string,
  incomingMap: Map<string, FlowEdge[]>,
  nodeById: Map<string, FlowNode>,
  nodeResults: Map<string, unknown>,
  nodeStatus: Map<string, NodeStatus>,
): boolean {
  const incoming = incomingMap.get(nodeId) || [];
  if (incoming.length === 0) return false; // root node → never skip

  let activeInputCount = 0;
  for (const edg of incoming) {
    const srcStatus = nodeStatus.get(edg.source);
    if (srcStatus === 'skipped') continue; // DPE: skip propagates

    const val = nodeResults.get(edg.source);
    const srcNode = nodeById.get(edg.source);

    if (srcNode?.data?.type === 'ConditionComponent') {
      if (String(val) === edg.sourceHandle) activeInputCount++;
    } else {
      activeInputCount++; // normal edge → active
    }
  }

  return activeInputCount === 0;
}
