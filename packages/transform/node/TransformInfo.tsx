import { SwapOutlined, WarningOutlined } from '@ant-design/icons';
import { Card, Typography, Tag } from 'antd';
import React from 'react';

interface TransformInfoProps {
  transformType: string;
  inputData: string;
}

const TransformInfo: React.FC<TransformInfoProps> = ({ transformType, inputData }) => {
  const hasInputData = inputData && inputData.trim().length > 0;
  
  const getTransformTypeColor = (type: string) => {
    switch (type) {
      case 'json': return 'blue';
      case 'array': return 'green';
      case 'object': return 'orange';
      case 'text': return 'purple';
      default: return 'default';
    }
  };

  const getTransformTypeLabel = (type: string) => {
    switch (type) {
      case 'json': return 'JSON';
      case 'array': return 'Array';
      case 'object': return 'Object';
      case 'text': return 'Text';
      default: return type;
    }
  };

  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <SwapOutlined style={{ marginRight: 4 }} />
          Data Transform
        </Typography.Text>
      }
      style={{
        width: '100%',
        borderColor: hasInputData ? '#91caff' : '#ffccc7',
      }}
    >
      {hasInputData ? (
        <div>
          <div style={{ marginBottom: 8 }}>
            <Tag color={getTransformTypeColor(transformType)} style={{ fontSize: '11px' }}>
              {getTransformTypeLabel(transformType)}
            </Tag>
          </div>
          <Typography.Text 
            style={{ 
              fontSize: '12px',
              display: 'block',
              color: '#666'
            }}
          >
            Input: {inputData.length > 30 ? `${inputData.substring(0, 30)}...` : inputData}
          </Typography.Text>
        </div>
      ) : (
        <Typography.Text type="warning" style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
          <WarningOutlined style={{ marginRight: 4 }} />
          No input data specified
        </Typography.Text>
      )}
    </Card>
  );
};

export default TransformInfo;
