import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { WebTypingNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { EditOutlined } from '@ant-design/icons';
import { Typography, Space, Tag } from 'antd';

const { Text } = Typography;

const WebTypingNode = ({ data, id, selected }: NodeProps<Node<WebTypingNodeData>>) => {
  const { form } = data;
  const selector = form?.selector || 'No selector';
  const text = form?.text || 'No text';
  const displaySelector = selector.length > 25 ? selector.substring(0, 25) + '...' : selector;
  const displayText = text.length > 20 ? text.substring(0, 20) + '...' : text;
  const selectorType = form?.selectorType || 'css';

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left],
        output: [Position.Right],
      }}
      icon={<EditOutlined style={{ color: '#faad14' }} />}
      role={data.form?.role}
    >
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {displaySelector}
        </Text>
        <Text type="secondary" style={{ fontSize: '11px', fontStyle: 'italic' }}>
          → {displayText}
        </Text>
        <Tag color="blue" style={{ fontSize: '10px', margin: 0 }}>
          {selectorType}
        </Tag>
      </Space>
    </BaseNode>
  );
};

export default WebTypingNode;
