import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { WebClickNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { InteractionOutlined } from '@ant-design/icons';
import { Typography, Space, Tag } from 'antd';

const { Text } = Typography;

const WebClickNode = ({ data, id, selected }: NodeProps<Node<WebClickNodeData>>) => {
  const { form } = data;
  const selector = form?.selector || 'No selector';
  const displaySelector = selector.length > 25 ? selector.substring(0, 25) + '...' : selector;
  const selectorType = form?.selectorType || 'css';
  const clickType = form?.clickType || 'single';

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left],
        output: [Position.Right],
      }}
      icon={<InteractionOutlined style={{ color: '#52c41a' }} />}
      role={data.form?.role}
    >
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {displaySelector}
        </Text>
        <Space size={4}>
          <Tag color="blue" style={{ fontSize: '10px', margin: 0 }}>
            {selectorType}
          </Tag>
          <Tag color="green" style={{ fontSize: '10px', margin: 0 }}>
            {clickType}
          </Tag>
        </Space>
      </Space>
    </BaseNode>
  );
};

export default WebClickNode;
