import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { LoopNodeData } from '../../../models/flowTypes';
import { BaseNode } from '@n2flowjs/flow';
import { Flex, Typography, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

const LoopNode = ({ data, id, selected }: NodeProps<Node<LoopNodeData>>) => {
  const { form } = data;

  const getLoopTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      array: 'blue',
      object: 'green',
      range: 'orange',
    };
    return colors[type] || 'default';
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
      icon={<ReloadOutlined style={{ color: '#722ed1' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.loopType && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Type:</Text>
            <Tag 
              color={getLoopTypeColor(form.loopType)} 
              style={{ fontSize: '10px', margin: 0, textTransform: 'capitalize' }}
            >
              {form.loopType.toUpperCase()}
            </Tag>
          </Flex>
        )}

        {form?.inputData && form.loopType !== 'range' && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Data:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.inputData}
            </Text>
          </Flex>
        )}

        {form?.loopType === 'range' && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Range:</Text>
            <Tag color="orange"  style={{ fontSize: '10px', margin: 0 }}>
              {form.startIndex || 0} → {form.endIndex || 10}
            </Tag>
          </Flex>
        )}

        {form?.maxIterations && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Max:</Text>
            <Tag color="red" style={{ fontSize: '10px', margin: 0 }}>
              {form.maxIterations}
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default LoopNode;
