import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { TransformNodeData } from '../../../../models/flowTypes';
import { BaseNode } from '../../../../packages/@flow';
import { Flex } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import TransformInfo from './TransformInfo';
import TransformLogic from './TransformLogic';

const TransformNode = ({ data, id, selected }: NodeProps<Node<TransformNodeData>>) => {
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
