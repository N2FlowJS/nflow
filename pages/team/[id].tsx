import {
  ApiOutlined,
  RobotOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Alert, Button, Card, Col, Form, message, Row, Space, Spin, Statistic, Typography } from 'antd';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { checkAuthentication, redirectToLogin } from '../../services/authUtils';
import {
  addTeamMember,
  fetchAllUsers,
  fetchTeamById,
  fetchTeamMembers,
  removeTeamMember,
  Team,
  updateTeam,
  updateTeamMember,
} from '../../services/teamService';

// Import our new components
import AgentCreationModal from '../../components/team/modals/AgentCreationModal';
import TeamAgentsTab from '../../components/team/TeamAgentsTab';
import TeamDetailsTab from '../../components/team/TeamDetailsTab';
import TeamMembersTab from '../../components/team/TeamMembersTab';
import TeamProfileHeader from '../../components/team/TeamProfileHeader';
import TeamLLMProviders from '../../components/teams/TeamLLMProviders';
import { useLocale } from '../../locale/index'; // Import the useLocale hook
import { User } from '../../models/auth';
import { createAgent } from '../../services/agentService';
const { Title } = Typography;

export default function TeamDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [team, setTeam] = useState<Team>();
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
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
    } catch (error: unknown) {
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
        const currentUserMember = membersData.find((member: any) => member.userId === auth.userId);
        console.log(currentUserMember, 'Current user membership:', currentUserMember);

        setUserPermission(currentUserMember?.permission || null);
      }
    } catch {
      message.error('Failed to fetch team details');
    } finally {
      setLoading(false);
    }
  }, [id, form]);

  const fetchAvailableUsers = async () => {
    try {
      const users = await fetchAllUsers();
      setAvailableUsers(users);
    } catch {
      message.error('Failed to fetch users');
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      await updateTeam(id as string, values);
      message.success('Team updated successfully');
      fetchTeamDetail();
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.error('Error adding members:', error);
      message.error('An error occurred while adding members');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeTeamMember(id as string, userId);
      message.success('Member removed successfully');
      fetchTeamDetail();
    } catch (error: unknown) {
      console.error('Error removing member:', error);
      message.error('An error occurred while removing member');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: any) => {
    try {
      await updateTeamMember(id as string, userId, { permission: newRole });
      message.success('Role updated successfully');
      fetchTeamDetail();
    } catch (error: unknown) {
      console.error('Error updating role:', error);
      message.error('An error occurred while updating role');
    }
  };

  // Check if the current user has provider management permissions
  const canManageProviders =
    userPermission === 'owner' || userPermission === 'admin' || userData?.permission === 'owner';

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
          flowConfig: JSON.stringify({ nodes: [], edges: [] }),
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
    } catch (error: unknown) {
      console.error('Form validation error:', error);
    }
  }

  return (
    <MainLayout title={team?.name || t('teamProfile')}>
      <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
        {/* Team Profile Header - As a banner */}
        <Card
          style={{
            marginBottom: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          }}>
          <TeamProfileHeader teamName={team?.name || ''} />
        </Card>

        {/* Statistics Summary Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ borderRadius: '8px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
              <Statistic title={t('members')} value={members?.length || 0} prefix={<TeamOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ borderRadius: '8px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
              <Statistic title={t('agents')} value={team?.ownedAgents?.length || 0} prefix={<RobotOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ borderRadius: '8px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
              <Statistic title={t('yourRole')} value={userPermission || t('guest')} prefix={<UserOutlined />} />
            </Card>
          </Col>
        </Row>

        {/* Main Content Section */}
        <Row gutter={[16, 16]}>
          {/* Details Section - 1/3 width on desktop */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <SettingOutlined /> {t('details')}
                </Space>
              }
              style={{
                marginBottom: '16px',
                height: '100%',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              }}>
              <TeamDetailsTab team={team} form={form} onSubmit={handleSubmit} />
            </Card>
          </Col>

          {/* Members Section - 2/3 width on desktop */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <UserOutlined /> {t('members')} {team?.name}
                </Space>
              }
              style={{
                marginBottom: '16px',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              }}
              extra={
                (userPermission === 'owner' || userPermission === 'admin') && (
                  <Button type="primary" size="small">
                    {t('manageMembers')}
                  </Button>
                )
              }>
              <TeamMembersTab
                teamId={id as string}
                members={members}
                userPermission={userPermission}
                availableUsers={availableUsers}
                onAddMembers={handleAddMembers}
                onRemoveMember={handleRemoveMember}
                onUpdateRole={handleUpdateRole}
              />
            </Card>
          </Col>

          {/* Agents Section - Full width */}
          <Col xs={24}>
            <Card
              title={
                <Space>
                  <RobotOutlined /> {t('agents')}
                </Space>
              }
              style={{
                marginBottom: '16px',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              }}
              extra={
                <Button type="primary" icon={<RobotOutlined />} onClick={() => setIsAgentModalVisible(true)}>
                  {t('createNewAgent')}
                </Button>
              }>
              <TeamAgentsTab
                agents={(team?.ownedAgents || []).map((agent) => ({
                  ...agent,
                  createdAt: new Date(agent.createdAt).toLocaleDateString(),
                  updatedAt: new Date(agent.updatedAt).toLocaleDateString(),
                }))}
                userRole={userPermission}
                onCreateAgent={() => setIsAgentModalVisible(true)}
              />
            </Card>
          </Col>

          {/* LLM Providers Section - Full width */}
          <Col xs={24}>
            <Card
              title={
                <Space>
                  <ApiOutlined /> {t('llmProviders')}
                </Space>
              }
              style={{
                marginBottom: '16px',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              }}>
              <TeamLLMProviders
                teamId={id as string}
                userRole={userPermission || ''}
                canManageProviders={canManageProviders}
              />
            </Card>
          </Col>
        </Row>

        {/* Agent Creation Modal */}
        <AgentCreationModal
          isVisible={isAgentModalVisible}
          isLoading={creatingAgent}
          form={agentForm}
          onCancel={() => setIsAgentModalVisible(false)}
          onSubmit={handleCreateAgent}
        />
      </div>
    </MainLayout>
  );
}
