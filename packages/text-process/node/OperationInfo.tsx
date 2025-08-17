import { FontSizeOutlined, WarningOutlined } from '@ant-design/icons';
import { Card, Typography, Tag } from 'antd';
import React from 'react';

interface OperationInfoProps {
  operation: string;
  inputText: string;
}

const OperationInfo: React.FC<OperationInfoProps> = ({ operation, inputText }) => {
  const hasInputText = inputText && inputText.trim().length > 0;
  
  const getOperationColor = (op: string) => {
    switch (op) {
      case 'uppercase':
      case 'lowercase': return 'blue';
      case 'trim': return 'green';
      case 'replace': return 'orange';
      case 'split':
      case 'join': return 'purple';
      case 'regex': return 'red';
      case 'length': return 'cyan';
      default: return 'default';
    }
  };

  const getOperationLabel = (op: string) => {
    switch (op) {
      case 'uppercase': return 'UPPER';
      case 'lowercase': return 'lower';
      case 'trim': return 'TRIM';
      case 'replace': return 'REPLACE';
      case 'split': return 'SPLIT';
      case 'join': return 'JOIN';
      case 'regex': return 'REGEX';
      case 'length': return 'LENGTH';
      default: return op;
    }
  };

  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <FontSizeOutlined style={{ marginRight: 4 }} />
          Text Processing
        </Typography.Text>
      }
      style={{
        width: '100%',
        borderColor: hasInputText ? '#91caff' : '#ffccc7',
      }}
    >
      {hasInputText ? (
        <div>
          <div style={{ marginBottom: 8 }}>
            <Tag color={getOperationColor(operation)} style={{ fontSize: '11px' }}>
              {getOperationLabel(operation)}
            </Tag>
          </div>
          <Typography.Text 
            style={{ 
              fontSize: '12px',
              display: 'block',
              color: '#666'
            }}
          >
            Input: {inputText.length > 30 ? `${inputText.substring(0, 30)}...` : inputText}
          </Typography.Text>
        </div>
      ) : (
        <Typography.Text type="warning" style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
          <WarningOutlined style={{ marginRight: 4 }} />
          No input text specified
        </Typography.Text>
      )}
    </Card>
  );
};

export default OperationInfo;
