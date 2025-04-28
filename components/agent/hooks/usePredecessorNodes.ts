import { useEffect, useState, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import { FlowNode } from '@/models/flowTypes';

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

        // Create a map for O(1) node lookups
        const nodesMap = new Map(nodes.map(node => [node.id, node]));

        // Track visited nodes to prevent cycles
        const visited = new Set<string>();

        // Store all predecessor nodes
        const foundNodes: FlowNode[] = [];

        // Recursive function to traverse predecessors
        const findPredecessors = (currentNodeId: string) => {
            // Skip if already visited
            if (visited.has(currentNodeId)) return;
            visited.add(currentNodeId);

            // Find all direct incoming edges to this node
            const incomingEdges = edges.filter(edge => edge.target === currentNodeId);

            // Process each predecessor
            for (const edge of incomingEdges) {
                const sourceId = edge.source;
                const sourceNode = nodesMap.get(sourceId) as FlowNode;

                if (!sourceNode) continue;

                // Add the node to our results
                foundNodes.push(sourceNode);

                // Stop at interface nodes, continue recursion for others
                if (sourceNode.type !== 'interface') {
                    findPredecessors(sourceId);
                }
            }
        };

        // Start recursion from the selected node
        findPredecessors(nodeId);
        setPredecessorNodes(foundNodes);
    }, [nodeId, getNodes, getEdges]);

    // Derive variables from nodes for mention suggestions
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
