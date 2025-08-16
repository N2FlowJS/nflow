import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { CacheNodeData } from '../../../models/flowTypes';
import { BaseNode } from '../../../packages/@flow';
import { Flex, Typography, Tag } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Text } = Typography;

const CacheNode = ({ data, id, selected }: NodeProps<Node<CacheNodeData>>) => {
  const { form } = data;

  const getOperationColor = (operation: string) => {
    const colors: { [key: string]: string } = {
      set: 'green',
      get: 'blue',
      delete: 'red',
      clear: 'orange',
    };
    return colors[operation] || 'default';
  };

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left, Position.Right],
        output: [Position.Right, Position.Left],
      }}
      icon={<InboxOutlined style={{ color: '#fa541c' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.operation && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Operation:</Text>
            <Tag 
              color={getOperationColor(form.operation)} 
               
              style={{ fontSize: '10px', margin: 0, textTransform: 'uppercase' }}
            >
              {form.operation}
            </Tag>
          </Flex>
        )}

        {form?.cacheKey && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Key:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.cacheKey}
            </Text>
          </Flex>
        )}

        {form?.ttl && form.operation === 'set' && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>TTL:</Text>
            <Tag color="volcano"  style={{ fontSize: '10px', margin: 0 }}>
              {form.ttl}s
            </Tag>
          </Flex>
        )}

        {form?.defaultValue && form.operation === 'get' && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Default:</Text>
            <Tag color="cyan"  style={{ fontSize: '10px', margin: 0 }}>
              {form.defaultValue.length > 10 ? `${form.defaultValue.substring(0, 10)}...` : form.defaultValue}
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default CacheNode;
