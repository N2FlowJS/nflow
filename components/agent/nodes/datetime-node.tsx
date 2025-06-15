import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { DateTimeNodeData } from '../../../models/flowTypes';
import BaseNode from './base-node';
import { Flex, Typography, Tag } from 'antd';
import { FieldTimeOutlined } from '@ant-design/icons';

const { Text } = Typography;

const DateTimeNode = ({ data, id, selected }: NodeProps<Node<DateTimeNodeData>>) => {
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
      icon={<FieldTimeOutlined style={{ color: '#722ed1' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.operation && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Operation:</Text>
            <Tag 
              color={
                form.operation === 'now' ? 'blue' :
                form.operation === 'format' ? 'green' :
                form.operation === 'parse' ? 'orange' :
                ['add', 'subtract'].includes(form.operation) ? 'red' :
                form.operation === 'compare' ? 'purple' : 'cyan'
              } 
              style={{ fontSize: '10px', margin: 0, textTransform: 'capitalize' }}
            >
              {form.operation.toUpperCase()}
            </Tag>
          </Flex>
        )}

        {form?.format && ['now', 'format'].includes(form.operation || '') && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Format:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.format}
            </Text>
          </Flex>
        )}

        {form?.inputDate && form.operation !== 'now' && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Input:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.inputDate}
            </Text>
          </Flex>
        )}

        {['add', 'subtract'].includes(form?.operation || '') && form?.amount && form?.unit && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Amount:</Text>
            <Tag color="geekblue" style={{ fontSize: '10px', margin: 0 }}>
              {form.operation === 'add' ? '+' : '-'}{form.amount} {form.unit}
            </Tag>
          </Flex>
        )}

        {form?.timezone && form.operation === 'timezone' && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Timezone:</Text>
            <Tag color="volcano" style={{ fontSize: '10px', margin: 0 }}>
              {form.timezone}
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default DateTimeNode;
