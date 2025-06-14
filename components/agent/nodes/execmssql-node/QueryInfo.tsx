import { CodeOutlined, WarningOutlined } from '@ant-design/icons';
import { Card, Typography } from 'antd';
import React from 'react';

interface QueryInfoProps {
  query: string;
}

const QueryInfo: React.FC<QueryInfoProps> = ({ query }) => {
  const hasQuery = query && query.trim().length > 0;
  
  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <CodeOutlined style={{ marginRight: 4 }} />
          SQL Server Query
        </Typography.Text>
      }
      style={{
        width: '100%',
        borderColor: hasQuery ? '#91caff' : '#ffccc7',
      }}
    >
      {hasQuery ? (
        <Typography.Text 
          code 
          style={{ 
            fontSize: '11px',
            display: 'block',
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
          title={query}
        >
          {query}
        </Typography.Text>
      ) : (
        <Typography.Text type="warning" style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
          <WarningOutlined style={{ marginRight: 4 }} />
          No query specified
        </Typography.Text>
      )}
    </Card>
  );
};

export default QueryInfo;
