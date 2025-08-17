import { ClockCircleOutlined } from '@ant-design/icons';
import { Card, Typography, Tag } from 'antd';
import React from 'react';

interface DelayInfoProps {
  duration: number;
  unit: string;
}

const DelayInfo: React.FC<DelayInfoProps> = ({ duration, unit }) => {
  const getUnitColor = (unit: string) => {
    switch (unit) {
      case 'seconds': return 'blue';
      case 'minutes': return 'orange';
      case 'hours': return 'red';
      default: return 'default';
    }
  };

  const formatDuration = (duration: number, unit: string) => {
    return `${duration} ${unit}`;
  };

  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          Delay Execution
        </Typography.Text>
      }
      style={{
        width: '100%',
        borderColor: '#91caff',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <Tag color={getUnitColor(unit)} style={{ fontSize: '14px', padding: '4px 12px' }}>
          {formatDuration(duration, unit)}
        </Tag>
      </div>
    </Card>
  );
};

export default DelayInfo;
