import React, { useEffect, useState } from 'react';
import { Spin, Space, message, Breadcrumb, Tabs, Form, Alert, Skeleton, Button } from 'antd';
import { UserOutlined, LockOutlined, ApiOutlined, TeamOutlined, RobotOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useLocale } from '../../locale';
import { useTheme } from '../../theme';
import Link from 'next/link';
import MainLayout from '../../components/layout/MainLayout';
import { createTeam } from "../../services/teamService";
import { createAgent } from "../../services/agentService";
import { updateUser, fetchUserById } from "../../services/userService";
import { IUser } from '../../types/IUser';
import PasswordChangeForm from '../../components/profile/PasswordChangeForm';
import { checkAuthentication, redirectToLogin } from '../../services/authUtils';
import { fetchUserLLMProviders, createUserLLMProvider, deleteUserLLMProvider, updateUserLLMProvider } from '../../services/llmService';
import { LLMProvider } from '../../types/llm';

// Import our new components
import UserProfileHeader from '../../components/user/UserProfileHeader';
import UserProfileTab from '../../components/user/UserProfileTab';
import UserLLMTab from '../../components/user/UserLLMTab';
import UserTeamsTab from '../../components/user/UserTeamsTab';
import UserAgentsTab from '../../components/user/UserAgentsTab';
import TeamCreationModal from '../../components/user/modals/TeamCreationModal';
import AgentCreationModal from '../../components/user/modals/AgentCreationModal';
import LLMProviderModal from '../../components/user/modals/LLMProviderModal';

const { TabPane } = Tabs;

