import React from 'react';
import { Card, Button, Typography, Table, Tag, Alert, Space } from 'antd';
import { TeamOutlined, CrownOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

const { Title, Text } = Typography;

interface Team {
  id: string;
  name: string;
  description: string;
  role?: string;
  joinedAt?: string;
}

interface UserTeamsTabProps {
  userId: string;
  isCurrentUser: boolean;
  teams: Team[];
  onShowCreateTeam: () => void;
}

const UserTeamsTab: React.FC<UserTeamsTabProps> = ({
  userId,
  isCurrentUser,
  teams,
  onShowCreateTeam
}) => {
  const router = useRouter();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'gold';
      case 'admin': return 'red';
      case 'maintainer': return 'volcano';
      case 'developer': return 'geekblue';
      case 'guest': return 'green';
      default: return 'default';
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'owner') {
      return <Tag color="gold" icon={<CrownOutlined />}>{role.toUpperCase()}</Tag>;
    }
    const color = getRoleColor(role);
    return <Tag color={color}>{role.toUpperCase()}</Tag>;
  };

  const teamColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Team) => (
        <a onClick={() => router.push(`/team/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => getRoleBadge(role)
    },
    {
      title: 'Joined',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    }
  ];

  return (
    <Card
      title={
        <Title level={4}>
          <Space>
            <TeamOutlined />
            Team Memberships
          </Space>
        </Title>
      }
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onShowCreateTeam}
        >
          Create Team
        </Button>
      }
    >
      {teams?.length === 0 ? (
        <Alert
          message="No Team Memberships"
          description={
            isCurrentUser ?
              "You are not a member of any team. Create a team or ask to be invited to one." :
              "This user is not a member of any team."
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : (
        <div style={{ marginBottom: 16 }}>
          <Text>
            {isCurrentUser ?
              "You are a member of the following teams:" :
              "This user is a member of the following teams:"
            }
          </Text>
        </div>
      )}

      <Table
        columns={teamColumns}
        dataSource={teams}
        rowKey="id"
        pagination={false}
        locale={{ emptyText: isCurrentUser ? 'You are not a member of any team' : 'This user is not a member of any team' }}
      />
    </Card>
  );
};

export default UserTeamsTab;
