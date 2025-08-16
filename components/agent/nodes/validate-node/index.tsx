import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { ValidateNodeData } from '../../../../models/flowTypes';
import { BaseNode } from '../../../../packages/@flow';
import { Flex } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import ValidationInfo from './ValidationInfo';
import ConstraintsInfo from './ConstraintsInfo';

const ValidateNode = ({ data, id, selected }: NodeProps<Node<ValidateNodeData>>) => {
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
      icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        <ValidationInfo 
          validationType={form?.validationType || 'email'}
          hasCustomPattern={!!form?.customPattern}
          inputData={form?.inputData || ''}
        />
        <ConstraintsInfo 
          required={form?.required ?? true}
          minLength={form?.minLength}
          maxLength={form?.maxLength}
        />
      </Flex>
    </BaseNode>
  );
};

export default ValidateNode;
