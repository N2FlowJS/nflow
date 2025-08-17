import React from 'react';
import { Tag, Typography, Space } from 'antd';

interface WebhookInfoProps {
  method: string;
  url: string;
  retryCount: number;
}

const truncate = (s: string, len = 40) => (s.length > len ? s.slice(0, len - 3) + '...' : s);

const WebhookInfo: React.FC<WebhookInfoProps> = ({ method, url, retryCount }) => {
  return (
    <Space direction="vertical" size={4} style={{ width: '100%' }}>
      <Space wrap>
        <Tag color="blue">{method}</Tag>
        {retryCount > 0 && <Tag color="purple">retries {retryCount}</Tag>}
      </Space>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {truncate(url || '')}
      </Typography.Text>
    </Space>
  );
};

export default WebhookInfo;
