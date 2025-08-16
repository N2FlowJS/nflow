import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { MattermostNodeData } from '../../../../models/flowTypes';
import { BaseNode } from '@n2flowjs/flow';
import { Flex } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import MattermostConnectionInfo from './MattermostConnectionInfo';
import MattermostActionInfo from './MattermostActionInfo';

const MattermostNode = ({ data, id, selected }: NodeProps<Node<MattermostNodeData>>) => {
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
      icon={<MessageOutlined style={{ color: '#0072C6' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <MattermostConnectionInfo 
          serverUrl={form?.serverUrl || ''}
          hasToken={!!form?.accessToken}
        />
        <MattermostActionInfo 
          action={form?.action || 'send_message'}
          channelId={form?.channelId}
          teamId={form?.teamId}
        />
      </Flex>
    </BaseNode>
  );
};

export default MattermostNode;
