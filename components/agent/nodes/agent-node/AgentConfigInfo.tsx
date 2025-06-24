import React from 'react';
import { Card, Typography } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';

interface AgentConfigInfoProps {
  systemMessage: string;
}

const AgentConfigInfo: React.FC<AgentConfigInfoProps> = ({ systemMessage }) => {
  const hasSystemMessage = systemMessage && systemMessage.trim().length > 0;

  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <ApartmentOutlined style={{ marginRight: 4 }} />
          Agent Configuration
        </Typography.Text>
      }
      style={{
        width: '100%',
        borderColor: '#d9d9d9',
      }}
    >
      <Typography.Paragraph 
        type="secondary" 
        ellipsis={{ rows: 2, expandable: false }}
        style={{ fontSize: '12px', margin: 0 }}
      >
        {hasSystemMessage ? systemMessage : 'No system message configured.'}
      </Typography.Paragraph>
    </Card>
  );
};

export default AgentConfigInfo;
