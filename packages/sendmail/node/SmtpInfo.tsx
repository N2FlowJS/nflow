import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { CloudServerOutlined, SettingOutlined } from '@ant-design/icons';

interface SmtpInfoProps {
  useSystemConfig: boolean;
  smtpHost: string;
}

const SmtpInfo: React.FC<SmtpInfoProps> = ({ useSystemConfig, smtpHost }) => {
  return (
    <Flex align="center" gap={6}>
      <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
        <CloudServerOutlined style={{ marginRight: 4 }} />
        SMTP:
      </Typography.Text>
      {useSystemConfig ? (
        <Tag color="green" style={{ fontSize: '11px' }}>
          System Config
        </Tag>
      ) : (
        <Tag color="orange" style={{ fontSize: '11px' }}>
          <SettingOutlined style={{ marginRight: 2 }} />
          {smtpHost || 'Custom'}
        </Tag>
      )}
    </Flex>
  );
};

export default SmtpInfo;
