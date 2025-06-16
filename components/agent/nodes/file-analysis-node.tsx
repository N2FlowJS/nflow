import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { FileAnalysisNodeData } from '../../../models/flowTypes';
import BaseNode from './base-node';
import { Flex, Typography, Tag } from 'antd';
import { FileSearchOutlined } from '@ant-design/icons';

const { Text } = Typography;

const FileAnalysisNode = ({ data, id, selected }: NodeProps<Node<FileAnalysisNodeData>>) => {
  const { form } = data;

  const getAnalysisColor = (type: string) => {
    const colors: { [key: string]: string } = {
      metadata: 'blue',
      content: 'green',
      structure: 'orange',
      security: 'red',
      quality: 'purple',
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
      icon={<FileSearchOutlined style={{ color: '#722ed1' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.analysisType && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Type:</Text>
            <Tag 
              color={getAnalysisColor(form.analysisType)} 
              style={{ fontSize: '10px', margin: 0, textTransform: 'capitalize' }}
            >
              {form.analysisType.toUpperCase()}
            </Tag>
          </Flex>
        )}

        {form?.filePath && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Path:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.filePath}
            </Text>
          </Flex>
        )}

        {form?.recursive && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Options:</Text>
            <Tag color="cyan"  style={{ fontSize: '10px', margin: 0 }}>
              📁 Recursive
            </Tag>
          </Flex>
        )}

        {form?.includeHidden && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Hidden:</Text>
            <Tag color="gold"  style={{ fontSize: '10px', margin: 0 }}>
              👁️ Included
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default FileAnalysisNode;
