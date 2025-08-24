import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import type { ConditionNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
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
        {form?.expressions?.[0] && (
          <ComparisonInfo
            leftValue={form.expressions[0].left || ''}
            operator={form.expressions[0].operator}
            rightValue={String(form.expressions[0].right ?? '')}
            dataType={'string'}
          />
        )}
        <ResultsInfo
          trueValue={form?.logic === 'all' ? 'All True' : 'Any True'}
          falseValue={form?.logic === 'all' ? 'Some False' : 'All False'}
        />
      </Flex>
    </BaseNode>
  );
};

export default ConditionNode;
