import { EnvironmentOutlined, WarningOutlined, CheckCircleOutlined, KeyOutlined } from '@ant-design/icons';
import { Card, Typography, Tag } from 'antd';
import React from 'react';

interface GoogleMapConnectionInfoProps {
  hasApiKey: boolean;
}

const GoogleMapConnectionInfo: React.FC<GoogleMapConnectionInfoProps> = ({ hasApiKey }) => {
  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <EnvironmentOutlined style={{ marginRight: 4 }} />
          Google Maps
        </Typography.Text>
      }
      style={{
        width: '100%',
        borderColor: hasApiKey ? '#91caff' : '#ffccc7',
      }}
    >
      <div>
        <div style={{ marginBottom: 8 }}>
          {hasApiKey ? (
            <Tag color="green" style={{ fontSize: '11px' }}>
              <CheckCircleOutlined style={{ marginRight: 2 }} />
              API Key Set
            </Tag>
          ) : (
            <Tag color="red" style={{ fontSize: '11px' }}>
              <WarningOutlined style={{ marginRight: 2 }} />
              API Key Required
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
          <KeyOutlined style={{ marginRight: 4 }} />
          Google Maps Platform
        </Typography.Text>
      </div>
    </Card>
  );
};

export default GoogleMapConnectionInfo;
