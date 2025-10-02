import React, { useMemo } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import { TransformNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { Flex } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import TransformInfo from './TransformInfo';
import TransformLogic from './TransformLogic';
import { TransformNodeDefinition } from '../definition';

const TransformNode = ({ data, id, selected }: NodeProps<Node<TransformNodeData>>) => {
  const { form } = data;

  // Generate dynamic input ports from inputData template
  const inputPorts = useMemo(() => {
    if (form) {
      return TransformNodeDefinition.getDynamicInputs?.(form) || TransformNodeDefinition.inputs;
    }
    return TransformNodeDefinition.inputs;
  }, [form?.inputData]);

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      inputPorts={inputPorts}
      outputPorts={TransformNodeDefinition.outputs}
      icon={<SwapOutlined style={{ color: '#722ed1' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <TransformInfo 
          transformType={form?.transformType || 'json'}
          inputData={form?.inputData || ''}
        />
        <TransformLogic 
          transformation={form?.transformation || ''}
        />
      </Flex>
    </BaseNode>
  );
};

export default TransformNode;
