import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { WebhookNodeData } from '../../../../models/flowTypes';
import { BaseNode } from '@n2flowjs/flow';
import { LinkOutlined } from '@ant-design/icons';
import WebhookInfo from './WebhookInfo';

const WebhookNode = ({ data, id, selected }: NodeProps<Node<WebhookNodeData>>) => {
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
      icon={<LinkOutlined style={{ color: '#1677ff' }} />}
      role={data.form?.role}
    >
      <WebhookInfo
        method={form?.method || 'POST'}
        url={form?.webhookUrl || ''}
        retryCount={form?.retryCount || 0}
      />
    </BaseNode>
  );
};

export default WebhookNode;
