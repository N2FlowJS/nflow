import { FacebookOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Card, Typography, Tag } from 'antd';
import React from 'react';

interface FacebookConnectionInfoProps {
  pageId: string;
  hasToken: boolean;
}

const FacebookConnectionInfo: React.FC<FacebookConnectionInfoProps> = ({ pageId, hasToken }) => {
  const isConfigured = hasToken;
  
  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <FacebookOutlined style={{ marginRight: 4 }} />
          Facebook
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
              Token Required
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
          Page: {pageId || 'Personal/Default'}
        </Typography.Text>
      </div>
    </Card>
  );
};

export default FacebookConnectionInfo;
