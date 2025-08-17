import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { InstagramNodeData } from '../../../models/flowTypes';
import { BaseNode } from '@n2flowjs/flow';
import { Flex, Typography, Tag } from 'antd';
import { InstagramOutlined } from '@ant-design/icons';

const { Text } = Typography;

const InstagramNode = ({ data, id, selected }: NodeProps<Node<InstagramNodeData>>) => {
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
      icon={<InstagramOutlined style={{ color: '#E4405F' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.action && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Action:</Text>
            <Tag color="magenta"  style={{ fontSize: '10px', margin: 0 }}>
              {form.action.replace('_', ' ').toUpperCase()}
            </Tag>
          </Flex>
        )}

        {form?.mediaType && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Media:</Text>
            <Tag 
              color={form.mediaType === 'image' ? 'green' : form.mediaType === 'video' ? 'orange' : 'purple'} 
              style={{ fontSize: '10px', margin: 0, textTransform: 'capitalize' }}
            >
              {form.mediaType}
            </Tag>
          </Flex>
        )}

        {form?.caption && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Caption:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.caption}
            </Text>
          </Flex>
        )}

        {form?.mediaUrl && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Media URL:</Text>
            <Tag color="blue" style={{ fontSize: '10px', margin: 0 }}>
              Configured
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default InstagramNode;
