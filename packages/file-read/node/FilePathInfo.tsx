import { FileTextOutlined, WarningOutlined } from '@ant-design/icons';
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
          <FileTextOutlined style={{ marginRight: 4 }} />
          File Read
        </Typography.Text>
      }
      style={{ marginBottom: 8 }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography.Text type="secondary" style={{ fontSize: '11px' }}>
            Path:
          </Typography.Text>
          {hasFilePath ? (
            <Typography.Text
              style={{
                fontSize: '11px',
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={filePath}
            >
              {filePath}
            </Typography.Text>
          ) : (
            <Tag color="red" style={{ fontSize: '10px' }}>
              <WarningOutlined style={{ marginRight: 2 }} />
              No path set
            </Tag>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography.Text type="secondary" style={{ fontSize: '11px' }}>
            Encoding:
          </Typography.Text>
          <Tag color={getEncodingColor(encoding)} style={{ fontSize: '10px' }}>
            {encoding || 'utf8'}
          </Tag>
        </div>
      </div>
    </Card>
  );
};

export default FilePathInfo;
