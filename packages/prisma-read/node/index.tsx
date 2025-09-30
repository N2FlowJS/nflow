import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { PrismaReadNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { DatabaseOutlined } from '@ant-design/icons';

const PrismaReadNode = ({ data, id, selected }: NodeProps<Node<PrismaReadNodeData>>) => {
  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left, Position.Right],
        output: [Position.Right, Position.Left],
      }}
      icon={<DatabaseOutlined style={{ color: '#52c41a' }} />}
      role={data.form?.role}
    >
      <div>
        <div><b>Model:</b> {data.form?.model || 'N/A'}</div>
        <div><b>Filter:</b> {data.form?.filter || 'None'}</div>
        <div><b>Limit:</b> {data.form?.limit || 10}</div>
      </div>
    </BaseNode>
  );
};

export default PrismaReadNode;
