import React, { memo, useMemo } from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { BeginNodeData } from '../../../models/flowTypes';
import { Flex } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import DescriptionSection from './DescriptionSection';
import GreetingSection from './GreetingSection';
import VariablesSection from './VariablesSection';
import BaseNode from '@n2flowjs/flow/node/base-node';

const BeginNode = memo(({ data, id, selected }: NodeProps<Node<BeginNodeData>>) => {
  const { form } = data;

  const variablesCount = useMemo(() => (Array.isArray(form?.variables) ? form.variables.length : 0), [form?.variables]);

  const handlePositions = useMemo(
    () => ({
      output: [Position.Right],
      input: [],
    }),
    []
  );

  const content = useMemo(
    () => (
      <Flex vertical gap={6}>
        {form?.description && <DescriptionSection description={form.description} />}
        {form?.greeting && <GreetingSection greeting={form.greeting} />}
        {variablesCount > 0 && <VariablesSection variables={form.variables} />}
      </Flex>
    ),
    [form?.description, form?.greeting, form?.variables, variablesCount]
  );

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={handlePositions}
      icon={<PlayCircleOutlined />}
      role={data.form?.role}>
      {content}
    </BaseNode>
  );
});

BeginNode.displayName = 'BeginNode';

export default BeginNode;
