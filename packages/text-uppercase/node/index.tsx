// UI Component for Text Uppercase Node
// Shows ports visually

import React from 'react';
import { NodeProps, Node, Position } from '@xyflow/react';
import { BaseNode } from '@n2flowjs/flow';
import { TextUppercaseNode } from '../definition';
import { TextUppercaseNodeData } from '../types';
import { Flex, Typography, Tag } from 'antd';

const { Text } = Typography;

export default function TextUppercaseNodeComponent({ 
  data, 
  id, 
  selected 
}: NodeProps<Node<TextUppercaseNodeData>>) {
  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left, Position.Right],
        output: [Position.Right, Position.Left],
      }}
      icon={<span style={{ fontSize: '16px' }}>🔠</span>}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {/* Input Ports Display */}
        <Flex vertical gap={4}>
          <Text type="secondary" style={{ fontSize: '11px', fontWeight: 600 }}>
            Inputs:
          </Text>
          {TextUppercaseNode.inputs.map(input => (
            <Flex key={input.id} align="center" gap={6}>
              <Tag color="blue" style={{ fontSize: '10px', margin: 0 }}>
                {input.type}
              </Tag>
              <Text style={{ fontSize: '11px' }}>
                {input.name}
                {input.required && <span style={{ color: 'red' }}> *</span>}
              </Text>
            </Flex>
          ))}
        </Flex>

        {/* Output Ports Display */}
        <Flex vertical gap={4}>
          <Text type="secondary" style={{ fontSize: '11px', fontWeight: 600 }}>
            Outputs:
          </Text>
          {TextUppercaseNode.outputs.map(output => (
            <Flex key={output.id} align="center" gap={6}>
              <Tag color="green" style={{ fontSize: '10px', margin: 0 }}>
                {output.type}
              </Tag>
              <Text style={{ fontSize: '11px' }}>
                {output.name}
              </Text>
            </Flex>
          ))}
        </Flex>

        {data.form?.name && (
          <Text type="secondary" italic style={{ fontSize: '10px', marginTop: 4 }}>
            {data.form.name}
          </Text>
        )}
      </Flex>
    </BaseNode>
  );
}
