import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { EditOutlined, WarningOutlined } from '@ant-design/icons';

interface WriteSettingsInfoProps {
  overwrite: boolean;
  hasContent: boolean;
}

const WriteSettingsInfo: React.FC<WriteSettingsInfoProps> = ({ overwrite, hasContent }) => {
  return (
    <Flex vertical gap={4}>
      <Flex align="center" gap={4}>
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <EditOutlined style={{ marginRight: 2 }} />
          Overwrite:
        </Typography.Text>
        <Tag color={overwrite ? 'orange' : 'green'} style={{ fontSize: '11px' }}>
          {overwrite ? 'Yes' : 'No'}
        </Tag>
      </Flex>
      
      <Flex align="center" gap={4}>
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          Content:
        </Typography.Text>
        {hasContent ? (
          <Tag color="blue" style={{ fontSize: '11px' }}>Ready</Tag>
        ) : (
          <Tag color="red" style={{ fontSize: '11px' }}>
            <WarningOutlined style={{ marginRight: 2 }} />
            Missing
          </Tag>
        )}
      </Flex>
    </Flex>
  );
};

export default WriteSettingsInfo;
