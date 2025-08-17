import { SearchOutlined, WarningOutlined } from '@ant-design/icons';
import { Card, Typography, Tag } from 'antd';
import React from 'react';

interface SearchQueryInfoProps {
  query: string;
  maxResults: number;
}

const SearchQueryInfo: React.FC<SearchQueryInfoProps> = ({ query, maxResults }) => {
  const hasQuery = query && query.trim().length > 0;
  
  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <SearchOutlined style={{ marginRight: 4 }} />
          Google Search
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
            Max: {maxResults} results
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

export default SearchQueryInfo;
