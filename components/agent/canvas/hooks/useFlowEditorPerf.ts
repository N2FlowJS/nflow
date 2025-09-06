import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type Edge,
  type NodeChange as RFNodeChange,
  type EdgeChange as RFEdgeChange,
} from '@xyflow/react';
import { useEdgesWithDragFlag } from './useEdgesWithDragFlag';
import { FlowNode } from '../../../../models/flowTypes';

type NodeChange = RFNodeChange<FlowNode>;
type EdgeChangeT = RFEdgeChange<Edge>;

export function useFlowEditorPerf(params: {
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChangeT[]) => void;
  onEdgeDelete: (...args: any[]) => void;
  edges: Edge[];
}) {
  const { onNodesChange, onEdgesChange, onEdgeDelete, edges } = params;

  // Drag state and throttling
  const [isDragging, setIsDragging] = useState(false);
  const dragRaf = useRef<number | null>(null);

  // rAF-batching for changes
  const nodeBatchRaf = useRef<number | null>(null);
  const pendingNodeChanges = useRef<NodeChange[]>([]);
  const edgeBatchRaf = useRef<number | null>(null);
  const pendingEdgeChanges = useRef<EdgeChangeT[]>([]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      pendingNodeChanges.current.push(...changes);
      if (nodeBatchRaf.current) return;
      nodeBatchRaf.current = requestAnimationFrame(() => {
        onNodesChange(pendingNodeChanges.current);
        pendingNodeChanges.current = [];
        nodeBatchRaf.current = null;
      });
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChangeT[]) => {
      pendingEdgeChanges.current.push(...changes);
      if (edgeBatchRaf.current) return;
      edgeBatchRaf.current = requestAnimationFrame(() => {
        onEdgesChange(pendingEdgeChanges.current);
        pendingEdgeChanges.current = [];
        edgeBatchRaf.current = null;
      });
    },
    [onEdgesChange]
  );

  const handleNodeDragStart = useCallback(() => {
    if (dragRaf.current) cancelAnimationFrame(dragRaf.current);
    setIsDragging(true);
  }, []);

  const handleNodeDrag = useCallback(() => {
    if (dragRaf.current) return;
    dragRaf.current = requestAnimationFrame(() => {
      dragRaf.current = null;
    });
  }, []);

  const handleNodeDragStop = useCallback(() => {
    if (dragRaf.current) cancelAnimationFrame(dragRaf.current);
    setIsDragging(false);
  }, []);

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);
  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'default' as const,
      data: { onDelete: onEdgeDelete },
    }),
    [onEdgeDelete]
  );

  const edgesForRender = useEdgesWithDragFlag(edges, isDragging);

  // Cleanup any pending RAFs on unmount
  useEffect(() => {
    return () => {
      if (dragRaf.current) cancelAnimationFrame(dragRaf.current);
      if (nodeBatchRaf.current) cancelAnimationFrame(nodeBatchRaf.current);
      if (edgeBatchRaf.current) cancelAnimationFrame(edgeBatchRaf.current);
    };
  }, []);

  return {
    isDragging,
    handleNodeDragStart,
    handleNodeDrag,
    handleNodeDragStop,
    handleNodesChange,
    handleEdgesChange,
    proOptions,
    defaultEdgeOptions,
    edgesForRender,
  } as const;
}
