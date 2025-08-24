import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { CsvAnalysisNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { Flex, Typography, Tag } from 'antd';
import { TableOutlined } from '@ant-design/icons';

const { Text } = Typography;

const CsvAnalysisNode = ({ data, id, selected }: NodeProps<Node<CsvAnalysisNodeData>>) => {
  const { form } = data;

  const getOperationColor = (operation: string) => {
    const colors: { [key: string]: string } = {
      analyze: 'blue',
      validate: 'green',
      transform: 'orange',
      filter: 'purple',
      aggregate: 'red',
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
      icon={<TableOutlined style={{ color: '#13c2c2' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.operation && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Operation:</Text>
            <Tag 
              color={getOperationColor(form.operation)} 
               
              style={{ fontSize: '10px', margin: 0, textTransform: 'capitalize' }}
            >
              {form.operation.toUpperCase()}
            </Tag>
          </Flex>
        )}

        {form?.delimiter && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Delimiter:</Text>
            <Tag color="cyan"  style={{ fontSize: '10px', margin: 0 }}>
              {form.delimiter === ',' ? 'Comma' : 
               form.delimiter === ';' ? 'Semicolon' :
               form.delimiter === '\t' ? 'Tab' :
               form.delimiter === '|' ? 'Pipe' : form.delimiter}
            </Tag>
          </Flex>
        )}

        {form?.hasHeader && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Header:</Text>
            <Tag color="green"  style={{ fontSize: '10px', margin: 0 }}>
              ✓ Yes
            </Tag>
          </Flex>
        )}

        {form?.groupBy && form.operation === 'aggregate' && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Group By:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.groupBy}
            </Text>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default CsvAnalysisNode;
