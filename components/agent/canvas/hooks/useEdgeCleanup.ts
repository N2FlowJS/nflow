import { useEffect } from 'react';
import { FlowNode } from '../../../../models/flowTypes';

export const useEdgeCleanup = (
  nodes: FlowNode[],
  setEdges: React.Dispatch<React.SetStateAction<any[]>>
) => {
  useEffect(() => {
    const nodeIds = nodes.map((node) => node.id);
    setEdges((edges) => edges.filter((edge) => nodeIds.includes(edge.source) && nodeIds.includes(edge.target)));
  }, [nodes, setEdges]);
};
