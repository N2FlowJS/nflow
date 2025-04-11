import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { ApiOutlined } from '@ant-design/icons';

interface ModelInfoProps {
  model: string;
}

const getModelColor = (model: string): string => {
  if (model.includes('gpt-4')) return 'purple';
  if (model.includes('gpt-3')) return 'green';
  if (model.includes('claude')) return 'orange';
  return 'default';
};

const ModelInfo: React.FC<ModelInfoProps> = ({ model }) => {
  return (
    <Flex align="center" gap={6}>
      <Typography.Text type="secondary">
        <ApiOutlined style={{ marginRight: 4 }} />
        Model:
      </Typography.Text>
      <Tag color={getModelColor(model)}>
        {model}
      </Tag>
    </Flex>
  );
};

export default ModelInfo;
