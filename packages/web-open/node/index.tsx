import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { WebOpenNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { GlobalOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

const { Text } = Typography;

const WebOpenNode = ({ data, id, selected }: NodeProps<Node<WebOpenNodeData>>) => {
  const { form } = data;
  const url = form?.url || 'No URL';
  const displayUrl = url.length > 30 ? url.substring(0, 30) + '...' : url;

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left],
        output: [Position.Right],
      }}
      icon={<GlobalOutlined style={{ color: '#1890ff' }} />}
      role={data.form?.role}
    >
      <div style={{ padding: '4px 0' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {displayUrl}
        </Text>
      </div>
    </BaseNode>
  );
};

export default WebOpenNode;
