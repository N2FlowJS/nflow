import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { CodeNodeData } from '../../../models/flowTypes';
import BaseNode from './base-node';
import { Flex, Typography, Tag } from 'antd';
import { CodeOutlined } from '@ant-design/icons';

const { Text } = Typography;

const CodeNode = ({ data, id, selected }: NodeProps<Node<CodeNodeData>>) => {
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
      icon={<CodeOutlined style={{ color: '#1890ff' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.timeout && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Timeout:</Text>
            <Tag color="orange"  style={{ fontSize: '10px', margin: 0 }}>
              {form.timeout}ms
            </Tag>
          </Flex>
        )}

        {form?.allowConsole && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Console:</Text>
            <Tag color="green"  style={{ fontSize: '10px', margin: 0 }}>
              Enabled
            </Tag>
          </Flex>
        )}

        {form?.code && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Code:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.code.split('\n')[0] || 'Custom JavaScript'}
            </Text>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default CodeNode;
