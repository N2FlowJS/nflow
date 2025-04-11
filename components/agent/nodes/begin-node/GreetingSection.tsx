import React from 'react';
import { Flex, Typography } from 'antd';
import { MessageOutlined } from '@ant-design/icons';

interface GreetingSectionProps {
  greeting: string;
}

const GreetingSection: React.FC<GreetingSectionProps> = ({ greeting }) => {
  return (
    <Flex align="center" gap={6}>
      <Typography.Text type="secondary">
        <MessageOutlined style={{ marginRight: 4 }} />
        Greeting:
      </Typography.Text>
      <Typography.Text ellipsis={{ tooltip: greeting }} style={{ color: '#096dd9' }}>
        "{greeting}"
      </Typography.Text>
    </Flex>
  );
};

export default GreetingSection;
