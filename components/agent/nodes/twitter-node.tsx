import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { TwitterNodeData } from '../../../models/flowTypes';
import { BaseNode } from '@n2flowjs/flow';
import { Flex, Typography, Tag } from 'antd';
import { TwitterOutlined } from '@ant-design/icons';

const { Text } = Typography;

const TwitterNode = ({ data, id, selected }: NodeProps<Node<TwitterNodeData>>) => {
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
      icon={<TwitterOutlined style={{ color: '#1DA1F2' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.action && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Action:</Text>
            <Tag color="blue"  style={{ fontSize: '10px', margin: 0 }}>
              {form.action.replace('_', ' ').toUpperCase()}
            </Tag>
          </Flex>
        )}

        {form?.username && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>User:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              @{form.username}
            </Text>
          </Flex>
        )}

        {form?.tweetText && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Tweet:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.tweetText}
            </Text>
          </Flex>
        )}

        {form?.maxResults && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Max Results:</Text>
            <Tag color="cyan" style={{ fontSize: '10px', margin: 0 }}>
              {form.maxResults}
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default TwitterNode;
