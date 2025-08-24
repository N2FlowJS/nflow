import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { TelegramNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { Flex, Typography, Tag } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';

const { Text } = Typography;

const TelegramNode = ({ data, id, selected }: NodeProps<Node<TelegramNodeData>>) => {
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
      icon={<PhoneOutlined style={{ color: '#0088CC' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.action && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Action:
            </Text>
            <Tag
              color="cyan"
              style={{ fontSize: '10px', margin: 0 }}
            >
              {form.action.replace('_', ' ').toUpperCase()}
            </Tag>
          </Flex>
        )}

        {form?.chatId && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Chat:
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
              {form.chatId}
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

        {form?.caption && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Caption:
            </Text>
            <Tag color="blue" style={{ fontSize: '10px', margin: 0 }}>
              Provided
            </Tag>
          </Flex>
        )}

        {form?.photoUrl && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Media:
            </Text>
            <Tag color="green" style={{ fontSize: '10px', margin: 0 }}>
              Photo
            </Tag>
          </Flex>
        )}

        {form?.pollQuestion && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Poll:
            </Text>
            <Tag color="gold"  style={{ fontSize: '10px', margin: 0 }}>
              Interactive
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default TelegramNode;
