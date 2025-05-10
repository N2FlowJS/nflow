import { CrownOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { Button, Empty, List, Space, Tag } from 'antd';
import { useRouter } from 'next/router';
import React from 'react';


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

  return (
    <div className="teams-container">
      {teams?.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              {isCurrentUser ? 
                "You're not a member of any team yet" : 
                "This user is not a member of any team"}
            </span>
          }
        >
          {isCurrentUser && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={onShowCreateTeam}
            >
              Create Team
            </Button>
          )}
        </Empty>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={teams}
          renderItem={(team) => (
            <List.Item
              className="team-list-item"
              actions={[
                <Button 
                  key="view" 
                  type="link"
                  onClick={() => router.push(`/team/${team.id}`)}
                >
                  View Details
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div className="team-avatar">
                    <TeamOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
                  </div>
                }
                title={
                  <Space>
                    <span className="team-name">{team.name}</span>
                    {team.role === 'owner' && (
                      <Tag color="gold" icon={<CrownOutlined />}>OWNER</Tag>
                    )}
                    {team.role !== 'owner' && (
                      <Tag color={getRoleColor(team.role||'')}>{team.role?.toUpperCase()}</Tag>
                    )}
                  </Space>
                }
                description={team.description}
              />
            </List.Item>
          )}
        />
      )}

  
    </div>
  );
};

export default UserTeamsTab;
