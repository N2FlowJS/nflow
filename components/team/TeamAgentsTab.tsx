import { ClockCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Row, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

const { Title, Text, Paragraph } = Typography;

interface Agent {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  ownerType: string;
  createdAt: string;
  updatedAt: string;
}

interface TeamAgentsTabProps {
  agents: Agent[];
  userRole: string | null;
  onCreateAgent: () => void;
}

const TeamAgentsTab: React.FC<TeamAgentsTabProps> = ({ agents }) => {
  const router = useRouter();

  return (
    <>
      {agents.length === 0 ? (
        <Alert
          message="No Agents Found"
          description="This team hasn't created any agents yet."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {agents.map((agent) => (
            <Col xs={24} sm={12} md={8} lg={8} xl={6} key={agent.id}>
              <Card
                hoverable
                style={{ height: '100%' }}
                actions={[
                  <Button type="primary" key="view" onClick={() => router.push(`/agent/${agent.id}`)}>
                    View
                  </Button>,
                ]}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Link href={`/agent/${agent.id}`}>
                    <Title level={5}>{agent.name}</Title>
                  </Link>

                  <Tag color={agent.isActive ? 'green' : 'red'}>{agent.isActive ? 'Active' : 'Inactive'}</Tag>

                  <Paragraph
                    ellipsis={{ rows: 2, expandable: false, tooltip: agent.description }}
                    style={{ minHeight: '44px' }}>
                    {agent.description || 'No description available'}
                  </Paragraph>

                  <Text type="secondary">
                    <ClockCircleOutlined /> Updated: {new Date(agent.updatedAt).toLocaleString()}
                  </Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default TeamAgentsTab;
