import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { DelayNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { ClockCircleOutlined } from '@ant-design/icons';
import DelayInfo from './DelayInfo';

const DelayNode = ({ data, id, selected }: NodeProps<Node<DelayNodeData>>) => {
  const { form } = data;

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left, Position.Right],
        output: [Position.Right, Position.Left],
      }}
      icon={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
      role={data.form?.role}
    >
      <DelayInfo 
        duration={form?.duration || 5}
        unit={form?.unit || 'seconds'}
      />
    </BaseNode>
  );
};

export default DelayNode;
