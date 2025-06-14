import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { TextProcessNodeData } from '../../../../models/flowTypes';
import BaseNode from '../base-node';
import { Flex } from 'antd';
import { FontSizeOutlined } from '@ant-design/icons';
import OperationInfo from './OperationInfo';
import ParametersInfo from './ParametersInfo';

const TextProcessNode = ({ data, id, selected }: NodeProps<Node<TextProcessNodeData>>) => {
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
      icon={<FontSizeOutlined style={{ color: '#eb2f96' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <OperationInfo 
          operation={form?.operation || 'trim'}
          inputText={form?.inputText || ''}
        />
        <ParametersInfo 
          operation={form?.operation || 'trim'}
          searchValue={form?.searchValue}
          replaceValue={form?.replaceValue}
          separator={form?.separator}
          regexPattern={form?.regexPattern}
        />
      </Flex>
    </BaseNode>
  );
};

export default TextProcessNode;
