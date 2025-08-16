import { useEffect, useState, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import { FlowNode } from '../../../models/flowTypes'; // TODO: consider path alias

export interface PredecessorVariable {
  id: string;
  display: string;
}

export const usePredecessorNodes = (nodeId: string) => {
  const { getNodes, getEdges } = useReactFlow();
  const [predecessorNodes, setPredecessorNodes] = useState<FlowNode[]>([]);

  useEffect(() => {
    const nodes = getNodes();
    const edges = getEdges();
    if (!nodes?.length || !edges?.length) { setPredecessorNodes([]); return; }

    const nodesMap = new Map(nodes.map(n => [n.id, n] as const));
    const incomingMap = new Map<string, string[]>();
    for (const e of edges) {
      if (!e?.target || !e?.source) continue;
      const arr = incomingMap.get(e.target) ?? [];
      arr.push(e.source);
      incomingMap.set(e.target, arr);
    }
    const visited = new Set<string>();
    const found: FlowNode[] = [];
    const dfs = (currentId: string) => {
      if (visited.has(currentId)) return;
      visited.add(currentId);
      const incoming = incomingMap.get(currentId);
      if (!incoming?.length) return;
      for (const srcId of incoming) {
        const srcNode = nodesMap.get(srcId) as FlowNode | undefined;
        if (!srcNode) continue;
        found.push(srcNode);
        if (srcNode.type !== 'interface') dfs(srcId);
      }
    };
    dfs(nodeId);
    setPredecessorNodes(found);
  }, [nodeId, getNodes, getEdges]);

  const predecessorVariables = useMemo(() => predecessorNodes.map(n => ({
    id: n.id,
    display: n.data?.form?.name || n.id
  })), [predecessorNodes]);

  return { predecessorNodes, predecessorVariables };
};
