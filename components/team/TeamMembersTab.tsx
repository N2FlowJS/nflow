import React, { useState } from 'react';
import { Card, Button, Typography, Tabs, Badge } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import MemberList from './MemberList';
import AddMemberForm from './AddMemberForm';

const { Title } = Typography;
const { TabPane } = Tabs;

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
  const [memberTab, setMemberTab] = useState<string>("current");
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

      <Tabs
        activeKey={memberTab}
        onChange={setMemberTab}
        style={{ marginTop: showAddForm ? 16 : 0 }}
      >
        <TabPane
          tab={
            <span>
              Current Members
              <Badge count={activeMembers.length} style={{ marginLeft: 8 }} />
            </span>
          }
          key="current"
        >
          <MemberList
            members={activeMembers}
            currentUserRole={userPermission}
            onRemove={onRemoveMember}
            onUpdateRole={onUpdateRole}
            showActions={canManageMembers}
          />
        </TabPane>
        <TabPane
          tab={
            <span>
              Former Members
              <Badge count={formerMembers.length} style={{ marginLeft: 8 }} />
            </span>
          }
          key="former"
        >
          <MemberList
            members={formerMembers}
            currentUserRole={userPermission}
            isFormerMembers={true}
            showActions={false}
          />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default TeamMembersTab;
