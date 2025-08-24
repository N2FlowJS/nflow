import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { DiscordNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { Flex, Typography, Tag } from 'antd';
import { RobotOutlined } from '@ant-design/icons';

const { Text } = Typography;

const DiscordNode = ({ data, id, selected }: NodeProps<Node<DiscordNodeData>>) => {
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
      icon={<RobotOutlined style={{ color: '#5865F2' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.action && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Action:
            </Text>
            <Tag color="purple"  style={{ fontSize: '10px', margin: 0 }}>
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
              }}
            >
              {form.channelId}
            </Text>
          </Flex>
        )}

        {form?.guildId && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Server:
            </Text>
            <Text
              style={{
                fontSize: '10px',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {form.guildId}
            </Text>
          </Flex>
        )}

        {form?.message && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Message:
            </Text>
            <Text
              style={{
                fontSize: '10px',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {form.message}
            </Text>
          </Flex>
        )}

        {form?.embedTitle && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Embed:
            </Text>
            <Tag color="geekblue" style={{ fontSize: '10px', margin: 0 }}>
              Rich Message
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default DiscordNode;
