import React from 'react';
import { Card, Button, Typography, Table, Tag, Empty, Alert } from 'antd';
import { RobotOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';

const { Title } = Typography;

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
  teamId: string;
  agents: Agent[];
  userRole: string | null;
  onCreateAgent: () => void;
}

const TeamAgentsTab: React.FC<TeamAgentsTabProps> = ({
  teamId,
  agents,
  userRole,
  onCreateAgent
}) => {
  const router = useRouter();
  
  const canCreateAgents = userRole === 'owner' || userRole === 'admin';

  const agentColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Agent) => (
        <Link href={`/agent/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Agent) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => router.push(`/agent/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Card
      title={
        <Title level={4}>
          <RobotOutlined /> Team Agents
        </Title>
      }
      extra={
        canCreateAgents && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={onCreateAgent}
          >
            Create Agent
          </Button>
        )
      }
    >
      {agents.length === 0 ? (
        <Alert
          message="No Agents Found"
          description="This team hasn't created any agents yet."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : (
        <Table 
          columns={agentColumns} 
          dataSource={agents} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty description="No agents found" /> }}
        />
      )}
    </Card>
  );
};

export default TeamAgentsTab;
