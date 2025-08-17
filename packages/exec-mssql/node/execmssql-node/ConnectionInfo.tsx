import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { LinkOutlined, ClockCircleOutlined, NumberOutlined, WarningOutlined } from '@ant-design/icons';

interface ConnectionInfoProps {
  hasConnection: boolean;
  timeout: number;
  maxRows: number;
}

const ConnectionInfo: React.FC<ConnectionInfoProps> = ({ hasConnection, timeout, maxRows }) => {
  return (
    <Flex vertical gap={4}>
      <Flex align="center" gap={6}>
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <LinkOutlined style={{ marginRight: 4 }} />
          SQL Server:
        </Typography.Text>
        {hasConnection ? (
          <Tag color="blue" style={{ fontSize: '11px' }}>Connected</Tag>
        ) : (
          <Tag color="red" style={{ fontSize: '11px' }}>
            <WarningOutlined style={{ marginRight: 2 }} />
            Not configured
          </Tag>
        )}
      </Flex>
      
      <Flex align="center" gap={12}>
        <Flex align="center" gap={4}>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            Timeout:
          </Typography.Text>
          <Tag color="blue" style={{ fontSize: '11px' }}>{timeout}s</Tag>
        </Flex>
        
        <Flex align="center" gap={4}>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            <NumberOutlined style={{ marginRight: 4 }} />
            Max Rows:
          </Typography.Text>
          <Tag color="cyan" style={{ fontSize: '11px' }}>{maxRows}</Tag>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ConnectionInfo;
