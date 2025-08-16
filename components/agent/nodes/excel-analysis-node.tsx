import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { ExcelAnalysisNodeData } from '../../../models/flowTypes';
import { BaseNode } from '../../../packages/@flow';
import { Flex, Typography, Tag } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ExcelAnalysisNode = ({ data, id, selected }: NodeProps<Node<ExcelAnalysisNodeData>>) => {
  const { form } = data;

  const getOperationColor = (operation: string) => {
    const colors: { [key: string]: string } = {
      read_sheets: 'blue',
      analyze_data: 'green',
      pivot_table: 'orange',
      chart_data: 'purple',
      validate_formulas: 'red',
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
      icon={<FileExcelOutlined style={{ color: '#52c41a' }} />}
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

        {form?.sheetName && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Sheet:</Text>
            <Tag color="cyan"  style={{ fontSize: '10px', margin: 0 }}>
              {form.sheetName}
            </Tag>
          </Flex>
        )}

        {form?.cellRange && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Range:</Text>
            <Tag color="geekblue"  style={{ fontSize: '10px', margin: 0 }}>
              {form.cellRange}
            </Tag>
          </Flex>
        )}

        {form?.includeFormulas && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Formulas:</Text>
            <Tag color="purple"  style={{ fontSize: '10px', margin: 0 }}>
              ✓ Include
            </Tag>
          </Flex>
        )}

        {form?.skipEmptyRows && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Empty:</Text>
            <Tag color="orange"  style={{ fontSize: '10px', margin: 0 }}>
              ⊘ Skip
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default ExcelAnalysisNode;
