import React, { useEffect, useState } from 'react';
import { 
  Space, message, Breadcrumb, Tabs, Form, Alert, Spin, Button,
  Typography
} from 'antd';
import {
  UserOutlined, RobotOutlined, ApiOutlined, SettingOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import Link from 'next/link';
import MainLayout from '../../components/layout/MainLayout';
import {
  fetchTeamById,
  updateTeam,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  fetchTeamMembers,
  fetchAllUsers,
  Team
} from '../../services/teamService';
import { checkAuthentication, redirectToLogin } from '../../services/authUtils';

// Import our new components
import TeamProfileHeader from '../../components/team/TeamProfileHeader';
import TeamDetailsTab from '../../components/team/TeamDetailsTab';
import TeamMembersTab from '../../components/team/TeamMembersTab';
import TeamAgentsTab from '../../components/team/TeamAgentsTab';
import TeamLLMProviders from '../../components/teams/TeamLLMProviders';
import AgentCreationModal from '../../components/team/modals/AgentCreationModal';
const { Title, Text, Paragraph } = Typography;
import { User } from '@prisma/client';

const { TabPane } = Tabs;

export default function TeamDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [team, setTeam] = useState<Team>();
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [mainTab, setMainTab] = useState("details");
  const [agentForm] = Form.useForm();
  const [isAgentModalVisible, setIsAgentModalVisible] = useState(false);
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [userRole, setUserRole] = useState<any>();
  const [userData, setUserData] = useState<any>();
  const [authenticated, setAuthenticated] = useState<boolean>();
  const [members, setMembers] = useState<any[]>([]);

  // Check authentication
  const validateAuthentication = async () => {
    try {
      const authData = await checkAuthentication();
      
      if (!authData) {
        setAuthenticated(false);
        return null;
      }
      
      setAuthenticated(true);
      setUserData(authData);
      return authData;
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthenticated(false);
      return null;
    }
  };

  const fetchTeamDetail = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await fetchTeamById(id as string);
      setTeam(data as  any);
      
      // Set form values
      form.setFieldsValue({
        name: data.name,
        description: data.description,
      });

      // Get team members
      const membersData = await fetchTeamMembers(id as string);
      setMembers(membersData);
      
      // Find current user's role in this team
      const auth = await checkAuthentication();
      if (auth) {
        setUserData(auth);
        const currentUserMember = membersData.find(
          (member: any) => member.userId === auth.userId
        );
        setUserRole(currentUserMember?.role || null);
      }
    } catch (error) {
      message.error('Failed to fetch team details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const users = await fetchAllUsers();
      setAvailableUsers(users);
    } catch (error) {
      message.error('Failed to fetch users');
      console.error(error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const auth = await validateAuthentication();
      
      if (!auth) {
        // Redirect if not logged in
        redirectToLogin(router.asPath);
        return;
      }
      
      if (id && typeof id === 'string') {
        fetchTeamDetail();
        fetchAvailableUsers();
      }
    };
    
    initialize();
  }, [id, router]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (authenticated === false) {
      redirectToLogin(router.asPath);
    }
  }, [authenticated, router]);

  // Handle edit/save functions
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.setFieldsValue({
      name: team?.name,
      description: team?.description,
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      await updateTeam(id as string, values);
      message.success('Team updated successfully');
      fetchTeamDetail();
      setIsEditing(false);
    } catch (error) {
      console.error('Form validation error:', error);
      message.error('Failed to update team');
    }
  };

  // Handle member management functions
  interface NewMember {
    userId: string;
    role: string;
  }

  const handleAddMembers = async (newMembers: NewMember[]): Promise<void> => {
    try {
      for (const member of newMembers) {
        await addTeamMember(id as string, member);
      }
      
      message.success('Members added successfully');
      fetchTeamDetail();
    } catch (error) {
      console.error('Error adding members:', error);
      message.error('An error occurred while adding members');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeTeamMember(id as string, userId);
      message.success('Member removed successfully');
      fetchTeamDetail();
    } catch (error) {
      console.error('Error removing member:', error);
      message.error('An error occurred while removing member');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: any) => {
    try {
      await updateTeamMember(id as string, userId, { role: newRole });
      message.success('Role updated successfully');
      fetchTeamDetail();
    } catch (error) {
      console.error('Error updating role:', error);
      message.error('An error occurred while updating role');
    }
  };

  // Check if the current user has provider management permissions
  const canManageProviders = userRole === 'owner' || userRole === 'admin' || 
    userData?.permission === 'owner';

  if (authenticated === null || loading) {
    return (
      <MainLayout title="Loading Team">
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" />
          <p>Loading team data...</p>
        </div>
      </MainLayout>
    );
  }

  if (authenticated === false) {
    return (
      <MainLayout title="Authentication Required">
        <div style={{ padding: '24px' }}>
          <Alert
            message="Authentication Required"
            description="You need to be logged in to view this page. Redirecting to login..."
            type="warning"
            showIcon
          />
        </div>
      </MainLayout>
    );
  }

  if (!team && !loading) {
    return (
      <MainLayout title="Team Not Found">
        <div style={{ padding: '24px' }}>
          <Title level={4}>Team not found</Title>
          <p>The requested team does not exist or you don't have permission to view it.</p>
          <Button type="primary" onClick={() => router.push('/team')}>
            Back to Team List
          </Button>
        </div>
      </MainLayout>
    );
  }

  function handleCreateAgent(): void {
    throw new Error('Function not implemented.');
  }

  return (
    <MainLayout title={team?.name || "Team Profile"}>
      <div style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/team">Teams</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{team?.name || 'Detail'}</Breadcrumb.Item>
          </Breadcrumb>
          
          <TeamProfileHeader
            teamName={team?.name || ''}
            isEditing={isEditing}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            canEdit={userRole === 'owner' || userRole === 'admin'}
          />
          
          <Tabs activeKey={mainTab} onChange={setMainTab}>
            <TabPane 
              tab={<span><SettingOutlined /> Details</span>}
              key="details"
            >
              <TeamDetailsTab
                team={team}
                isEditing={isEditing}
                form={form}
              />
            </TabPane>
            
            <TabPane 
              tab={<span><UserOutlined /> Members</span>}
              key="members"
            >
              <TeamMembersTab
                teamId={id as string}
                members={members}
                userRole={userRole}
                availableUsers={availableUsers}
                onAddMembers={handleAddMembers}
                onRemoveMember={handleRemoveMember}
                onUpdateRole={handleUpdateRole}
              />
            </TabPane>
            
            <TabPane 
              tab={<span><RobotOutlined /> Agents</span>}
              key="agents"
            >
              <TeamAgentsTab
                teamId={id as string}
                agents={(team?.ownedAgents || []).map(agent => ({
                  ...agent,
                  createdAt: new Date(agent.createdAt).toLocaleDateString(),
                  updatedAt: new Date(agent.updatedAt).toLocaleDateString(),
                }))}
                userRole={userRole}
                onCreateAgent={() => setIsAgentModalVisible(true)}
              />
            </TabPane>
            
            <TabPane 
              tab={<span><ApiOutlined /> LLM Providers</span>}
              key="llm"
            >
              <TeamLLMProviders 
                teamId={id as string} 
                userRole={userRole || ''}
                canManageProviders={canManageProviders}
              />
            </TabPane>
          </Tabs>
          
          {/* Agent Creation Modal */}
          <AgentCreationModal
            isVisible={isAgentModalVisible}
            isLoading={creatingAgent}
            form={agentForm}
            onCancel={() => setIsAgentModalVisible(false)}
            onSubmit={handleCreateAgent}
          />
        </Space>
      </div>
    </MainLayout>
  );
}
