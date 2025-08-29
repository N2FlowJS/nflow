import { FileTextOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Card, Typography, Tag } from 'antd';
import React from 'react';

interface ConfluenceConnectionInfoProps {
  serverUrl: string;
  hasCredentials: boolean;
}

const ConfluenceConnectionInfo: React.FC<ConfluenceConnectionInfoProps> = ({ serverUrl, hasCredentials }) => {
  const isConfigured = serverUrl && hasCredentials;
  
  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <FileTextOutlined style={{ marginRight: 4 }} />
          Confluence
        </Typography.Text>
      }
      style={{
        width: '100%',
        borderColor: isConfigured ? '#91caff' : '#ffccc7',
      }}
    >
      <div>
        <div style={{ marginBottom: 8 }}>
          {isConfigured ? (
            <Tag color="green" style={{ fontSize: '11px' }}>
              <CheckCircleOutlined style={{ marginRight: 2 }} />
              Connected
            </Tag>
          ) : (
            <Tag color="red" style={{ fontSize: '11px' }}>
              <WarningOutlined style={{ marginRight: 2 }} />
              Not Configured
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
          Server: {serverUrl ? (serverUrl.length > 25 ? `${serverUrl.substring(0, 25)}...` : serverUrl) : 'Not set'}
        </Typography.Text>
      </div>
    </Card>
  );
};

export default ConfluenceConnectionInfo;
