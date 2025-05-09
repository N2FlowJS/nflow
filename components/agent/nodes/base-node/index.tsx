import { Handle, Position } from '@xyflow/react';
import { Card } from 'antd';
import React, { memo } from 'react'; // Added useEffect
import { useFlowState } from '../../../../context/FlowStateContext'; // Import the context hook
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
  const { flowState } = useFlowState(); // Consume the context

  const isExecutedNode = React.useMemo(() => {
    return flowState && flowState.components && Object.keys(flowState.components).find((p) => flowState.components[p].executionTime > flowState.executionTime && p == id) != null;
  }, [flowState, id]);

  return (
    <Card
      style={{
        borderColor: selected ? 'red' : isExecutedNode ? '#52c41a' : nodeConfig?.color.border || '#888888', // Highlight executed node
        borderWidth: selected || isExecutedNode ? '3px' : '3px',
        boxShadow: isExecutedNode ? '0 0 32px #52c41a' : undefined,
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
