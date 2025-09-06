import { useEffect, useMemo, useRef } from 'react';
import { FlowNode } from '../../../../models/flowTypes';

export const useEdgeCleanup = (
  nodes: FlowNode[],
  setEdges: React.Dispatch<React.SetStateAction<any[]>>
) => {
  // Derive a stable key and Set of IDs to detect topology changes only
  const idKey = useMemo(() => nodes.map((n) => n.id).sort().join('|'), [nodes]);
  const idSet = useMemo(() => new Set(nodes.map((n) => n.id)), [idKey]);
  const prevKeyRef = useRef<string>('');

  useEffect(() => {
    if (prevKeyRef.current === idKey) return;
    prevKeyRef.current = idKey;
    setEdges((edges) => edges.filter((edge) => idSet.has(edge.source) && idSet.has(edge.target)));
  }, [idKey, idSet, setEdges]);
};
