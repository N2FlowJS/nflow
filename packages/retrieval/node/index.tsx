import React from 'react';
import { NodeProps, Node } from '@xyflow/react';
import { RetrievalNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { Flex } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';
import KnowledgeBaseInfo from './KnowledgeBaseInfo';
import ResultsInfo from './ResultsInfo';
import { RetrievalNodeDefinition } from '../definition';

const RetrievalNode = ({ data, id, selected }: NodeProps<Node<RetrievalNodeData>>) => {
  const { form } = data;

  // Get knowledge base IDs, ensuring it's always an array
  const knowledgeIds = Array.isArray(form?.knowledgeIds) ? form.knowledgeIds : [];

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      // NEW: Port-based handles from NodeDefinition
      inputPorts={RetrievalNodeDefinition.inputs}
      outputPorts={RetrievalNodeDefinition.outputs}
      icon={<DatabaseOutlined style={{ color: '#595959' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <KnowledgeBaseInfo knowledgeIds={knowledgeIds} />
        <ResultsInfo maxResults={form?.maxResults ?? 3} />
      </Flex>
    </BaseNode>
  );
};

export default RetrievalNode;
