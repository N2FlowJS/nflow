import React, { memo, useMemo } from 'react';
import { Flex, Typography } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { useLocale } from '../../../locale/index';

interface GreetingSectionProps {
  greeting: string;
}

const GreetingSection: React.FC<GreetingSectionProps> = memo(({ greeting }) => {
  const { t } = useLocale('greetingSection');

  const iconStyle = useMemo(() => ({ marginRight: 4 }), []);
  const greetingStyle = useMemo(() => ({ color: '#096dd9' }), []);
  const ellipsisConfig = useMemo(() => ({ tooltip: greeting }), [greeting]);

  return (
    <Flex align="center" gap={6}>
      <Typography.Text type="secondary">
        <MessageOutlined style={iconStyle} />
        {t('greetingLabel')}:
      </Typography.Text>
      <Typography.Text ellipsis={ellipsisConfig} style={greetingStyle}>
        &quot;{greeting}&quot;
      </Typography.Text>
    </Flex>
  );
});

GreetingSection.displayName = 'GreetingSection';

export default GreetingSection;
