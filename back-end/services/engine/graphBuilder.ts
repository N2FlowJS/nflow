import type { FlowNode, FlowEdge } from '../../flowTypes';

/** Per-node execution status used internally by the scheduler. */
export type NodeStatus = 'pending' | 'running' | 'success' | 'skipped' | 'error';

export interface GraphMaps {
  nodeById: Map<string, FlowNode>;
  nonGroupCount: number;
  inDegree: Map<string, number>;
  outgoingMap: Map<string, string[]>;
  incomingMap: Map<string, FlowEdge[]>;
}

/** Build look-up maps (inDegree, adjacency, etc.) from raw node/edge arrays. */
export function buildGraphMaps(nodes: FlowNode[], edges: FlowEdge[]): GraphMaps {
  const nodeById    = new Map<string, FlowNode>(nodes.map(n => [n.id, n]));
  const nonGroupCount = nodes.filter(n => n.type !== 'cyberGroup').length;

  const inDegree    = new Map<string, number>();
  const outgoingMap = new Map<string, string[]>();
  const incomingMap = new Map<string, FlowEdge[]>();

  nodes.forEach(n => {
    if (n.type !== 'cyberGroup') {
      inDegree.set(n.id, 0);
      outgoingMap.set(n.id, []);
    }
  });

  edges.forEach(edg => {
    if (inDegree.has(edg.target)) {
      inDegree.set(edg.target, (inDegree.get(edg.target) || 0) + 1);
    }
    const out = outgoingMap.get(edg.source);
    if (out) out.push(edg.target);

    const inc = incomingMap.get(edg.target) || [];
    inc.push(edg);
    incomingMap.set(edg.target, inc);
  });

  return { nodeById, nonGroupCount, inDegree, outgoingMap, incomingMap };
}

/**
 * Kahn's algorithm for topological sort + cycle detection.
 * Returns sorted list of node IDs; throws on cycle.
 */
export function performTopologicalSort(
  inDegree: Map<string, number>,
  outgoingMap: Map<string, string[]>,
  nonGroupCount: number,
): string[] {
  const degree = new Map(inDegree);
  const queue: string[] = [];
  degree.forEach((d, id) => { if (d === 0) queue.push(id); });

  const sorted: string[] = [];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    sorted.push(cur);
    for (const nbr of (outgoingMap.get(cur) || [])) {
      const nd = (degree.get(nbr) ?? 1) - 1;
      degree.set(nbr, nd);
      if (nd === 0) queue.push(nbr);
    }
  }

  if (sorted.length !== nonGroupCount) {
    throw new Error('Cycle detected in the flow! Cannot execute.');
  }
  return sorted;
}
