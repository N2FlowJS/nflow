import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { TemplateNodeData } from '../../../models/flowTypes';
import BaseNode from './base-node';
import { Flex, Typography, Tag } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';

const { Text } = Typography;

const TemplateNode = ({ data, id, selected }: NodeProps<Node<TemplateNodeData>>) => {
  const { form } = data;

  const getEngineColor = (engine: string) => {
    const colors: { [key: string]: string } = {
      simple: 'blue',
      handlebars: 'orange',
      mustache: 'green',
    };
    return colors[engine] || 'default';
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
      icon={<FileTextOutlined style={{ color: '#eb2f96' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.templateEngine && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Engine:</Text>
            <Tag 
              color={getEngineColor(form.templateEngine)} 
              style={{ fontSize: '10px', margin: 0, textTransform: 'capitalize' }}
            >
              {form.templateEngine.toUpperCase()}
            </Tag>
          </Flex>
        )}

        {form?.outputFormat && form.outputFormat !== 'text' && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Format:</Text>
            <Tag color="purple" style={{ fontSize: '10px', margin: 0 }}>
              {form.outputFormat.toUpperCase()}
            </Tag>
          </Flex>
        )}

        {form?.templateContent && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Template:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.templateContent.length > 30 ? `${form.templateContent.substring(0, 30)}...` : form.templateContent}
            </Text>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default TemplateNode;
