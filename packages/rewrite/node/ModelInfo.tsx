import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { RobotOutlined, WarningOutlined } from '@ant-design/icons';

interface ModelInfoProps {
  hasModel: boolean;
  modelName: string;
}

const ModelInfo: React.FC<ModelInfoProps> = ({ hasModel, modelName }) => {
  return (
    <Flex align="center" gap={6}>
      <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
        <RobotOutlined style={{ marginRight: 4 }} />
        Model:
      </Typography.Text>
      {hasModel ? (
        <Tag color="green" style={{ fontSize: '11px' }}>
          {modelName || 'Selected'}
        </Tag>
      ) : (
        <Tag color="red" style={{ fontSize: '11px' }}>
          <WarningOutlined style={{ marginRight: 2 }} />
          Not selected
        </Tag>
      )}
    </Flex>
  );
};

export default ModelInfo;
