import { MailOutlined, WarningOutlined, CodeOutlined } from '@ant-design/icons';
import { Card, Typography, Tag } from 'antd';
import React from 'react';

interface MailInfoProps {
  to: string;
  subject: string;
  isHtml: boolean;
}

const MailInfo: React.FC<MailInfoProps> = ({ to, subject, isHtml }) => {
  const hasRecipient = to && to.trim().length > 0;
  
  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <MailOutlined style={{ marginRight: 4 }} />
          Email Details
        </Typography.Text>
      }
      style={{
        width: '100%',
        borderColor: hasRecipient ? '#91caff' : '#ffccc7',
      }}
    >
      {hasRecipient ? (
        <div>
          <Typography.Text 
            strong 
            style={{ 
              fontSize: '12px',
              display: 'block',
              marginBottom: 4
            }}
          >
            To: {to.length > 25 ? `${to.substring(0, 25)}...` : to}
          </Typography.Text>
          <Typography.Text 
            style={{ 
              fontSize: '11px',
              display: 'block',
              marginBottom: 4,
              color: '#666'
            }}
          >
            Subject: {subject.length > 30 ? `${subject.substring(0, 30)}...` : subject}
          </Typography.Text>
          <Tag 
            color={isHtml ? 'blue' : 'default'} 
            style={{ fontSize: '10px' }}
            icon={isHtml ? <CodeOutlined /> : undefined}
          >
            {isHtml ? 'HTML' : 'Text'}
          </Tag>
        </div>
      ) : (
        <Typography.Text type="warning" style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
          <WarningOutlined style={{ marginRight: 4 }} />
          No recipient specified
        </Typography.Text>
      )}
    </Card>
  );
};

export default MailInfo;
