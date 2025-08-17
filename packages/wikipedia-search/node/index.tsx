import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { WikipediaSearchNodeData } from '../../../models/flowTypes';
import { BaseNode } from '@n2flowjs/flow';
import { Flex } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import WikiQueryInfo from './WikiQueryInfo';
import WikiConfigInfo from './WikiConfigInfo';

const WikipediaSearchNode = ({ data, id, selected }: NodeProps<Node<WikipediaSearchNodeData>>) => {
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
      icon={<GlobalOutlined style={{ color: '#000000' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <WikiQueryInfo 
          query={form?.query || ''} 
          maxResults={form?.maxResults ?? 5}
        />
        <WikiConfigInfo 
          language={form?.language || 'en'}
          summaryOnly={form?.summaryOnly ?? true}
        />
      </Flex>
    </BaseNode>
  );
};

export default WikipediaSearchNode;
