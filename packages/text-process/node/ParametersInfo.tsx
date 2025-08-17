import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { SearchOutlined, SwapOutlined, SplitCellsOutlined, CodeOutlined } from '@ant-design/icons';

interface ParametersInfoProps {
  operation: string;
  searchValue?: string;
  replaceValue?: string;
  separator?: string;
  regexPattern?: string;
}

const ParametersInfo: React.FC<ParametersInfoProps> = ({ 
  operation, 
  searchValue, 
  replaceValue, 
  separator, 
  regexPattern 
}) => {
  const renderParameters = () => {
    switch (operation) {
      case 'replace':
        return (
          <Flex vertical gap={4}>
            <Flex align="center" gap={4}>
              <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                <SearchOutlined style={{ marginRight: 2 }} />
                Find:
              </Typography.Text>
              <Tag color="orange" style={{ fontSize: '11px', maxWidth: '100px' }}>
                {searchValue && searchValue.length > 8 
                  ? `${searchValue.substring(0, 8)}...` 
                  : searchValue || 'N/A'}
              </Tag>
            </Flex>
            <Flex align="center" gap={4}>
              <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                <SwapOutlined style={{ marginRight: 2 }} />
                Replace:
              </Typography.Text>
              <Tag color="blue" style={{ fontSize: '11px', maxWidth: '100px' }}>
                {replaceValue !== undefined 
                  ? (replaceValue.length > 8 ? `${replaceValue.substring(0, 8)}...` : replaceValue || '(empty)')
                  : 'N/A'}
              </Tag>
            </Flex>
          </Flex>
        );
      
      case 'split':
      case 'join':
        return (
          <Flex align="center" gap={4}>
            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
              <SplitCellsOutlined style={{ marginRight: 2 }} />
              Separator:
            </Typography.Text>
            <Tag color="purple" style={{ fontSize: '11px' }}>
              {separator || ','}
            </Tag>
          </Flex>
        );
      
      case 'regex':
        return (
          <Flex align="center" gap={4}>
            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
              <CodeOutlined style={{ marginRight: 2 }} />
              Pattern:
            </Typography.Text>
            <Tag color="red" style={{ fontSize: '11px', maxWidth: '120px' }}>
              {regexPattern && regexPattern.length > 10 
                ? `${regexPattern.substring(0, 10)}...` 
                : regexPattern || 'N/A'}
            </Tag>
          </Flex>
        );
      
      default:
        return (
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            No parameters required
          </Typography.Text>
        );
    }
  };

  return <div>{renderParameters()}</div>;
};

export default ParametersInfo;
