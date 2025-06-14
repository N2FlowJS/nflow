import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { ConditionNodeData } from '../../../../models/flowTypes';
import BaseNode from '../base-node';
import { Flex } from 'antd';
import { BranchesOutlined } from '@ant-design/icons';
import ComparisonInfo from './ComparisonInfo';
import ResultsInfo from './ResultsInfo';

const ConditionNode = ({ data, id, selected }: NodeProps<Node<ConditionNodeData>>) => {
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
      icon={<BranchesOutlined style={{ color: '#1890ff' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <ComparisonInfo 
          leftValue={form?.leftValue || ''}
          operator={form?.operator || 'equals'}
          rightValue={form?.rightValue || ''}
          dataType={form?.dataType || 'string'}
        />
        <ResultsInfo 
          trueValue={form?.trueValue || 'Success'}
          falseValue={form?.falseValue || 'Failed'}
        />
      </Flex>
    </BaseNode>
  );
};

export default ConditionNode;
