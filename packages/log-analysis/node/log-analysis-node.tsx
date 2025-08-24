import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { LogAnalysisNodeData } from '../types';
import { BaseNode } from '@n2flowjs/flow';
import { Flex, Typography, Tag } from 'antd';
import { BugOutlined } from '@ant-design/icons';

const { Text } = Typography;

const LogAnalysisNode = ({ data, id, selected }: NodeProps<Node<LogAnalysisNodeData>>) => {
  const { form } = data;

  const getAnalysisColor = (type: string) => {
    const colors: { [key: string]: string } = {
      summary: 'blue',
      errors: 'red',
      performance: 'orange',
      security: 'purple',
      trends: 'green',
    };
    return colors[type] || 'default';
  };

  const getFormatColor = (format: string) => {
    const colors: { [key: string]: string } = {
      apache: 'blue',
      nginx: 'green',
      json: 'orange',
      csv: 'purple',
      custom: 'red',
    };
    return colors[format] || 'default';
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
      icon={<BugOutlined style={{ color: '#fa8c16' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.analysisType && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Analysis:</Text>
            <Tag 
              color={getAnalysisColor(form.analysisType)} 
               
              style={{ fontSize: '10px', margin: 0, textTransform: 'capitalize' }}
            >
              {form.analysisType.toUpperCase()}
            </Tag>
          </Flex>
        )}

        {form?.logFormat && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Format:</Text>
            <Tag 
              color={getFormatColor(form.logFormat)} 
               
              style={{ fontSize: '10px', margin: 0, textTransform: 'capitalize' }}
            >
              {form.logFormat.toUpperCase()}
            </Tag>
          </Flex>
        )}

        {form?.filterLevel && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Level:</Text>
            <Tag color="volcano"  style={{ fontSize: '10px', margin: 0 }}>
              {form.filterLevel.toUpperCase()}
            </Tag>
          </Flex>
        )}

        {form?.timeRange && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Range:</Text>
            <Tag color="cyan"  style={{ fontSize: '10px', margin: 0 }}>
              {form.timeRange}
            </Tag>
          </Flex>
        )}

        {form?.groupBy && form.analysisType === 'trends' && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Group:</Text>
            <Tag color="geekblue"  style={{ fontSize: '10px', margin: 0 }}>
              {form.groupBy}
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default LogAnalysisNode;
