import { CheckCircleOutlined, WarningOutlined, CodeOutlined } from '@ant-design/icons';
import { Card, Typography, Tag } from 'antd';
import React from 'react';

interface ValidationInfoProps {
  validationType: string;
  hasCustomPattern: boolean;
  inputData: string;
}

const ValidationInfo: React.FC<ValidationInfoProps> = ({ validationType, hasCustomPattern, inputData }) => {
  const hasInputData = inputData && inputData.trim().length > 0;
  
  const getValidationTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'blue';
      case 'url': return 'green';
      case 'phone': return 'purple';
      case 'json': return 'orange';
      case 'number': return 'cyan';
      case 'date': return 'magenta';
      case 'custom': return 'red';
      default: return 'default';
    }
  };

  const getValidationTypeLabel = (type: string) => {
    switch (type) {
      case 'email': return 'Email';
      case 'url': return 'URL';
      case 'phone': return 'Phone';
      case 'json': return 'JSON';
      case 'number': return 'Number';
      case 'date': return 'Date';
      case 'custom': return 'Custom';
      default: return type;
    }
  };

  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <CheckCircleOutlined style={{ marginRight: 4 }} />
          Data Validation
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
            <Tag color={getValidationTypeColor(validationType)} style={{ fontSize: '11px' }}>
              {getValidationTypeLabel(validationType)}
            </Tag>
            {hasCustomPattern && (
              <Tag color="red" style={{ fontSize: '11px' }}>
                <CodeOutlined style={{ marginRight: 2 }} />
                Regex
              </Tag>
            )}
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

export default ValidationInfo;
