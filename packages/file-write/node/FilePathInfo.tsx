import { SaveOutlined, WarningOutlined } from '@ant-design/icons';
import { Card, Typography, Tag } from 'antd';
import React from 'react';

interface FilePathInfoProps {
  filePath: string;
  encoding: string;
}

const FilePathInfo: React.FC<FilePathInfoProps> = ({ filePath, encoding }) => {
  const hasFilePath = filePath && filePath.trim().length > 0;
  
  const getEncodingColor = (enc: string) => {
    switch (enc) {
      case 'utf8': return 'blue';
      case 'base64': return 'orange';
      case 'binary': return 'red';
      default: return 'default';
    }
  };

  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <SaveOutlined style={{ marginRight: 4 }} />
          File Write
        </Typography.Text>
      }
      style={{
        width: '100%',
        borderColor: hasFilePath ? '#91caff' : '#ffccc7',
      }}
    >
      {hasFilePath ? (
        <div>
          <div style={{ marginBottom: 8 }}>
            <Tag color={getEncodingColor(encoding)} style={{ fontSize: '11px' }}>
              {encoding.toUpperCase()}
            </Tag>
          </div>
          <Typography.Text 
            style={{ 
              fontSize: '12px',
              display: 'block',
              color: '#666'
            }}
          >
            Path: {filePath.length > 30 ? `${filePath.substring(0, 30)}...` : filePath}
          </Typography.Text>
        </div>
      ) : (
        <Typography.Text type="warning" style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
          <WarningOutlined style={{ marginRight: 4 }} />
          No file path specified
        </Typography.Text>
      )}
    </Card>
  );
};

export default FilePathInfo;
