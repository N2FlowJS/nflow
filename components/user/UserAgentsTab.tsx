import React from 'react';
import { Card, Button, Typography, Table, Tag, Alert, Space } from 'antd';
import { RobotOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

interface Agent {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  ownerType: string;
  createdAt: string;
  updatedAt: string;
}

interface UserAgentsTabProps {
  userId: string;
  isCurrentUser: boolean;
  agents: Agent[];
  onShowCreateAgent: () => void;
}

const UserAgentsTab: React.FC<UserAgentsTabProps> = ({
  userId,
  isCurrentUser,
  agents,
  onShowCreateAgent
}) => {
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
          onClick={() => window.location.href = `/agent/${record.id}`}
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
          <Space>
            <RobotOutlined />
            {isCurrentUser ? "My Agents" : "User's Agents"}
          </Space>
        </Title>
      }
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onShowCreateAgent}
        >
          Create Agent
        </Button>
      }
    >
      {agents?.length === 0 ? (
        <Alert
          message="No Agents Found"
          description={
            isCurrentUser ?
              "You haven't created any agents yet. Create your first agent to get started." :
              "This user has not created any agents."
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : (
        <Text style={{ marginBottom: 16, display: 'block' }}>
          {isCurrentUser ?
            "These are the agents you've created:" :
            "These are the agents this user has created:"
          }
        </Text>
      )}

      <Table
        columns={agentColumns}
        dataSource={agents || []}
        rowKey="id"
        pagination={false}
        locale={{ emptyText: isCurrentUser ? 'You have not created any agents' : 'This user has not created any agents' }}
      />
    </Card>
  );
};

export default UserAgentsTab;
