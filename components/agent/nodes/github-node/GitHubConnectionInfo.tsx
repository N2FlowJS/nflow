import { GithubOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Card, Typography, Tag } from 'antd';
import React from 'react';

interface GitHubConnectionInfoProps {
  owner: string;
  repository: string;
  hasToken: boolean;
}

const GitHubConnectionInfo: React.FC<GitHubConnectionInfoProps> = ({ owner, repository, hasToken }) => {
  const isConfigured = owner && repository && hasToken;
  
  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <GithubOutlined style={{ marginRight: 4 }} />
          GitHub
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
          Repo: {owner && repository ? `${owner}/${repository}` : 'Not set'}
        </Typography.Text>
      </div>
    </Card>
  );
};

export default GitHubConnectionInfo;
