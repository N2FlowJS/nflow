import React from 'react';
import { Flex, Typography, Tag, Tooltip } from 'antd';
import { ApiOutlined } from '@ant-design/icons';

interface ModelInfoProps {
  model: string;
  provider?: string | null;
  contextWindow?: number | null;
}

const getModelColor = (model: string): string => {
  if (model.includes('gpt-4')) return 'purple';
  if (model.includes('gpt-3')) return 'green';
  if (model.includes('claude')) return 'orange';
  if (model.includes('llama')) return 'blue';
  if (model.includes('mistral')) return 'geekblue';
  return 'default';
};

const ModelInfo: React.FC<ModelInfoProps> = ({ model, provider, contextWindow }) => {
  const tooltipContent = () => {
    const parts = [];
    if (provider) parts.push(`Provider: ${provider}`);
    if (contextWindow) parts.push(`Context: ${contextWindow.toLocaleString()} tokens`);
    
    return parts.join(' | ');
  };
  
  const hasDetails = provider || contextWindow;
  
  return (
    <Flex align="center" gap={6}>
      <Typography.Text type="secondary">
        <ApiOutlined style={{ marginRight: 4 }} />
        Model:
      </Typography.Text>
      
      {hasDetails ? (
        <Tooltip title={tooltipContent()}>
          <Tag color={getModelColor(model)} style={{ cursor: 'pointer' }}>
            {model}
          </Tag>
        </Tooltip>
      ) : (
        <Tag color={getModelColor(model)}>
          {model}
        </Tag>
      )}
    </Flex>
  );
};

export default ModelInfo;
