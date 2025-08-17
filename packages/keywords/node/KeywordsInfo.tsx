import React from 'react';
import { Card, Typography, Tooltip } from 'antd';
import { NumberOutlined, CheckCircleOutlined } from '@ant-design/icons';

interface KeywordsInfoProps {
  maxResults: number;
}

const KeywordsInfo: React.FC<KeywordsInfoProps> = ({ maxResults }) => {
  return (
    <Card
      size="small"
      style={{
        borderColor: '#d3adf7',
      }}
    >
      <Tooltip title={`Maximum number of keywords to extract: ${maxResults}`}>
        <Typography.Text
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px'
          }}
        >
          <NumberOutlined style={{ marginRight: 6 }} />
          <CheckCircleOutlined style={{ color: '#722ed1', marginRight: 4 }} />
          Max results: {maxResults}
        </Typography.Text>
      </Tooltip>
    </Card>
  );
};

export default KeywordsInfo;
