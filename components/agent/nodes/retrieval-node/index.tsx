import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { RetrievalNodeData } from '../../types/flowTypes';
import BaseNode from '../base-node';
import { Flex } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import KnowledgeBaseInfo from './KnowledgeBaseInfo';
import ResultsInfo from './ResultsInfo';

const RetrievalNode = ({ data, id, selected }: NodeProps<Node<RetrievalNodeData>>) => {
  const { form } = data;
  
  // Get knowledge base IDs, ensuring it's always an array
  const knowledgeIds = Array.isArray(form?.knowledgeIds) ? form.knowledgeIds : [];

  return (
    <BaseNode 
      data={data} 
      id={id}
      selected={selected}
      handlePositions={{
        input: Position.Left,
        output: Position.Right,
      }}
      icon={<DatabaseOutlined style={{ color: '#595959' }} />}
    >
      <Flex vertical gap={8}>
        <KnowledgeBaseInfo knowledgeIds={knowledgeIds} />
        <ResultsInfo maxResults={form?.maxResults ?? 3} />
      </Flex>
    </BaseNode>
  );
};

export default RetrievalNode;
