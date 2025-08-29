import { ApiOutlined, WarningOutlined, CodeOutlined } from '@ant-design/icons';
import { Card, Typography, Tag } from 'antd';
import React from 'react';

interface RequestInfoProps {
  method: string;
  url: string;
  hasBody: boolean;
}

const RequestInfo: React.FC<RequestInfoProps> = ({ method, url, hasBody }) => {
  const hasUrl = url && url.trim().length > 0;

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'green';
      case 'POST': return 'blue';
      case 'PUT': return 'orange';
      case 'DELETE': return 'red';
      case 'PATCH': return 'purple';
      default: return 'default';
    }
  };

  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <ApiOutlined style={{ marginRight: 4 }} />
          HTTP Request
        </Typography.Text>
      }
      style={{
        width: '100%',
        borderColor: hasUrl ? '#91caff' : '#ffccc7',
      }}
    >
      {hasUrl ? (
        <div>
          <div style={{ marginBottom: 8 }}>
            <Tag color={getMethodColor(method)} style={{ fontSize: '11px' }}>
              {method.toUpperCase()}
            </Tag>
            {hasBody && (
              <Tag color="blue" style={{ fontSize: '11px' }}>
                <CodeOutlined style={{ marginRight: 2 }} />
                Body
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
            URL: {url.length > 35 ? `${url.substring(0, 35)}...` : url}
          </Typography.Text>
        </div>
      ) : (
        <Typography.Text type="warning" style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
          <WarningOutlined style={{ marginRight: 4 }} />
          No URL specified
        </Typography.Text>
      )}
    </Card>
  );
};

export default RequestInfo;
