import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { AgentNodeData } from '../../../../models/flowTypes';
import BaseNode from '../base-node';
import { ApartmentOutlined } from '@ant-design/icons';
import AgentConfigInfo from './AgentConfigInfo';
import ConfigInfo from './ConfigInfo';

const AgentNode = ({ data, id, selected }: NodeProps<Node<AgentNodeData>>) => {
  const { form } = data;

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left, Position.Right],
        output: [Position.Bottom, Position.Bottom, Position.Right],
      }}
      icon={<ApartmentOutlined style={{ color: '#1890ff' }} />}
      role={data.form?.role}>
      <AgentConfigInfo systemMessage={form?.systemMessage || ''} />
      <ConfigInfo inheritContext={true} timeout={form.inputRefs} variableCount={form?.variables?.length || 0} />
    </BaseNode>
  );
};

export default AgentNode;
