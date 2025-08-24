import { useCallback } from 'react';
import { Connection, Edge } from '@xyflow/react';
import { FlowNode } from '../../../../models/flowTypes';

export const useValidConnection = (nodes: FlowNode[]) => {
  return useCallback(
    (params: Connection | Edge) => {
      const sourceNode = nodes.find((node) => node.id === params.source);
      const targetNode = nodes.find((node) => node.id === params.target);

      if (sourceNode && targetNode) {
  return true; // always allow
      }

      return false;
    },
    [nodes]
  );
};
