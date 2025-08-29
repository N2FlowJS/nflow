import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { SlackNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { Flex } from 'antd';
import { SlackOutlined } from '@ant-design/icons';
import SlackConnectionInfo from './SlackConnectionInfo';
import SlackActionInfo from './SlackActionInfo';

const SlackNode = ({ data, id, selected }: NodeProps<Node<SlackNodeData>>) => {
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
      icon={<SlackOutlined style={{ color: '#4A154B' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <SlackConnectionInfo 
          hasToken={!!form?.botToken}
        />
        <SlackActionInfo 
          action={form?.action || 'send_message'}
          channelId={form?.channelId}
          fileName={form?.fileName}
        />
      </Flex>
    </BaseNode>
  );
};

export default SlackNode;
