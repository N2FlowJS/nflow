import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { JsonParseNodeData } from '../../../../models/flowTypes';
import BaseNode from '../base-node';
import { Flex } from 'antd';
import { CodeOutlined } from '@ant-design/icons';
import JsonOperationInfo from './JsonOperationInfo';
import JsonPathInfo from './JsonPathInfo';

const JsonParseNode = ({ data, id, selected }: NodeProps<Node<JsonParseNodeData>>) => {
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
      icon={<CodeOutlined style={{ color: '#13c2c2' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <JsonOperationInfo 
          operation={form?.operation || 'parse'}
          outputFormat={form?.outputFormat || 'object'}
        />
        {form?.operation === 'extract' && (
          <JsonPathInfo 
            jsonPath={form?.jsonPath || ''}
          />
        )}
      </Flex>
    </BaseNode>
  );
};

export default JsonParseNode;
