import React from 'react';
import { Card, Typography, Tooltip } from 'antd';
import { NumberOutlined } from '@ant-design/icons';

interface HistoryChatSizeProps {
  numberHistory: number;
}

const HistoryChatSize: React.FC<HistoryChatSizeProps> = ({ numberHistory }) => {
  return (
    <Card
      size="small"
      style={{
        borderColor: '#d3adf7',
      }}>
      <Tooltip title={`Maximum number of messages in history: ${numberHistory}`}>
        <Typography.Text
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px',
          }}>
          <NumberOutlined style={{ marginRight: 6 }} />
          History item size: {numberHistory}
        </Typography.Text>
      </Tooltip>
    </Card>
  );
};

export default HistoryChatSize;
