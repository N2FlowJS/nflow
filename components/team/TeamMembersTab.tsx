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
  userRole: string | null;
  availableUsers: any[];
  onAddMembers: (members: { userId: string, role: string }[]) => void;
  onRemoveMember: (userId: string) => void;
  onUpdateRole: (userId: string, role: string) => void;
}

const TeamMembersTab: React.FC<TeamMembersTabProps> = ({
  teamId,
  members,
  userRole,
  availableUsers,
  onAddMembers,
  onRemoveMember,
  onUpdateRole
}) => {
  const [memberTab, setMemberTab] = useState<string>("current");
  const [showAddForm, setShowAddForm] = useState(false);
  
  const canManageMembers = userRole === 'owner' || userRole === 'admin';
  const activeMembers = members.filter(member => !member.leftAt) || [];
  const formerMembers = members.filter(member => member.leftAt) || [];

  return (
    <Card
      title={<Title level={4}><UserOutlined /> Team Members</Title>}
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
          userRole={userRole}
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
            currentUserRole={userRole}
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
            currentUserRole={userRole}
            isFormerMembers={true}
            showActions={false}
          />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default TeamMembersTab;
