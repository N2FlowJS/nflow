import React from 'react';
import { Flex, Typography } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { useLocale } from '@/locale/index'; // Import the useLocale hook

interface GreetingSectionProps {
  greeting: string;
}

const GreetingSection: React.FC<GreetingSectionProps> = ({ greeting }) => {
  const { t } = useLocale('greetingSection'); // Initialize the hook

  return (
    <Flex align="center" gap={6}>
      <Typography.Text type="secondary">
        <MessageOutlined style={{ marginRight: 4 }} />
        {t('greetingLabel')}:
      </Typography.Text>
      <Typography.Text ellipsis={{ tooltip: greeting }} style={{ color: '#096dd9' }}>
        &quot;{greeting}&quot;
      </Typography.Text>
    </Flex>
  );
};

export default GreetingSection;
