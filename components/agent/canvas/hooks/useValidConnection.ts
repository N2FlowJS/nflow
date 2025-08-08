import { useCallback } from 'react';
import { Connection, Edge } from '@xyflow/react';
import { FlowNode, NodeTypeString } from '../../../../models/flowTypes';
import { isConnectionAllowed } from '../../../../utils/client/connectionRules';

export const useValidConnection = (nodes: FlowNode[]) => {
  return useCallback(
    (params: Connection | Edge) => {
      const sourceNode = nodes.find((node) => node.id === params.source);
      const targetNode = nodes.find((node) => node.id === params.target);

      if (sourceNode && targetNode) {
        const sourceType = sourceNode.type as NodeTypeString;
        const targetType = targetNode.type as NodeTypeString;
        return isConnectionAllowed(sourceType, targetType);
      }

      return false;
    },
    [nodes]
  );
};
