import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { ExclamationCircleOutlined, NumberOutlined } from '@ant-design/icons';

interface ConstraintsInfoProps {
  required: boolean;
  minLength?: number;
  maxLength?: number;
}

const ConstraintsInfo: React.FC<ConstraintsInfoProps> = ({ required, minLength, maxLength }) => {
  const hasLengthConstraints = minLength !== undefined || maxLength !== undefined;

  return (
    <Flex vertical gap={4}>
      <Flex align="center" gap={12}>
        <Flex align="center" gap={4}>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            <ExclamationCircleOutlined style={{ marginRight: 2 }} />
            Required:
          </Typography.Text>
          <Tag color={required ? 'red' : 'green'} style={{ fontSize: '11px' }}>
            {required ? 'Yes' : 'No'}
          </Tag>
        </Flex>
        
        {hasLengthConstraints && (
          <Flex align="center" gap={4}>
            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
              <NumberOutlined style={{ marginRight: 2 }} />
              Length:
            </Typography.Text>
            <Tag color="blue" style={{ fontSize: '11px' }}>
              {minLength !== undefined ? `Min: ${minLength}` : ''}
              {minLength !== undefined && maxLength !== undefined ? ', ' : ''}
              {maxLength !== undefined ? `Max: ${maxLength}` : ''}
            </Tag>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default ConstraintsInfo;
