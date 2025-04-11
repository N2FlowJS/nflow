import React from 'react';
import { Flex, Typography, Tag, Card, Space } from 'antd';
import { DatabaseOutlined, WarningOutlined } from '@ant-design/icons';

interface KnowledgeBaseInfoProps {
  knowledgeIds: string[];
}

const KnowledgeBaseInfo: React.FC<KnowledgeBaseInfoProps> = ({ knowledgeIds }) => {
  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <DatabaseOutlined style={{ marginRight: 4 }} />
          Knowledge Bases
        </Typography.Text>
      }
      style={{
        width: '100%',
        backgroundColor: knowledgeIds.length > 0 ? 'rgba(230, 244, 255, 0.6)' : 'rgba(255, 245, 245, 0.6)',
        borderColor: knowledgeIds.length > 0 ? '#91caff' : '#ffccc7',
      }}
      bodyStyle={{ padding: '4px 8px' }}
    >
      {knowledgeIds.length > 0 ? (
        <Space size={[0, 4]} wrap>
          {knowledgeIds.map((id, index) => (
            <Tag key={id} color="blue" style={{ margin: '2px' }}>
              KB {index + 1}
            </Tag>
          ))}
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            {knowledgeIds.length} selected
          </Typography.Text>
        </Space>
      ) : (
        <Typography.Text type="warning" style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
          <WarningOutlined style={{ marginRight: 4 }} />
          No knowledge bases selected
        </Typography.Text>
      )}
    </Card>
  );
};

export default KnowledgeBaseInfo;
