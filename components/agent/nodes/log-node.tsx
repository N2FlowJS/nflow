import React from 'react';
import { Position, NodeProps, Node } from '@xyflow/react';
import { LogNodeData } from '../../../models/flowTypes';
import BaseNode from './base-node';
import { Flex, Typography, Tag } from 'antd';
import { FileSearchOutlined } from '@ant-design/icons';

const { Text } = Typography;

const LogNode = ({ data, id, selected }: NodeProps<Node<LogNodeData>>) => {
  const { form } = data;

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      debug: 'blue',
      info: 'green',
      warn: 'orange',
      error: 'red',
    };
    return colors[level] || 'default';
  };

  const getLevelIcon = (level: string) => {
    const icons: { [key: string]: string } = {
      debug: '🐛',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    };
    return icons[level] || '📝';
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
      icon={<FileSearchOutlined style={{ color: '#595959' }} />}
      role={data.form?.role}
    >
      <Flex vertical gap={8}>
        {form?.logLevel && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Level:</Text>
            <Tag 
              color={getLevelColor(form.logLevel)} 
              size="small" 
              style={{ fontSize: '10px', margin: 0, textTransform: 'uppercase' }}
            >
              {getLevelIcon(form.logLevel)} {form.logLevel}
            </Tag>
          </Flex>
        )}

        {form?.message && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Message:</Text>
            <Text style={{ fontSize: '10px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.message.length > 30 ? `${form.message.substring(0, 30)}...` : form.message}
            </Text>
          </Flex>
        )}

        {form?.includeTimestamp && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Options:</Text>
            <Tag color="cyan" size="small" style={{ fontSize: '10px', margin: 0 }}>
              📅 Timestamp
            </Tag>
          </Flex>
        )}

        {form?.includeNodeInfo && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Node Info:</Text>
            <Tag color="purple" size="small" style={{ fontSize: '10px', margin: 0 }}>
              📍 Enabled
            </Tag>
          </Flex>
        )}

        {form?.includeData && (
          <Flex align="center" gap={6}>
            <Text type="secondary" style={{ fontSize: '11px' }}>Data:</Text>
            <Tag color="gold" size="small" style={{ fontSize: '10px', margin: 0 }}>
              📊 Included
            </Tag>
          </Flex>
        )}
      </Flex>
    </BaseNode>
  );
};

export default LogNode;
