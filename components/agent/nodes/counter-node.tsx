import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { CounterNodeData } from '../../../models/flowTypes';
import { BaseNode } from '../../../packages/@flow';
import { Flex, Typography, Tag } from 'antd';
import { NumberOutlined } from '@ant-design/icons';

const { Text } = Typography;

const CounterNode = ({ data, id, selected }: NodeProps<Node<CounterNodeData>>) => {
  const { form } = data;

  const getOperationColor = (operation: string) => {
    const colors: { [key: string]: string } = {
      increment: 'green',
      decrement: 'red',
      reset: 'orange',
      set: 'blue',
    };
    return colors[operation] || 'default';
  };

  const getOperationSymbol = (operation: string) => {
    const symbols: { [key: string]: string } = {
      increment: '+',
      decrement: '-',
      reset: '↻',
      set: '=',
    };
    return symbols[operation] || operation;
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
      icon={<NumberOutlined style={{ color: '#13c2c2' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.counterName && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Counter:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.counterName}
            </Text>
          </Flex>
        )}

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

        {form?.stepValue && ['increment', 'decrement'].includes(form.operation || '') && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Step:</Text>
            <Tag color="blue"  style={{ fontSize: '10px', margin: 0 }}>
              {form.stepValue}
            </Tag>
          </Flex>
        )}

        {form?.initialValue !== undefined && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Initial:</Text>
            <Tag color="cyan"  style={{ fontSize: '10px', margin: 0 }}>
              {form.initialValue}
            </Tag>
          </Flex>
        )}

        {(form?.maxValue !== undefined || form?.minValue !== undefined) && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Limits:</Text>
            <Tag color="volcano"  style={{ fontSize: '10px', margin: 0 }}>
              {form.minValue !== undefined ? form.minValue : '∞'} - {form.maxValue !== undefined ? form.maxValue : '∞'}
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default CounterNode;
