import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { GlobalOutlined, FileTextOutlined } from '@ant-design/icons';

interface WikiConfigInfoProps {
  language: string;
  summaryOnly: boolean;
}

const WikiConfigInfo: React.FC<WikiConfigInfoProps> = ({ language, summaryOnly }) => {
  return (
    <Flex align="center" gap={12}>
      <Flex align="center" gap={4}>
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <GlobalOutlined style={{ marginRight: 4 }} />
          Lang:
        </Typography.Text>
        <Tag color="blue" style={{ fontSize: '11px' }}>{language.toUpperCase()}</Tag>
      </Flex>
      
      <Flex align="center" gap={4}>
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <FileTextOutlined style={{ marginRight: 4 }} />
          Content:
        </Typography.Text>
        <Tag color={summaryOnly ? 'green' : 'orange'} style={{ fontSize: '11px' }}>
          {summaryOnly ? 'Summary' : 'Full'}
        </Tag>
      </Flex>
    </Flex>
  );
};

export default WikiConfigInfo;
