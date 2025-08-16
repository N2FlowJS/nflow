import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { RewriteNodeData } from '../../../../models/flowTypes';
import { BaseNode } from '../../../../packages/@flow';
import { Flex } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import RewriteInfo from './RewriteInfo';
import ModelInfo from './ModelInfo';

const RewriteNode = ({ data, id, selected }: NodeProps<Node<RewriteNodeData>>) => {
  const { form } = data;

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left, Position.Top],
        output: [Position.Right, Position.Bottom],
      }}
      icon={<EditOutlined style={{ color: '#52c41a' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <RewriteInfo 
          outputStyle={form?.outputStyle || 'professional'}
          preserveMeaning={form?.preserveMeaning ?? true}
          numberHistory={form?.numberHistory ?? 5}
        />
        <ModelInfo 
          hasModel={!!form?.model}
          modelName={form?.model ? 'AI Model' : ''}
        />
      </Flex>
    </BaseNode>
  );
};

export default RewriteNode;
