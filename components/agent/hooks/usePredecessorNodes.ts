import { useEffect, useState, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import { FlowNode } from '../../../models/flowTypes';

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

        if (!nodes?.length || !edges?.length) {
            setPredecessorNodes([]);
            return;
        }

        // O(1) lookups
        const nodesMap = new Map(nodes.map(n => [n.id, n] as const));

        // Build adjacency map of incoming edges once: targetId -> sourceIds[]
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
                // Stop at interface nodes, continue recursion for others
                if (srcNode.type !== 'interface') {
                    dfs(srcId);
                }
            }
        };

        dfs(nodeId);
        setPredecessorNodes(found);
    }, [nodeId, getNodes, getEdges]);

    const predecessorVariables = useMemo(() => {
        return predecessorNodes.map(node => ({
            id: node.id,
            display: node.data?.form?.name || node.id
        }));
    }, [predecessorNodes]);

    return {
        predecessorNodes,
        predecessorVariables
    };
};
