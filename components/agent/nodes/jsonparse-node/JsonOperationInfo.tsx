import { CodeOutlined } from '@ant-design/icons';
import { Card, Typography, Tag } from 'antd';
import React from 'react';

interface JsonOperationInfoProps {
  operation: string;
  outputFormat: string;
}

const JsonOperationInfo: React.FC<JsonOperationInfoProps> = ({ operation, outputFormat }) => {
  const getOperationColor = (op: string) => {
    switch (op) {
      case 'parse': return 'blue';
      case 'stringify': return 'green';
      case 'extract': return 'orange';
      case 'validate': return 'red';
      default: return 'default';
    }
  };

  const getOperationLabel = (op: string) => {
    switch (op) {
      case 'parse': return 'PARSE';
      case 'stringify': return 'STRINGIFY';
      case 'extract': return 'EXTRACT';
      case 'validate': return 'VALIDATE';
      default: return op.toUpperCase();
    }
  };

  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <CodeOutlined style={{ marginRight: 4 }} />
          JSON Processing
        </Typography.Text>
      }
      style={{
        width: '100%',
        borderColor: '#91caff',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <Tag color={getOperationColor(operation)} style={{ fontSize: '11px', marginBottom: 4 }}>
          {getOperationLabel(operation)}
        </Tag>
        <br />
        <Tag color="cyan" style={{ fontSize: '10px' }}>
          → {outputFormat}
        </Tag>
      </div>
    </Card>
  );
};

export default JsonOperationInfo;
