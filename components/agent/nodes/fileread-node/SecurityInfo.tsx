import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';

interface SecurityInfoProps {
  maxSize: number;
}

const SecurityInfo: React.FC<SecurityInfoProps> = ({ maxSize }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes >= 1048576) {
      return `${(bytes / 1048576).toFixed(1)}MB`;
    } else if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)}KB`;
    }
    return `${bytes}B`;
  };

  return (
    <Flex align="center" gap={4}>
      <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
        <SafetyOutlined style={{ marginRight: 2 }} />
        Max Size:
      </Typography.Text>
      <Tag color="orange" style={{ fontSize: '11px' }}>
        {formatFileSize(maxSize)}
      </Tag>
    </Flex>
  );
};

export default SecurityInfo;
