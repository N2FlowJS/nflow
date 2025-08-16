import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { WhatsAppNodeData } from '../../../models/flowTypes';
import { BaseNode } from '@n2flowjs/flow';
import { Flex, Typography, Tag } from 'antd';
import { WhatsAppOutlined } from '@ant-design/icons';

const { Text } = Typography;

const WhatsAppNode = ({ data, id, selected }: NodeProps<Node<WhatsAppNodeData>>) => {
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
      icon={<WhatsAppOutlined style={{ color: '#25D366' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.action && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Action:</Text>
            <Tag color="green" style={{ fontSize: '10px', margin: 0 }}>
              {form.action.replace('_', ' ').toUpperCase()}
            </Tag>
          </Flex>
        )}

        {form?.phoneNumberId && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Phone ID:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.phoneNumberId}
            </Text>
          </Flex>
        )}

        {form?.recipientPhone && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>To:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.recipientPhone}
            </Text>
          </Flex>
        )}

        {form?.message && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Message:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.message}
            </Text>
          </Flex>
        )}

        {form?.templateName && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Template:</Text>
            <Tag color="blue"  style={{ fontSize: '10px', margin: 0 }}>
              {form.templateName}
            </Tag>
          </Flex>
        )}

        {form?.mediaType && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Media:</Text>
            <Tag 
              color={
                form.mediaType === 'image' ? 'green' : 
                form.mediaType === 'video' ? 'orange' : 
                form.mediaType === 'audio' ? 'purple' : 'blue'
              } 
              style={{ fontSize: '10px', margin: 0, textTransform: 'capitalize' }}
            >
              {form.mediaType}
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default WhatsAppNode;
