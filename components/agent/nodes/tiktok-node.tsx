import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { TikTokNodeData } from '../../../models/flowTypes';
import BaseNode from './base-node';
import { Flex, Typography, Tag } from 'antd';
import { CustomerServiceOutlined } from '@ant-design/icons';

const { Text } = Typography;

const TikTokNode = ({ data, id, selected }: NodeProps<Node<TikTokNodeData>>) => {
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
      icon={<CustomerServiceOutlined style={{ color: '#FF0050' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.action && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Action:
            </Text>
            <Tag color="magenta"  style={{ fontSize: '10px', margin: 0 }}>
              {form.action.replace('_', ' ').toUpperCase()}
            </Tag>
          </Flex>
        )}

        {form?.privacy && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Privacy:
            </Text>
            <Tag
              color={
                form.privacy === 'public'
                  ? 'green'
                  : form.privacy === 'private'
                  ? 'red'
                  : 'orange'
              }
              style={{ fontSize: '10px', margin: 0, textTransform: 'capitalize' }}
            >
              {form.privacy}
            </Tag>
          </Flex>
        )}

        {form?.caption && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Caption:
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
              {form.caption}
            </Text>
          </Flex>
        )}

        {form?.hashtag && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Hashtag:
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
              #{form.hashtag}
            </Text>
          </Flex>
        )}

        {form?.maxResults && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Max Results:
            </Text>
            <Tag color="cyan" style={{ fontSize: '10px', margin: 0 }}>
              {form.maxResults}
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default TikTokNode;
