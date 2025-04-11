import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { OrderedListOutlined } from '@ant-design/icons';

interface ResultsInfoProps {
  maxResults: number;
}

const ResultsInfo: React.FC<ResultsInfoProps> = ({ maxResults }) => {
  return (
    <Flex align="center" gap={6}>
      <Typography.Text type="secondary">
        <OrderedListOutlined style={{ marginRight: 4 }} />
        Max Results:
      </Typography.Text>
      <Tag color="cyan">{maxResults}</Tag>
    </Flex>
  );
};

export default ResultsInfo;
