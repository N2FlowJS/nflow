import { GlobalOutlined, WarningOutlined } from '@ant-design/icons';
import { Card, Typography, Tag } from 'antd';
import React from 'react';

interface WikiQueryInfoProps {
  query: string;
  maxResults: number;
}

const WikiQueryInfo: React.FC<WikiQueryInfoProps> = ({ query, maxResults }) => {
  const hasQuery = query && query.trim().length > 0;
  
  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <GlobalOutlined style={{ marginRight: 4 }} />
          Wikipedia Search
        </Typography.Text>
      }
      style={{
        width: '100%',
        borderColor: hasQuery ? '#91caff' : '#ffccc7',
      }}
    >
      {hasQuery ? (
        <div>
          <Typography.Text 
            style={{ 
              fontSize: '12px',
              display: 'block',
              marginBottom: 4
            }}
          >
            Query: {query.length > 30 ? `${query.substring(0, 30)}...` : query}
          </Typography.Text>
          <Tag color="blue" style={{ fontSize: '11px' }}>
            Max: {maxResults} articles
          </Tag>
        </div>
      ) : (
        <Typography.Text type="warning" style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
          <WarningOutlined style={{ marginRight: 4 }} />
          No search query specified
        </Typography.Text>
      )}
    </Card>
  );
};

export default WikiQueryInfo;
