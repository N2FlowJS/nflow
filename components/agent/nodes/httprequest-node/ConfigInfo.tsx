import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { ClockCircleOutlined, LinkOutlined } from '@ant-design/icons';

interface ConfigInfoProps {
  timeout: number;
  followRedirects: boolean;
}

const ConfigInfo: React.FC<ConfigInfoProps> = ({ timeout, followRedirects }) => {
  return (
    <Flex align="center" gap={12}>
      <Flex align="center" gap={4}>
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <ClockCircleOutlined style={{ marginRight: 2 }} />
          Timeout:
        </Typography.Text>
        <Tag color="blue" style={{ fontSize: '11px' }}>{timeout}s</Tag>
      </Flex>
      
      <Flex align="center" gap={4}>
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <LinkOutlined style={{ marginRight: 2 }} />
          Redirects:
        </Typography.Text>
        <Tag color={followRedirects ? 'green' : 'orange'} style={{ fontSize: '11px' }}>
          {followRedirects ? 'Follow' : 'Block'}
        </Tag>
      </Flex>
    </Flex>
  );
};

export default ConfigInfo;
