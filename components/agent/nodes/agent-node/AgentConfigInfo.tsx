import React from 'react';
import { Card, Typography } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';

interface AgentConfigInfoProps {
  systemMessage: string;
}

const AgentConfigInfo: React.FC<AgentConfigInfoProps> = ({ systemMessage }) => {
  const hasSystemMessage = systemMessage && systemMessage.trim().length > 0;

  return (
    <Typography.Paragraph
      type="secondary"
      ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
      style={{ fontSize: '12px', margin: 0 }}>
      {hasSystemMessage ? systemMessage : 'No system message configured.'}
    </Typography.Paragraph>
  );
};

export default AgentConfigInfo;
