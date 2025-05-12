import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Space, Typography } from 'antd';
import React, { useState } from 'react';
import AddMemberForm from './AddMemberForm';
import MemberList from './MemberList';

const { Title } = Typography;

interface TeamMember {
  id: string;
  role: string;
  joinedAt: string;
  leftAt: string | null;
  userId: string;
  teamId: string;
  user: any;
}

interface TeamMembersTabProps {
  teamId: string;
  members: TeamMember[];
  userPermission: string | null;
  availableUsers: any[];
  onAddMembers: (members: { userId: string, permission: string }[]) => void;
  onRemoveMember: (userId: string) => void;
  onUpdateRole: (userId: string, permission: string) => void;
}

const TeamMembersTab: React.FC<TeamMembersTabProps> = ({
  members,
  userPermission,
  availableUsers,
  onAddMembers,
  onRemoveMember,
  onUpdateRole
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const canManageMembers = userPermission === 'owner' || userPermission === 'admin';
  const activeMembers = members.filter(member => !member.leftAt) || [];
  const formerMembers = members.filter(member => member.leftAt) || [];

  return (
    <Card
      title={
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
            <UserOutlined style={{ marginRight: 8 }} /> Team Members
          </Title>
          <span style={{ fontSize: 14, color: '#888' }}>
            Your role: <b style={{ textTransform: 'capitalize' }}>{userPermission ? userPermission : 'Guest'}</b>
          </span>
        </div>
      }
      extra={
        canManageMembers && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowAddForm(true)}
          >
            Add Members
          </Button>
        )
      }
    >
      {showAddForm && (
        <AddMemberForm
          availableUsers={availableUsers}
          teamMembers={activeMembers}
          onAdd={onAddMembers}
          onCancel={() => setShowAddForm(false)}
          userPermission={userPermission}
        />
      )}

      <Space direction="vertical" style={{ width: '100%', marginTop: showAddForm ? 16 : 0 }}>
        <Card 
          type="inner" 
          title={
            <Space>
              Current Members
              <Badge count={activeMembers.length} />
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <MemberList
            members={activeMembers}
            currentUserRole={userPermission}
            onRemove={onRemoveMember}
            onUpdateRole={onUpdateRole}
            showActions={canManageMembers}
          />
        </Card>
        
        <Card 
          type="inner" 
          title={
            <Space>
              Former Members
              <Badge count={formerMembers.length} />
            </Space>
          }
        >
          <MemberList
            members={formerMembers}
            currentUserRole={userPermission}
            isFormerMembers={true}
            showActions={false}
          />
        </Card>
      </Space>
    </Card>
  );
};

export default TeamMembersTab;
