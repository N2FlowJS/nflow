import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';

interface PlaceholderSectionProps {
  placeholder: string;
}

const PlaceholderSection: React.FC<PlaceholderSectionProps> = ({ placeholder }) => {
  return (
    <Flex align="center" gap={6}>
      <Typography.Text type="secondary">
        <EditOutlined style={{ marginRight: 4 }} />
        Placeholder:
      </Typography.Text>
      <Tag color="cyan">{placeholder}</Tag>
    </Flex>
  );
};

export default PlaceholderSection;
