import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { SubAgentNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { Flex } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import AgentInfo from './AgentInfo';
import ConfigInfo from './ConfigInfo';

const SubAgentNode = ({ data, id, selected }: NodeProps<Node<SubAgentNodeData>>) => {
  const { form } = data;

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left, Position.Right, Position.Top],
        output: [Position.Right, Position.Left],
      }}
      icon={<TeamOutlined style={{ color: '#13c2c2' }} />}
      role={data.form?.role}>
      <Flex vertical gap={8}>
        <AgentInfo agentId={form?.agentId || ''} agentName={form?.agentName || ''} />
        <ConfigInfo
          timeout={form?.timeout ?? 300}
          inheritContext={form?.inheritContext ?? true}
          variableCount={Object.keys(form?.variables || {}).length}
        />
      </Flex>
    </BaseNode>
  );
};

export default SubAgentNode;
