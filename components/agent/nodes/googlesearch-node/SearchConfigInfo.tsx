import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { SafetyOutlined, GlobalOutlined, SettingOutlined } from '@ant-design/icons';

interface SearchConfigInfoProps {
  safeSearch: string;
  language: string;
  useSystemConfig: boolean;
}

const SearchConfigInfo: React.FC<SearchConfigInfoProps> = ({ safeSearch, language, useSystemConfig }) => {
  return (
    <Flex vertical gap={4}>
      <Flex align="center" gap={12}>
        <Flex align="center" gap={4}>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            <SafetyOutlined style={{ marginRight: 4 }} />
            Safe:
          </Typography.Text>
          <Tag color={safeSearch === 'strict' ? 'red' : safeSearch === 'moderate' ? 'orange' : 'green'} style={{ fontSize: '11px' }}>
            {safeSearch}
          </Tag>
        </Flex>
        
        <Flex align="center" gap={4}>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            <GlobalOutlined style={{ marginRight: 4 }} />
            Lang:
          </Typography.Text>
          <Tag color="blue" style={{ fontSize: '11px' }}>{language.toUpperCase()}</Tag>
        </Flex>
      </Flex>
      
      <Flex align="center" gap={4}>
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <SettingOutlined style={{ marginRight: 4 }} />
          Config:
        </Typography.Text>
        <Tag color={useSystemConfig ? 'green' : 'orange'} style={{ fontSize: '11px' }}>
          {useSystemConfig ? 'System' : 'Custom'}
        </Tag>
      </Flex>
    </Flex>
  );
};

export default SearchConfigInfo;
