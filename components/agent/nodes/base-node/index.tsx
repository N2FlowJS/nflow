import { Handle, Position } from '@xyflow/react';
import { Card } from 'antd';
import React, { memo, useMemo } from 'react';
import { useFlowState } from '../../../../context/FlowStateContext';
import { NodeData } from '../../../../models/flowTypes';
import { NODE_REGISTRY } from '../../../../utils/client';
import { getHandleStyle } from './handle-icon';
import NodeHeader from './node-header';

interface BaseNodeProps {
  data: NodeData;
  id: string;
  selected: boolean;
  handlePositions: {
    input: Position[];
    output: Position[];
  };
  children?: React.ReactNode;
  icon?: React.ReactNode;
  role?: 'developer' | 'assistant' | 'system' | 'user';
}

const BaseNode: React.FC<BaseNodeProps> = ({ data, id, selected, handlePositions, children, icon, role }) => {
  const nodeConfig = NODE_REGISTRY[data.type];
  const { flowState } = useFlowState();

  // Properly memoize the execution check to prevent infinite loops
  const isExecutedNode = useMemo(() => {
    if (!flowState?.components) return false;

    const component = flowState.components[id];
    if (!component) return false;

    return component.executionTime > flowState.executionTime;
  }, [flowState?.components, flowState?.executionTime, id]);

  const borderColor = selected ? 'red' : isExecutedNode ? '#52c41a' : nodeConfig?.color.border || '#888888';
  const borderWidth = selected || isExecutedNode ? '3px' : '3px';
  const boxShadow = isExecutedNode ? '0 0 32px #52c41a' : undefined;

  return (
    <Card
      style={{
        borderColor,
        borderWidth,
        boxShadow,
      }}>
      <NodeHeader id={id} name={data.form?.name} type={data.type} icon={icon} role={role} />
      {children && <div style={{ padding: '10px 0' }}>{children}</div>}
      {handlePositions.input.flatMap((position: Position) => (
        <Handle key={`in-${position}`} type="target" position={position} style={getHandleStyle && getHandleStyle(position, 'target')} id={`in-${position}`} />
      ))}

      {handlePositions.output.flatMap((position) => (
        <Handle key={`out-${position}`} type="source" position={position} style={getHandleStyle && getHandleStyle(position, 'source')} id={`out-${position}`} />
      ))}
    </Card>
  );
};

export default memo(BaseNode);
