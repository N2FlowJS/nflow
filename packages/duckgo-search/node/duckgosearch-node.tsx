import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { DuckGoSearchNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { Flex, Typography, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Text } = Typography;

const DuckGoSearchNode = ({ data, id, selected }: NodeProps<Node<DuckGoSearchNodeData>>) => {
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
      icon={<SearchOutlined />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.searchType && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Type:</Text>
            <Tag 
              color={
                form.searchType === 'web' ? 'blue' :
                form.searchType === 'images' ? 'green' :
                form.searchType === 'news' ? 'orange' : 'purple'
              } 
              style={{ fontSize: '10px', margin: 0, textTransform: 'capitalize' }}
            >
              {form.searchType}
            </Tag>
          </Flex>
        )}

        {form?.query && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Query:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.query}
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

        {form?.safeSearch && form.safeSearch !== 'moderate' && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Safe Search:</Text>
            <Tag 
              color={form.safeSearch === 'strict' ? 'red' : 'orange'} 
              style={{ fontSize: '10px', margin: 0, textTransform: 'capitalize' }}
            >
              {form.safeSearch}
            </Tag>
          </Flex>
        )}

        <Flex align="center" gap={6}>
          <Text type="secondary" style={{ fontSize: '11px' }}>Privacy:</Text>
          <Tag color="green" style={{ fontSize: '10px', margin: 0 }}>
            Protected
          </Tag>
        </Flex>

        {(form?.noHTML || form?.noRedirect) && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Clean:</Text>
            <Tag color="blue" style={{ fontSize: '10px', margin: 0 }}>
              {form.noHTML && form.noRedirect ? 'HTML & Redirects' : 
               form.noHTML ? 'HTML' : 'Redirects'}
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default DuckGoSearchNode;
