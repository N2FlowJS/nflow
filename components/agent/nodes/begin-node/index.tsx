import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { BeginNodeData } from '../../types/flowTypes';
import BaseNode from '../base-node';
import { Flex } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import DescriptionSection from './DescriptionSection';
import GreetingSection from './GreetingSection';
import VariablesSection from './VariablesSection';

const BeginNode = ({ data, id, selected }: NodeProps<Node<BeginNodeData>>) => {
  const { form } = data;
  const variablesCount = Array.isArray(form?.variables) ? form.variables.length : 0;

  return (
    <BaseNode 
      data={data} 
      id={id}
      selected={selected}
      handlePositions={{
        output: Position.Right,
      }}
      icon={<PlayCircleOutlined style={{ color: '#1677ff' }} />}
    >
      <Flex vertical gap={6}>
        {form?.description && <DescriptionSection description={form.description} />}
        {form?.greeting && <GreetingSection greeting={form.greeting} />}
        {variablesCount > 0 && <VariablesSection variables={form.variables} />}
      </Flex>
    </BaseNode>
  );
};

export default BeginNode;
