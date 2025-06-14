import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { ClockCircleOutlined, LinkOutlined, DollarCircleOutlined } from '@ant-design/icons';

interface ConfigInfoProps {
  timeout: number;
  inheritContext: boolean;
  variableCount: number;
}

const ConfigInfo: React.FC<ConfigInfoProps> = ({ timeout, inheritContext, variableCount }) => {
  return (
    <Flex vertical gap={4}>
      <Flex align="center" gap={12}>
        <Flex align="center" gap={4}>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            Timeout:
          </Typography.Text>
          <Tag color="blue" style={{ fontSize: '11px' }}>
            {timeout}s
          </Tag>
        </Flex>

        <Flex align="center" gap={4}>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            <LinkOutlined style={{ marginRight: 4 }} />
            Context:
          </Typography.Text>
          <Tag color={inheritContext ? 'green' : 'orange'} style={{ fontSize: '11px' }}>
            {inheritContext ? 'Inherited' : 'Isolated'}
          </Tag>
        </Flex>
      </Flex>

      <Flex align="center" gap={4}>
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <DollarCircleOutlined style={{ marginRight: 4 }} />
          Variables:
        </Typography.Text>
        <Tag color="cyan" style={{ fontSize: '11px' }}>
          {variableCount} mapped
        </Tag>
      </Flex>
    </Flex>
  );
};

export default ConfigInfo;
