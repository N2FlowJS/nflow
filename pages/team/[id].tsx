import {
  ApiOutlined,
  RobotOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  Alert,
  Breadcrumb,
  Button,
  Form,
  message,
  Space,
  Spin,
  Tabs,
  Typography
} from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { checkAuthentication, redirectToLogin } from '@/services/authUtils';
import {
  addTeamMember,
  fetchAllUsers,
  fetchTeamById,
  fetchTeamMembers,
  removeTeamMember,
  Team,
  updateTeam,
  updateTeamMember
} from '@/services/teamService';

// Import our new components
import { User } from '@/prisma/client';
import AgentCreationModal from '../../components/team/modals/AgentCreationModal';
import TeamAgentsTab from '../../components/team/TeamAgentsTab';
import TeamDetailsTab from '../../components/team/TeamDetailsTab';
import TeamMembersTab from '../../components/team/TeamMembersTab';
import TeamProfileHeader from '../../components/team/TeamProfileHeader';
import TeamLLMProviders from '../../components/teams/TeamLLMProviders';
import { createAgent } from '@/services/agentService';
import { useLocale } from '@/locale/index'; // Import the useLocale hook
const { Title, } = Typography;

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
  const [userPermission, setUserPermission] = useState<any>();
  const [userData, setUserData] = useState<{
    authenticated: boolean;
    userId: string;
    email?: string;
    name?: string;
    permission?: string;
    roles?: string[];
  }>();
  const [authenticated, setAuthenticated] = useState<boolean>();
  const [members, setMembers] = useState<any[]>([]);
  const { t } = useLocale('teamDetail'); // Initialize the hook

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

  const fetchTeamDetail = React.useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await fetchTeamById(id as string);
      setTeam(data as any);

      // Set form values
      form.setFieldsValue({
        name: data.name,
        description: data.description,
      });

      // Get team members
      const membersData = await fetchTeamMembers(id as string);
      setMembers(membersData);

      // Find current user's permission in this team
      const auth = await checkAuthentication();
      if (auth) {
        setUserData(auth);
        const currentUserMember = membersData.find(
          (member: any) => member.userId === auth.userId
        );
        console.log(currentUserMember, "Current user membership:", currentUserMember);

        setUserPermission(currentUserMember?.permission || null);
      }
    } catch (error) {
      message.error('Failed to fetch team details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id, form]);

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
  }, [id, router, fetchTeamDetail]);

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
    permission: string;
  }

  const handleAddMembers = async (newMembers: NewMember[]): Promise<void> => {
    try {
      await addTeamMember(id as string, newMembers);

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
      await updateTeamMember(id as string, userId, { permission: newRole });
      message.success('Role updated successfully');
      fetchTeamDetail();
    } catch (error) {
      console.error('Error updating role:', error);
      message.error('An error occurred while updating role');
    }
  };

  // Check if the current user has provider management permissions
  const canManageProviders = userPermission === 'owner' || userPermission === 'admin' ||
    userData?.permission === 'owner';

  if (authenticated === null || loading) {
    return (
      <MainLayout title={t('loadingTeam')}>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" />
          <p>{t('loadingTeamData')}</p>
        </div>
      </MainLayout>
    );
  }

  if (authenticated === false) {
    return (
      <MainLayout title={t('authenticationRequired')}>
        <div style={{ padding: '24px' }}>
          <Alert
            message={t('authenticationRequired')}
            description={t('authenticationDescription')}
            type="warning"
            showIcon
          />
        </div>
      </MainLayout>
    );
  }

  if (!team && !loading) {
    return (
      <MainLayout title={t('teamNotFound')}>
        <div style={{ padding: '24px' }}>
          <Title level={4}>{t('teamNotFound')}</Title>
          <p>{t('teamNotFoundDescription')}</p>
          <Button type="primary" onClick={() => router.push('/team')}>
            {t('backToTeamList')}
          </Button>
        </div>
      </MainLayout>
    );
  }

  async function handleCreateAgent() {

    try {
      const values = await agentForm.validateFields();
      setCreatingAgent(true);

      try {
        const agentData = {
          ...values,
          ownerType: 'team',
          teamId: id as string,
          flowConfig: JSON.stringify({ nodes: [], edges: [] })
        };

        const newAgent = await createAgent(agentData);
        if (newAgent) {
          message.success('Agent created successfully');
          setIsAgentModalVisible(false);
          agentForm.resetFields();
          fetchTeamDetail();
        }
      } catch (error: any) {
        console.error('Error creating agent:', error);
        message.error(error.message || 'Failed to create agent');
      } finally {
        setCreatingAgent(false);
      }
    } catch (error) {
      console.error('Form validation error:', error);
    }
  }



  return (
    <MainLayout title={team?.name || t('teamProfile')}>
      <div style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/team">{t('teams')}</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{team?.name || t('detail')}</Breadcrumb.Item>
          </Breadcrumb>

          <TeamProfileHeader
            teamName={team?.name || ''}
            isEditing={isEditing}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            canEdit={userPermission === 'owner' || userPermission === 'admin'}
          />

          <Tabs activeKey={mainTab} onChange={setMainTab}>
            <TabPane
              tab={<span><SettingOutlined /> {t('details')}</span>}
              key="details"
            >
              <TeamDetailsTab
                team={team}
                isEditing={isEditing}
                form={form}
              />
            </TabPane>

            <TabPane
              tab={<span><UserOutlined /> {t('members')} {team?.name}</span>}
              key="members"
            >
              <TeamMembersTab
                teamId={id as string}
                members={members}
                userPermission={userPermission}
                availableUsers={availableUsers}
                onAddMembers={handleAddMembers}
                onRemoveMember={handleRemoveMember}
                onUpdateRole={handleUpdateRole}
              />
            </TabPane>

            <TabPane
              tab={<span><RobotOutlined /> {t('agents')}</span>}
              key="agents"
            >
              <div style={{ marginBottom: 16 }}>
                <Button
                  type="primary"
                  icon={<RobotOutlined />}
                  onClick={() => setIsAgentModalVisible(true)}
                >
                  {t('createNewAgent')}
                </Button>
              </div>
              <TeamAgentsTab
                teamId={id as string}
                agents={(team?.ownedAgents || []).map(agent => ({
                  ...agent,
                  createdAt: new Date(agent.createdAt).toLocaleDateString(),
                  updatedAt: new Date(agent.updatedAt).toLocaleDateString(),
                }))}
                userRole={userPermission}
                onCreateAgent={() => setIsAgentModalVisible(true)}
              />
            </TabPane>

            <TabPane
              tab={<span><ApiOutlined /> {t('llmProviders')}</span>}
              key="llm"
            >
              <TeamLLMProviders
                teamId={id as string}
                userRole={userPermission || ''}
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
