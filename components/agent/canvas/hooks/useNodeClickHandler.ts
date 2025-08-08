import { useCallback } from 'react';
import { FlowNode } from '../../../../models/flowTypes';

export const useNodeClickHandler = (
  setSelectedNode: React.Dispatch<React.SetStateAction<FlowNode | null>>
) => {
  return useCallback(
    (_: React.MouseEvent, node: FlowNode) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );
};