export default function UserDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<IUser>();
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [teamForm] = Form.useForm();
  const [agentForm] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isTeamModalVisible, setIsTeamModalVisible] = useState(false);
  const [isAgentModalVisible, setIsAgentModalVisible] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [creatingAgent, setCreatingAgent] = useState(false);
  const { locale, antdLocale } = useLocale();
  const { theme } = useTheme();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLLMProviderModalVisible, setIsLLMProviderModalVisible] = useState(false);
  const [isEditLLMProviderModalVisible, setIsEditLLMProviderModalVisible] = useState(false);
  const [editingLLMProvider, setEditingLLMProvider] = useState<LLMProvider | null>(null);
  const [llmProviders, setLLMProviders] = useState<LLMProvider[]>([]);
  const [llmProviderLoading, setLLMProviderLoading] = useState(false);
  const [llmActionLoading, setLLMActionLoading] = useState(false);

  // Check authentication
  const validateAuthentication = async () => {
    try {
      const authData = await checkAuthentication();

      if (!authData) {
        setAuthError('Authentication failed');
        redirectToLogin(window.location.pathname);
        return null;
      }

      setCurrentUserId(authData.userId);

      // Check if viewing own profile
      if (id && authData.userId === id) {
        setIsCurrentUser(true);
      }

      return authData;
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthError('Authentication failed');
      redirectToLogin(window.location.pathname);
      return null;
    }
  };

  const fetchUserDetail = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await fetchUserById(id as string);
      setUser(data);

      // Set form values
      form.setFieldsValue({
        name: data.name,
        description: data.description,
      });
    } catch (error) {
      message.error('Failed to fetch user details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's personal LLM providers
  const fetchUserProviders = async () => {
    if (!id) return;

    setLLMProviderLoading(true);
    try {
      const data = await fetchUserLLMProviders(id as string);
      setLLMProviders(data || []);
    } catch (error) {
      console.error('Error fetching user LLM providers:', error);
      message.error('Failed to load LLM providers');
    } finally {
      setLLMProviderLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const authData = await validateAuthentication();
      if (authData && id) {
        await fetchUserDetail();
        await fetchUserProviders();
      }
    };

    initialize();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.setFieldsValue({
      name: user?.name,
      description: user?.description,
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const updatedUser = await updateUser(id as string, values);

      if (updatedUser) {
        message.success('User updated successfully');
        fetchUserDetail();
        setIsEditing(false);
      } else {
        message.error('Failed to update user');
      }
    } catch (error) {
      console.error('Form validation error:', error);
      message.error('Failed to update user');
    }
  };

  const handleCreateTeam = async () => {
    try {
      const values = await teamForm.validateFields();
      setCreatingTeam(true);

      try {
        const newTeam = await createTeam(values);
        if (newTeam) {
          message.success('Team created successfully');
          setIsTeamModalVisible(false);
          teamForm.resetFields();
          fetchUserDetail();
        }
      } catch (error) {
        console.error('Error creating team:', error);
        message.error('Failed to create team');
      } finally {
        setCreatingTeam(false);
      }
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  const handleCreateAgent = async () => {
    try {
      const values = await agentForm.validateFields();
      setCreatingAgent(true);

      try {
        const agentData = {
          ...values,
          ownerType: 'user',
          userId: id as string,
          flowConfig: JSON.stringify({ nodes: [], edges: [] })
        };

        const newAgent = await createAgent(agentData);
        if (newAgent) {
          message.success('Agent created successfully');
          setIsAgentModalVisible(false);
          agentForm.resetFields();
          fetchUserDetail();
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
  };

  // Handle adding a new LLM provider
  const handleAddLLMProvider = async (values: any) => {
    try {
      setLLMActionLoading(true);
      await createUserLLMProvider(id as string, values);
      message.success('Provider added successfully');
      setIsLLMProviderModalVisible(false);
      fetchUserProviders();
    } catch (error) {
      console.error('Error adding provider:', error);
      message.error('Failed to add provider');
    } finally {
      setLLMActionLoading(false);
    }
  };

  // Handle editing an LLM provider
  const handleEditLLMProvider = async (values: any) => {
    if (!editingLLMProvider?.id) return;

    try {
      setLLMActionLoading(true);
      await updateUserLLMProvider(editingLLMProvider.id, values);
      message.success('Provider updated successfully');
      setIsEditLLMProviderModalVisible(false);
      fetchUserProviders();
    } catch (error) {
      console.error('Error updating provider:', error);
      message.error('Failed to update provider');
    } finally {
      setLLMActionLoading(false);
    }
  };

  // Handle deleting an LLM provider
  const handleDeleteLLMProvider = async (providerId: string) => {
    try {
      setLLMActionLoading(true);
      await deleteUserLLMProvider(providerId);
      message.success('Provider deleted successfully');
      fetchUserProviders();
    } catch (error) {
      console.error('Error deleting provider:', error);
      message.error('Failed to delete provider');
    } finally {
      setLLMActionLoading(false);
    }
  };

  if (authError) {
    return (
      <MainLayout title="Authentication Error">
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Alert
            message="Authentication Error"
            description={authError}
            type="error"
            showIcon
            style={{ maxWidth: 500, margin: '0 auto' }}
          />
          <p style={{ marginTop: 16 }}>Redirecting to login...</p>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout title="Loading User Profile">
        <div style={{ padding: '24px' }}>
          <Skeleton avatar paragraph={{ rows: 4 }} active />
          <div style={{ marginTop: 16 }}>
            <Skeleton active />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user && !loading) {
    return (
      <MainLayout title="User Not Found">
        <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
          <Alert
            message="User Not Found"
            description="The user you're looking for doesn't exist or you don't have permission to view it."
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Button type="primary" size="large" icon={<ArrowLeftOutlined />} onClick={() => router.push('/user')}>
            Back to User List
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={isCurrentUser ? "My Profile" : `${user?.name}'s Profile`}>
      <div style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Breadcrumb Navigation */}
          <Breadcrumb style={{ fontSize: '14px' }}>
            {isCurrentUser ? (
              <>
                <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                <Breadcrumb.Item>My Profile</Breadcrumb.Item>
              </>
            ) : (
              <>
                <Breadcrumb.Item>
                  <Link href="/user">Users</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{user?.name || 'User Profile'}</Breadcrumb.Item>
              </>
            )}
          </Breadcrumb>

          {/* User Profile Header */}
          <UserProfileHeader
            user={user as IUser}
            isCurrentUser={isCurrentUser}
            isEditing={isEditing}
            currentUserId={currentUserId}
            form={form}
            theme={theme}
            llmProviders={llmProviders}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />

          {/* Tabs Section */}
          <Tabs defaultActiveKey="profile" type="card" size="large">
            {/* Profile Tab */}
            <TabPane tab={<span><UserOutlined /> Profile</span>} key="profile">
              <UserProfileTab
                user={user as IUser}
                isCurrentUser={isCurrentUser}
                isEditing={isEditing}
                form={form}
                onEdit={handleEdit}
              />
            </TabPane>

            {/* Security Tab */}
            <TabPane tab={<span><LockOutlined /> Security</span>} key="security">
              {id && <PasswordChangeForm userId={id as string} />}
            </TabPane>

            {/* LLM Settings Tab */}
            <TabPane tab={<span><ApiOutlined /> LLM Settings</span>} key="llm">
              <UserLLMTab
                userId={id as string}
                isCurrentUser={isCurrentUser}
                currentUserId={currentUserId}
                llmProviders={llmProviders}
                llmProviderLoading={llmProviderLoading}
                onOpenAddModal={() => setIsLLMProviderModalVisible(true)}
                onOpenEditModal={(provider) => {
                  setEditingLLMProvider(provider);
                  setIsEditLLMProviderModalVisible(true);
                }}
                onDeleteProvider={handleDeleteLLMProvider}
                onRefreshProviders={fetchUserProviders}
              />
            </TabPane>

            {/* Teams Tab */}
            <TabPane tab={<span><TeamOutlined /> Teams</span>} key="teams">
              <UserTeamsTab
                userId={id as string}
                isCurrentUser={isCurrentUser}
                teams={user?.teamsWithRoles || []}
                onShowCreateTeam={() => setIsTeamModalVisible(true)}
              />
            </TabPane>

            {/* Agents Tab */}
            <TabPane tab={<span><RobotOutlined /> Agents</span>} key="agents">
              <UserAgentsTab
                userId={id as string}
                isCurrentUser={isCurrentUser}
                agents={user?.ownedAgents || []}
                onShowCreateAgent={() => setIsAgentModalVisible(true)}
              />
            </TabPane>
          </Tabs>

          {/* Modals */}
          <TeamCreationModal
            isVisible={isTeamModalVisible}
            isLoading={creatingTeam}
            form={teamForm}
            onCancel={() => setIsTeamModalVisible(false)}
            onSubmit={handleCreateTeam}
          />

          <AgentCreationModal
            isVisible={isAgentModalVisible}
            isLoading={creatingAgent}
            form={agentForm}
            onCancel={() => setIsAgentModalVisible(false)}
            onSubmit={handleCreateAgent}
          />

          <LLMProviderModal
            isVisible={isLLMProviderModalVisible}
            editProvider={null}
            isLoading={llmActionLoading}
            userId={id as string}
            onCancel={() => setIsLLMProviderModalVisible(false)}
            onSubmit={handleAddLLMProvider}
          />

          {editingLLMProvider && (
            <LLMProviderModal
              isVisible={isEditLLMProviderModalVisible}
              editProvider={editingLLMProvider}
              isLoading={llmActionLoading}
              userId={id as string}
              onCancel={() => setIsEditLLMProviderModalVisible(false)}
              onSubmit={handleEditLLMProvider}
            />
          )}
        </Space>
      </div>
    </MainLayout>
  );
}
