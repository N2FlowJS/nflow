import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { DisplayNodeData } from '../../../models/flowTypes';
import BaseNode from './base-node';
import { Flex, Typography, Tag } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

const { Text } = Typography;

const DisplayNode = ({ data, id, selected }: NodeProps<Node<DisplayNodeData>>) => {
  const { form } = data;

  const getFormatColor = (format: string) => {
    const colors: { [key: string]: string } = {
      text: 'blue',
      markdown: 'green',
      html: 'orange',
      json: 'purple',
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
      icon={<EyeOutlined style={{ color: '#52c41a' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.outputFormat && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Format:</Text>
            <Tag 
              color={getFormatColor(form.outputFormat)} 
               
              style={{ fontSize: '10px', margin: 0, textTransform: 'uppercase' }}
            >
              {form.outputFormat}
            </Tag>
          </Flex>
        )}

        {form?.showAsModal && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Display:</Text>
            <Tag color="cyan"  style={{ fontSize: '10px', margin: 0 }}>
              Modal
            </Tag>
          </Flex>
        )}

        {form?.content && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Content:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.content.length > 30 ? `${form.content.substring(0, 30)}...` : form.content}
            </Text>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default DisplayNode;
