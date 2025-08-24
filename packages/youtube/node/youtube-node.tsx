import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { YouTubeNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { Flex, Typography, Tag } from 'antd';
import { YoutubeOutlined } from '@ant-design/icons';

const { Text } = Typography;

const YouTubeNode = ({ data, id, selected }: NodeProps<Node<YouTubeNodeData>>) => {
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
      icon={<YoutubeOutlined style={{ color: '#FF0000' }} />}
      role={data.form?.role}>
      <Flex vertical gap={8}>
        {form?.action && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Action:
            </Text>
            <Tag color="red" style={{ fontSize: '10px', margin: 0 }}>
              {form.action.replace('_', ' ').toUpperCase()}
            </Tag>
          </Flex>
        )}

        {form?.channelId && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Channel:
            </Text>
            <Text
              style={{
                fontSize: '10px',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
              {form.channelId}
            </Text>
          </Flex>
        )}

        {form?.title && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Title:
            </Text>
            <Text
              style={{
                fontSize: '10px',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
              {form.title}
            </Text>
          </Flex>
        )}

        {form?.privacy && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Privacy:
            </Text>
            <Tag
              color={form.privacy === 'public' ? 'green' : form.privacy === 'private' ? 'red' : 'orange'}
              style={{ fontSize: '10px', margin: 0, textTransform: 'capitalize' }}>
              {form.privacy}
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default YouTubeNode;
