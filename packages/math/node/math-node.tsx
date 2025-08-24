import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { MathNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { Flex, Typography, Tag } from 'antd';
import { CalculatorOutlined } from '@ant-design/icons';

const { Text } = Typography;

const MathNode = ({ data, id, selected }: NodeProps<Node<MathNodeData>>) => {
  const { form } = data;

  const getOperationSymbol = (operation: string) => {
    const symbols: { [key: string]: string } = {
      add: '+',
      subtract: '-',
      multiply: '×',
      divide: '÷',
      power: '^',
      sqrt: '√',
      abs: '|x|',
      round: 'round',
      min: 'min',
      max: 'max',
    };
    return symbols[operation] || operation;
  };

  const getOperationColor = (operation: string) => {
    const colors: { [key: string]: string } = {
      add: 'green',
      subtract: 'red',
      multiply: 'blue',
      divide: 'orange',
      power: 'purple',
      sqrt: 'cyan',
      abs: 'geekblue',
      round: 'magenta',
      min: 'volcano',
      max: 'gold',
    };
    return colors[operation] || 'default';
  };

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left, Position.Right],
        output: [Position.Right, Position.Left],
      }}
      icon={<CalculatorOutlined style={{ color: '#fa8c16' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.operation && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Operation:</Text>
            <Tag 
              color={getOperationColor(form.operation)} 
              style={{ fontSize: '10px', margin: 0, fontWeight: 'bold' }}
            >
              {getOperationSymbol(form.operation)}
            </Tag>
          </Flex>
        )}

        {form?.value1 && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Value 1:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.value1}
            </Text>
          </Flex>
        )}

        {form?.value2 && ['add', 'subtract', 'multiply', 'divide', 'power', 'min', 'max'].includes(form.operation || '') && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Value 2:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.value2}
            </Text>
          </Flex>
        )}

        {form?.precision !== undefined && form.precision !== 2 && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Precision:</Text>
            <Tag color="blue" style={{ fontSize: '10px', margin: 0 }}>
              {form.precision} decimals
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default MathNode;
