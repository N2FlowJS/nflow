import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { GoogleSearchNodeData } from '../../../../models/flowTypes';
import BaseNode from '../base-node';
import { Flex } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import SearchQueryInfo from './SearchQueryInfo';
import SearchConfigInfo from './SearchConfigInfo';

const GoogleSearchNode = ({ data, id, selected }: NodeProps<Node<GoogleSearchNodeData>>) => {
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
      icon={<SearchOutlined style={{ color: '#4285f4' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <SearchQueryInfo 
          query={form?.query || ''} 
          maxResults={form?.maxResults ?? 10}
        />
        <SearchConfigInfo 
          safeSearch={form?.safeSearch || 'moderate'}
          language={form?.language || 'en'}
          useSystemConfig={form?.useSystemConfig ?? true}
        />
      </Flex>
    </BaseNode>
  );
};

export default GoogleSearchNode;
