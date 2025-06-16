import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { VariableNodeData } from '../../../models/flowTypes';
import BaseNode from './base-node';
import { Flex, Typography, Tag } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

const { Text } = Typography;

const VariableNode = ({ data, id, selected }: NodeProps<Node<VariableNodeData>>) => {
  const { form } = data;

  const getOperationColor = (operation: string) => {
    const colors: { [key: string]: string } = {
      set: 'green',
      get: 'blue',
      delete: 'red',
      append: 'orange',
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
      icon={<SettingOutlined style={{ color: '#fa8c16' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.operation && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Operation:</Text>
            <Tag 
              color={getOperationColor(form.operation)} 
              style={{ fontSize: '10px', margin: 0, textTransform: 'uppercase' }}
            >
              {form.operation}
            </Tag>
          </Flex>
        )}

        {form?.variableName && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Variable:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.variableName}
            </Text>
          </Flex>
        )}

        {form?.variableValue && ['set', 'append'].includes(form.operation || '') && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Value:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.variableValue}
            </Text>
          </Flex>
        )}

        {form?.defaultValue && form.operation === 'get' && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Default:</Text>
            <Tag color="cyan" style={{ fontSize: '10px', margin: 0 }}>
              {form.defaultValue.length > 10 ? `${form.defaultValue.substring(0, 10)}...` : form.defaultValue}
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default VariableNode;
