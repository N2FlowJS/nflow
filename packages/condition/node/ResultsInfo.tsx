import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface ResultsInfoProps {
  trueValue: string;
  falseValue: string;
}

const ResultsInfo: React.FC<ResultsInfoProps> = ({ trueValue, falseValue }) => {
  return (
    <Flex vertical gap={4}>
      <Flex align="center" gap={4}>
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <CheckCircleOutlined style={{ marginRight: 2, color: '#52c41a' }} />
          True:
        </Typography.Text>
        <Tag color="green" style={{ fontSize: '11px', maxWidth: '120px' }}>
          {trueValue.length > 12 ? `${trueValue.substring(0, 12)}...` : trueValue}
        </Tag>
      </Flex>
      
      <Flex align="center" gap={4}>
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <CloseCircleOutlined style={{ marginRight: 2, color: '#ff4d4f' }} />
          False:
        </Typography.Text>
        <Tag color="red" style={{ fontSize: '11px', maxWidth: '120px' }}>
          {falseValue.length > 12 ? `${falseValue.substring(0, 12)}...` : falseValue}
        </Tag>
      </Flex>
    </Flex>
  );
};

export default ResultsInfo;
