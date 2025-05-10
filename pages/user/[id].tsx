import {
  ApiOutlined,
  ArrowLeftOutlined,
  LockOutlined,
  PlusOutlined,
  RobotOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Badge, Button, Card, Col, Form, Row, Skeleton, Space, Statistic, Tooltip, message } from 'antd';
import { useRouter } from 'next/router';
import React, { Suspense, lazy, useEffect, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import PasswordChangeForm from '../../components/profile/PasswordChangeForm';
import { IUser } from '../../models/IUser';
import { LLMProvider } from '../../models/llm';
import { createAgent } from '../../services/agentService';
import { checkAuthentication, redirectToLogin } from '../../services/authUtils';
import {
  createUserLLMProvider,
  deleteUserLLMProvider,
  fetchUserLLMProviders,
  updateUserLLMProvider,
} from '../../services/llmService';
import { createTeam } from '../../services/teamService';
import { fetchUserById, updateUser } from '../../services/userService';
import { useTheme } from '../../theme';

// Regular imports for immediately needed components
import DefaultModelsForm from '../../components/llm/DefaultModelsForm';
import UserProfileHeader from '../../components/user/UserProfileHeader';
import UserProfileTab from '../../components/user/UserProfileTab';

// Lazy load components that aren't needed immediately
const UserAgentsTab = lazy(() => import('../../components/user/UserAgentsTab'));
const UserLLMTab = lazy(() => import('../../components/user/UserLLMTab'));
const UserTeamsTab = lazy(() => import('../../components/user/UserTeamsTab'));
const AgentCreationModal = lazy(() => import('../../components/user/modals/AgentCreationModal'));
const LLMProviderModal = lazy(() => import('../../components/user/modals/LLMProviderModal'));
const TeamCreationModal = lazy(() => import('../../components/user/modals/TeamCreationModal'));

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
  const validateAuthentication = React.useCallback(async () => {
    if (!id) return;
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
    } catch (error: unknown) {
      console.error('Authentication error:', error);
      setAuthError('Authentication failed');
      redirectToLogin(window.location.pathname);
      return null;
    }
  }, [id]);

  const fetchUserDetail = React.useCallback(async () => {
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
    } catch (error: unknown) {
      message.error('Failed to fetch user details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [form, id]);

  // Fetch user's personal LLM providers
  const fetchUserProviders = React.useCallback(async () => {
    if (!id) return;

    setLLMProviderLoading(true);
    try {
      const data = await fetchUserLLMProviders(id as string);
      setLLMProviders(data || []);
    } catch (error: unknown) {
      console.error('Error fetching user LLM providers:', error);
      message.error('Failed to load LLM providers');
    } finally {
      setLLMProviderLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const initialize = async () => {
      const authData = await validateAuthentication();
      if (authData && id) {
        await fetchUserDetail();
        await fetchUserProviders();
      }
    };

    initialize();
  }, [id, fetchUserProviders, fetchUserDetail, validateAuthentication]);

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
    } catch (error: unknown) {
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
      } catch (error: unknown) {
        console.error('Error creating team:', error);
        message.error('Failed to create team');
      } finally {
        setCreatingTeam(false);
      }
    } catch (error: unknown) {
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
          flowConfig: JSON.stringify({ nodes: [], edges: [] }),
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
        <div className="dashboard-container" style={{ padding: '24px' }}>
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card>
                <Skeleton avatar paragraph={{ rows: 4 }} active />
              </Card>
            </Col>
            <Col span={24}>
              <Card>
                <Skeleton active paragraph={{ rows: 6 }} />
              </Card>
            </Col>
            <Col span={24}>
              <Card>
                <Skeleton active paragraph={{ rows: 4 }} />
              </Card>
            </Col>
          </Row>
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
    <MainLayout title={isCurrentUser ? 'My Profile' : `${user?.name}'s Profile`}>
      <div className="dashboard-container" style={{ padding: '24px' }}>
        {/* User Profile Header with accent color */}
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card className="profile-header-card accent-top accent-color-blue">
              <UserProfileHeader
                user={user as IUser}
                isCurrentUser={isCurrentUser}
                isEditing={isEditing}
                currentUserId={currentUserId}
                theme={theme}
                onEdit={handleEdit}
                onCancel={handleCancel}
                onSubmit={handleSubmit}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: '16px' }}>
          <Col xs={24} sm={8}>
            <Card className="dashboard-stat-card accent-left accent-color-purple" hoverable>
              <Statistic
                title={
                  <Space>
                    <TeamOutlined /> Teams
                  </Space>
                }
                value={user?.teamsWithRoles?.length || 0}
                valueStyle={{ color: '#722ed1', fontSize: '32px', fontWeight: 'bold' }}
              />
              {user?.teamsWithRoles && user?.teamsWithRoles?.length > 0 && (
                <div className="stat-footer">
                  <Tooltip title="Click to view teams">
                    <Button
                      type="link"
                      style={{ padding: 0 }}
                      onClick={() => document.getElementById('teams-section')?.scrollIntoView({ behavior: 'smooth' })}>
                      View details
                    </Button>
                  </Tooltip>
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="dashboard-stat-card accent-left accent-color-teal" hoverable>
              <Statistic
                title={
                  <Space>
                    <RobotOutlined /> Agents
                  </Space>
                }
                value={user?.ownedAgents?.length || 0}
                valueStyle={{ color: '#13c2c2', fontSize: '32px', fontWeight: 'bold' }}
              />
              {user?.ownedAgents && user.ownedAgents.length > 0 && (
                <div className="stat-footer">
                  <Tooltip title="Click to view agents">
                    <Button
                      type="link"
                      style={{ padding: 0 }}
                      onClick={() => document.getElementById('agents-section')?.scrollIntoView({ behavior: 'smooth' })}>
                      View details
                    </Button>
                  </Tooltip>
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="dashboard-stat-card accent-left accent-color-blue" hoverable>
              <Statistic
                title={
                  <Space>
                    <ApiOutlined /> LLM Providers
                  </Space>
                }
                value={llmProviders?.length || 0}
                valueStyle={{ color: '#1890ff', fontSize: '32px', fontWeight: 'bold' }}
              />
              {llmProviders?.length > 0 && (
                <div className="stat-footer">
                  <Tooltip title="Click to view LLM providers">
                    <Button
                      type="link"
                      style={{ padding: 0 }}
                      onClick={() => document.getElementById('llm-section')?.scrollIntoView({ behavior: 'smooth' })}>
                      View details
                    </Button>
                  </Tooltip>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
          <Col xs={24} lg={12}>
            <Card
              id="profile-section"
              className="dashboard-content-card accent-top accent-color-blue"
              title={
                <Space>
                  <UserOutlined /> Profile Information
                </Space>
              }
              style={{ marginBottom: '24px' }}
              hoverable>
              <UserProfileTab user={user as IUser} isEditing={isEditing} form={form} />
            </Card>

            {/* Security Section */}
            <Card
              className="dashboard-content-card accent-top accent-color-gold"
              title={
                <Space>
                  <LockOutlined /> Security Settings
                </Space>
              }
              hoverable>
              {id && <PasswordChangeForm userId={id as string} />}
            </Card>
          </Col>

          {/* Right Column - Teams & Agents */}
          <Col xs={24} lg={12}>
            {/* Teams Section */}
            <Card
              id="teams-section"
              className="dashboard-content-card accent-top accent-color-purple"
              title={
                <div className="card-title-with-count">
                  <Space>
                    <TeamOutlined /> Teams
                  </Space>
                  {user?.teamsWithRoles && user?.teamsWithRoles?.length > 0 && (
                    <Badge count={user?.teamsWithRoles?.length} style={{ backgroundColor: '#722ed1' }} />
                  )}
                </div>
              }
              extra={
                isCurrentUser && (
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsTeamModalVisible(true)} ghost>
                    Create Team
                  </Button>
                )
              }
              style={{ marginBottom: '24px' }}
              hoverable>
              <Suspense fallback={<Skeleton active />}>
                <UserTeamsTab
                  userId={id as string}
                  isCurrentUser={isCurrentUser}
                  teams={user?.teamsWithRoles || []}
                  onShowCreateTeam={() => setIsTeamModalVisible(true)}
                />
              </Suspense>
            </Card>

            {/* Agents Section */}
            <Card
              id="agents-section"
              className="dashboard-content-card accent-top accent-color-teal"
              title={
                <div className="card-title-with-count">
                  <Space>
                    <RobotOutlined /> Agents
                  </Space>
                  {user?.ownedAgents && user?.ownedAgents?.length > 0 && (
                    <Badge count={user?.ownedAgents?.length} style={{ backgroundColor: '#13c2c2' }} />
                  )}
                </div>
              }
              extra={
                isCurrentUser && (
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAgentModalVisible(true)} ghost>
                    Create Agent
                  </Button>
                )
              }
              style={{ marginBottom: '24px' }}
              hoverable>
              <Suspense fallback={<Skeleton active />}>
                <UserAgentsTab
                  isCurrentUser={isCurrentUser}
                  agents={user?.ownedAgents || []}
                  onShowCreateAgent={() => setIsAgentModalVisible(true)}
                />
              </Suspense>
            </Card>
            {isCurrentUser && (
              <Card
                id="default-models-section"
                className="dashboard-content-card accent-top accent-color-teal"
                title={
                  <Space>
                    <ApiOutlined /> Default LLM Models
                  </Space>
                }
                hoverable>
                <DefaultModelsForm userId={id as string} viewOnly={!isCurrentUser} onRefresh={fetchUserDetail} />
              </Card>
            )}
          </Col>

          {/* Full width for LLM Settings */}
          <Col span={24}>
            <Card
              id="llm-section"
              className="dashboard-content-card accent-top accent-color-blue"
              title={
                <div className="card-title-with-count">
                  <Space>
                    <ApiOutlined /> LLM Providers
                  </Space>
                  {llmProviders?.length > 0 && (
                    <Badge count={llmProviders?.length} style={{ backgroundColor: '#1890ff' }} />
                  )}
                </div>
              }
              extra={
                isCurrentUser && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsLLMProviderModalVisible(true)}
                    ghost>
                    Add Provider
                  </Button>
                )
              }
              hoverable>
              <Suspense fallback={<Skeleton active />}>
                <UserLLMTab
                  userId={id as string}
                  isCurrentUser={isCurrentUser}
                  llmProviders={llmProviders}
                  llmProviderLoading={llmProviderLoading}
                  onOpenEditModal={(provider) => {
                    setEditingLLMProvider(provider);
                    setIsEditLLMProviderModalVisible(true);
                  }}
                  onDeleteProvider={handleDeleteLLMProvider}
                  onRefreshProviders={fetchUserProviders}
                />
              </Suspense>
            </Card>
          </Col>
        </Row>

        {/* Suspense-wrapped modals for lazy loading */}
        <Suspense fallback={null}>
          {isTeamModalVisible && (
            <TeamCreationModal
              isVisible={isTeamModalVisible}
              isLoading={creatingTeam}
              form={teamForm}
              onCancel={() => setIsTeamModalVisible(false)}
              onSubmit={handleCreateTeam}
            />
          )}

          {isAgentModalVisible && (
            <AgentCreationModal
              isVisible={isAgentModalVisible}
              isLoading={creatingAgent}
              form={agentForm}
              onCancel={() => setIsAgentModalVisible(false)}
              onSubmit={handleCreateAgent}
            />
          )}

          {isLLMProviderModalVisible && (
            <LLMProviderModal
              isVisible={isLLMProviderModalVisible}
              editProvider={null}
              isLoading={llmActionLoading}
              userId={id as string}
              onCancel={() => setIsLLMProviderModalVisible(false)}
              onSubmit={handleAddLLMProvider}
            />
          )}

          {editingLLMProvider && isEditLLMProviderModalVisible && (
            <LLMProviderModal
              isVisible={isEditLLMProviderModalVisible}
              editProvider={editingLLMProvider}
              isLoading={llmActionLoading}
              userId={id as string}
              onCancel={() => setIsEditLLMProviderModalVisible(false)}
              onSubmit={handleEditLLMProvider}
            />
          )}
        </Suspense>
      </div>
    </MainLayout>
  );
}
