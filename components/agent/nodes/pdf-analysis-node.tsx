import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { PdfAnalysisNodeData } from '../../../models/flowTypes';
import BaseNode from './base-node';
import { Flex, Typography, Tag } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PdfAnalysisNode = ({ data, id, selected }: NodeProps<Node<PdfAnalysisNodeData>>) => {
  const { form } = data;

  const getOperationColor = (operation: string) => {
    const colors: { [key: string]: string } = {
      extract_text: 'blue',
      extract_metadata: 'green',
      extract_images: 'orange',
      split_pages: 'purple',
      merge_pdfs: 'red',
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
      icon={<FilePdfOutlined style={{ color: '#f5222d' }} />}
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
              {form.operation.replace('_', ' ').toUpperCase()}
            </Tag>
          </Flex>
        )}

        {form?.pageRange && ['extract_text', 'split_pages'].includes(form.operation || '') && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Pages:</Text>
            <Tag color="cyan"  style={{ fontSize: '10px', margin: 0 }}>
              {form.pageRange}
            </Tag>
          </Flex>
        )}

        {form?.preserveFormatting && form.operation === 'extract_text' && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Format:</Text>
            <Tag color="green"  style={{ fontSize: '10px', margin: 0 }}>
              ✓ Preserved
            </Tag>
          </Flex>
        )}

        {form?.extractImages && form.operation === 'extract_text' && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Images:</Text>
            <Tag color="orange"  style={{ fontSize: '10px', margin: 0 }}>
              📷 Extract
            </Tag>
          </Flex>
        )}

        {form?.outputDir && ['extract_images', 'split_pages'].includes(form.operation || '') && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Output:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.outputDir}
            </Text>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default PdfAnalysisNode;
