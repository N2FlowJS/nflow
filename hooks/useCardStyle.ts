import { NodeConfig } from '@n2flowjs/flow';
import { useMemo } from 'react';

interface UseCardStyleProps {
  selected: boolean;
  isExecutedNode: boolean;
  nodeConfig: NodeConfig | undefined;
}

export const useCardStyle = ({ selected, isExecutedNode, nodeConfig }: UseCardStyleProps) => {
  return useMemo(() => {
    const borderColor = selected ? 'red' : isExecutedNode ? '#52c41a' : '#888888';
    const borderWidth = selected || isExecutedNode ? '3px' : '3px';
    const boxShadow = isExecutedNode ? '0 0 32px #52c41a' : undefined;

    return {
      borderColor,
      borderWidth,
      boxShadow,
    };
  }, [selected, isExecutedNode, nodeConfig]);
};
