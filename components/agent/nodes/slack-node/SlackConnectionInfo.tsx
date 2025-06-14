import { SlackOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Card, Typography, Tag } from 'antd';
import React from 'react';

interface SlackConnectionInfoProps {
  hasToken: boolean;
}

const SlackConnectionInfo: React.FC<SlackConnectionInfoProps> = ({ hasToken }) => {
  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <SlackOutlined style={{ marginRight: 4 }} />
          Slack
        </Typography.Text>
      }
      style={{
        width: '100%',
        borderColor: hasToken ? '#91caff' : '#ffccc7',
      }}
    >
      <div>
        {hasToken ? (
          <Tag color="green" style={{ fontSize: '11px' }}>
            <CheckCircleOutlined style={{ marginRight: 2 }} />
            Bot Token Configured
          </Tag>
        ) : (
          <Tag color="red" style={{ fontSize: '11px' }}>
            <WarningOutlined style={{ marginRight: 2 }} />
            Bot Token Required
          </Tag>
        )}
      </div>
    </Card>
  );
};

export default SlackConnectionInfo;
