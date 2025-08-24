import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { LinkedInNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { Flex, Typography, Tag } from 'antd';
import { LinkedinOutlined } from '@ant-design/icons';

const { Text } = Typography;

const LinkedInNode = ({ data, id, selected }: NodeProps<Node<LinkedInNodeData>>) => {
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
      icon={<LinkedinOutlined style={{ color: '#0077B5' }} />}
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

        {form?.visibility && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Visibility:</Text>
            <Tag 
              color={form.visibility === 'public' ? 'green' : 'orange'} 
              style={{ fontSize: '10px', margin: 0, textTransform: 'capitalize' }}
            >
              {form.visibility}
            </Tag>
          </Flex>
        )}

        {form?.postText && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Post:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.postText}
            </Text>
          </Flex>
        )}

        {form?.articleTitle && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Article:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.articleTitle}
            </Text>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default LinkedInNode;
