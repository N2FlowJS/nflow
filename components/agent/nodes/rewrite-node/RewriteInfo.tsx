import { EditOutlined, CheckCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import { Card, Typography, Tag, Flex } from 'antd';
import React from 'react';

interface RewriteInfoProps {
  outputStyle: string;
  preserveMeaning: boolean;
  numberHistory: number;
}

const RewriteInfo: React.FC<RewriteInfoProps> = ({ outputStyle, preserveMeaning, numberHistory }) => {
  const getStyleColor = (style: string) => {
    switch (style) {
      case 'formal': return 'blue';
      case 'casual': return 'green';
      case 'professional': return 'purple';
      case 'concise': return 'orange';
      case 'detailed': return 'cyan';
      default: return 'default';
    }
  };

  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <EditOutlined style={{ marginRight: 4 }} />
          Rewrite Settings
        </Typography.Text>
      }
      style={{ width: '100%' }}
    >
      <Flex vertical gap={8}>
        <Flex align="center" gap={6}>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            Style:
          </Typography.Text>
          <Tag color={getStyleColor(outputStyle)} style={{ fontSize: '11px' }}>
            {outputStyle.charAt(0).toUpperCase() + outputStyle.slice(1)}
          </Tag>
        </Flex>
        
        <Flex align="center" gap={12}>
          <Flex align="center" gap={4}>
            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
              <CheckCircleOutlined style={{ marginRight: 2 }} />
              Preserve:
            </Typography.Text>
            <Tag color={preserveMeaning ? 'green' : 'orange'} style={{ fontSize: '11px' }}>
              {preserveMeaning ? 'Yes' : 'No'}
            </Tag>
          </Flex>
          
          <Flex align="center" gap={4}>
            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
              <HistoryOutlined style={{ marginRight: 2 }} />
              History:
            </Typography.Text>
            <Tag color="blue" style={{ fontSize: '11px' }}>{numberHistory}</Tag>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};

export default RewriteInfo;
