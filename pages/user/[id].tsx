import React, { useEffect, useState } from 'react';
import {
  Card, Form, Input, Button, Spin,
  Typography, Space, message, Breadcrumb, Tabs, Table, Modal, Tag, Select, Switch, Popconfirm
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, TeamOutlined, PlusOutlined,
  RobotOutlined, CrownOutlined, UserOutlined, LockOutlined,
  ApiOutlined, SettingOutlined, CheckCircleOutlined, StopOutlined, EditOutlined, DeleteOutlined, ExperimentOutlined
} from '@ant-design/icons';
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
import LLMProviderPreferences from '../../components/profile/LLMProviderPreferences';
import { checkAuthentication, redirectToLogin } from '../../services/authUtils';
import LLMProviderForm from '../../components/llm/LLMProviderForm';
import { fetchUserLLMProviders, createUserLLMProvider, deleteUserLLMProvider, updateUserLLMProvider } from '../../services/llmService';
import { LLMProvider } from '../../types/llm';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Team {
  id: string;
  name: string;
  description: string;
  role?: string; // Add role property to interface
}

// Add Agent interface
interface Agent {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  ownerType: string;
  createdAt: string;
  updatedAt: string;
}

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
  const [llmProviderForm] = Form.useForm();

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
      // Use userService instead of direct fetch call
      const data = await fetchUserById(id as string);

      // Check if teamsWithRoles exists in the data
      if (!data.teamsWithRoles) {
        console.warn('teamsWithRoles not found in API response', data);
      }

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
        await fetchUserProviders(); // Add this line to fetch providers
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

      try {
        // Use userService instead of direct fetch call
        const updatedUser = await updateUser(id as string, values);

        if (updatedUser) {
          message.success('User updated successfully');
          fetchUserDetail();
          setIsEditing(false);
        } else {
          message.error('Failed to update user');
        }
      } catch (error) {
        console.error('Error updating user:', error);
        message.error('Failed to update user');
      }
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  const showTeamModal = () => {
    teamForm.resetFields();
    setIsTeamModalVisible(true);
  };

  const handleTeamModalCancel = () => {
    setIsTeamModalVisible(false);
    teamForm.resetFields();
  };

  const handleCreateTeam = async () => {
    try {
      const values = await teamForm.validateFields();
      setCreatingTeam(true);

      try {
        // Use the teamService instead of direct fetch call
        const newTeam = await createTeam(values);

        if (newTeam) {
          message.success('Team created successfully');
          setIsTeamModalVisible(false);
          teamForm.resetFields();

          // Refresh user data to show the new team
          fetchUserDetail();
        } else {
          message.error('Failed to create team');
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

  // Agent-related functions
  const showAgentModal = () => {
    agentForm.resetFields();
    setIsAgentModalVisible(true);
  };

  const handleAgentModalCancel = () => {
    setIsAgentModalVisible(false);
    agentForm.resetFields();
  };

  const handleCreateAgent = async () => {
    try {
      const values = await agentForm.validateFields();
      setCreatingAgent(true);

      try {
        // Prepare payload with owner info
        const agentData = {
          ...values,
          ownerType: 'user',
          userId: id as string,
          flowConfig: JSON.stringify({ nodes: [], edges: [] })
        };

        // Use service function instead of direct fetch
        const newAgent = await createAgent(agentData);

        if (newAgent) {
          message.success('Agent created successfully');
          setIsAgentModalVisible(false);
          agentForm.resetFields();

          // Refresh user data to show the new agent
          fetchUserDetail();
        } else {
          message.error('Failed to create agent');
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'gold';
      case 'admin':
        return 'red';
      case 'maintainer':
        return 'volcano';
      case 'developer':
        return 'geekblue';
      case 'guest':
        return 'green';
      default:
        return 'default';
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'owner') {
      return <Tag color="gold" icon={<CrownOutlined />}>{role.toUpperCase()}</Tag>;
    }

    // Use the getRoleColor function to maintain consistency
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

  const agentColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Agent) => (
        <Link href={`/agent/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Agent) => (
        <Button
          type="primary"
          size="small"
          onClick={() => router.push(`/agent/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  // Handle adding a new LLM provider
  const handleAddLLMProvider = async (values: any) => {
    try {
      setLLMActionLoading(true);
      await createUserLLMProvider(id as string, values);
      message.success('Provider added successfully');
      setIsLLMProviderModalVisible(false);
      fetchUserProviders(); // Refresh data
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
      fetchUserProviders(); // Refresh data
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
      fetchUserProviders(); // Refresh data
    } catch (error) {
      console.error('Error deleting provider:', error);
      message.error('Failed to delete provider');
    } finally {
      setLLMActionLoading(false);
    }
  };

  // Get provider type tag for display
  const getProviderTypeTag = (type: string) => {
    let color = '';
    let icon = null;
    let label = type;

    switch (type) {
      case 'openai':
        color = 'green';
        icon = <ApiOutlined />;
        label = 'OpenAI';
        break;
      case 'openai-compatible':
        color = 'cyan';
        icon = <ApiOutlined />;
        label = 'OpenAI Compatible';
        break;
      case 'azure':
        color = 'blue';
        icon = <ApiOutlined />;
        label = 'Azure';
        break;
      case 'anthropic':
        color = 'purple';
        icon = <ApiOutlined />;
        label = 'Anthropic';
        break;
      case 'local':
        color = 'orange';
        icon = <ExperimentOutlined />;
        label = 'Local';
        break;
      case 'custom':
        color = 'geekblue';
        icon = <ExperimentOutlined />;
        label = 'Custom';
        break;
      default:
        color = 'default';
        break;
    }

    return <Tag color={color} icon={icon}>{label}</Tag>;
  };

  // Define columns for the providers table
  const llmProviderColumns = [
    {
      title: 'Provider Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'providerType',
      key: 'providerType',
      render: (type: string) => getProviderTypeTag(type),
    },
    {
      title: 'Models',
      dataIndex: 'models',
      key: 'models',
      render: (models: any[]) => (
        <span>{models?.length || 0} models</span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'} icon={isActive ? <CheckCircleOutlined /> : <StopOutlined />}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: LLMProvider) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="text"
            onClick={() => {
              setEditingLLMProvider(record);
              setIsEditLLMProviderModalVisible(true);
            }}
          />
          <Popconfirm
            title="Delete this provider?"
            description="This will delete the provider and all associated models. This action cannot be undone."
            onConfirm={() => handleDeleteLLMProvider(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (authError) {
    return (
      <MainLayout title="Authentication Error">
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Title level={4}>{authError}</Title>
          <p>Redirecting to login...</p>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout title="Loading User">
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!user && !loading) {
    return (
      <MainLayout title="User Not Found">
        <div style={{ padding: '24px' }}>
          <Title level={4}>User not found</Title>
          <Button type="primary" onClick={() => router.push('/user')}>
            Back to User List
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={isCurrentUser ? "My Profile" : "User Profile"}>
      <div style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Breadcrumb>
            {isCurrentUser ? (
              <Breadcrumb.Item>My Profile</Breadcrumb.Item>
            ) : (
              <>
                <Breadcrumb.Item>
                  <Link href="/user">Users</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{user?.name || 'Detail'}</Breadcrumb.Item>
              </>
            )}
          </Breadcrumb>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2}>{isCurrentUser ? "My Profile" : "User Profile"}</Title>
            <Space>
              {isEditing ? (
                <>
                  <Button onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSubmit}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <>
                  {!isCurrentUser && (
                    <Button
                      icon={<ArrowLeftOutlined />}
                      onClick={() => router.push('/user')}
                    >
                      Back to List
                    </Button>
                  )}
                  <Button
                    type="primary"
                    onClick={handleEdit}
                  >
                    Edit
                  </Button>
                </>
              )}
            </Space>
          </div>

          {isCurrentUser ? (
            <Tabs defaultActiveKey="profile" type="card">
              <TabPane
                tab={<span><UserOutlined /> Profile</span>}
                key="profile"
              >
                <Card>
                  <Form
                    form={form}
                    layout="vertical"
                    disabled={!isEditing}
                  >
                    <Form.Item
                      name="name"
                      label="Name"
                      rules={[{ required: true, message: 'Please enter a name' }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="description"
                      label="Description"
                      rules={[{ required: true, message: 'Please enter a description' }]}
                    >
                      <Input.TextArea rows={4} />
                    </Form.Item>
                  </Form>
                </Card>
              </TabPane>

              <TabPane
                tab={<span><LockOutlined /> Security</span>}
                key="security"
              >
                {id && <PasswordChangeForm userId={id as string} />}
              </TabPane>

              <TabPane
                tab={<span><ApiOutlined /> LLM Settings</span>}
                key="llm"
              >
                {id && <LLMProviderPreferences userId={id as string} viewOnly={!isCurrentUser && currentUserId !== id} />}

                {/* Add Personal LLM Providers section */}
                <Card
                  title={<Title level={4}>Personal LLM Providers</Title>}
                  extra={
                    isCurrentUser && (
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsLLMProviderModalVisible(true)}
                      >
                        Add Provider
                      </Button>
                    )
                  }
                  style={{ marginTop: 24 }}
                >
                  <Text style={{ marginBottom: 16, display: 'block' }}>
                    These LLM providers are private to your account and can be used for your personal agents and workflows.
                  </Text>

                  <Table
                    dataSource={llmProviders}
                    columns={isCurrentUser ? llmProviderColumns : llmProviderColumns.filter(col => col.key !== 'actions')}
                    rowKey="id"
                    loading={llmProviderLoading}
                    pagination={false}
                    locale={{ emptyText: 'No personal LLM providers configured' }}
                  />
                </Card>
              </TabPane>

              <TabPane
                tab={<span><TeamOutlined /> Teams</span>}
                key="teams"
              >
                <Card
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={showTeamModal}
                    >
                      Create Team
                    </Button>
                  }
                >
                  {user?.teamsWithRoles?.length === 0 && (
                    <div style={{ marginBottom: 16, fontStyle: 'italic', color: '#999' }}>
                      You are not a member of any team.
                    </div>
                  )}

                  <Table
                    columns={teamColumns}
                    dataSource={user?.teamsWithRoles || []}
                    rowKey="id"
                    pagination={false}
                    locale={{ emptyText: 'You are not a member of any team' }}
                  />
                </Card>
              </TabPane>

              <TabPane
                tab={<span><RobotOutlined /> Agents</span>}
                key="agents"
              >
                <Card
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={showAgentModal}
                    >
                      Create Agent
                    </Button>
                  }
                >
                  {user?.ownedAgents?.length === 0 && (
                    <div style={{ marginBottom: 16, fontStyle: 'italic', color: '#999' }}>
                      You have not created any agents.
                    </div>
                  )}

                  <Table
                    columns={agentColumns}
                    dataSource={user?.ownedAgents || []}
                    rowKey="id"
                    pagination={false}
                    locale={{ emptyText: 'You have not created any agents' }}
                  />
                </Card>
              </TabPane>
            </Tabs>
          ) : (
            <>
              <Card>
                <Form
                  form={form}
                  layout="vertical"
                  disabled={!isEditing}
                >
                  <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Please enter a name' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: 'Please enter a description' }]}
                  >
                    <Input.TextArea rows={4} />
                  </Form.Item>
                </Form>
              </Card>

              <Card
                title={
                  <Space>
                    <TeamOutlined />
                    <span>Teams</span>
                  </Space>
                }
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showTeamModal}
                  >
                    Create Team
                  </Button>
                }
              >
                {user?.teamsWithRoles?.length === 0 && (
                  <div style={{ marginBottom: 16, fontStyle: 'italic', color: '#999' }}>
                    This user is not a member of any team.
                  </div>
                )}

                <Table
                  columns={teamColumns}
                  dataSource={user?.teamsWithRoles || []}
                  rowKey="id"
                  pagination={false}
                  locale={{ emptyText: 'This user is not a member of any team' }}
                />
              </Card>

              {/* New Agents Card */}
              <Card
                title={
                  <Space>
                    <RobotOutlined />
                    <span>Agents</span>
                  </Space>
                }
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showAgentModal}
                  >
                    Create Agent
                  </Button>
                }
              >
                {user?.ownedAgents?.length === 0 && (
                  <div style={{ marginBottom: 16, fontStyle: 'italic', color: '#999' }}>
                    This user has not created any agents.
                  </div>
                )}

                <Table
                  columns={agentColumns}
                  dataSource={user?.ownedAgents || []}
                  rowKey="id"
                  pagination={false}
                  locale={{ emptyText: 'This user has not created any agents' }}
                />
              </Card>
            </>
          )}

          {/* Team Creation Modal */}
          <Modal
            title="Create New Team"
            open={isTeamModalVisible}
            onCancel={handleTeamModalCancel}
            footer={[
              <Button key="cancel" onClick={handleTeamModalCancel}>
                Cancel
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={creatingTeam}
                onClick={handleCreateTeam}
              >
                Create
              </Button>,
            ]}
          >
            <Form
              form={teamForm}
              layout="vertical"
            >
              <Form.Item
                name="name"
                label="Team Name"
                rules={[{ required: true, message: 'Please enter a team name' }]}
              >
                <Input placeholder="Enter team name" />
              </Form.Item>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please enter a team description' }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Describe the purpose of this team"
                />
              </Form.Item>
            </Form>
          </Modal>

          {/* Agent Creation Modal */}
          <Modal
            title="Create New Agent"
            open={isAgentModalVisible}
            onCancel={handleAgentModalCancel}
            footer={[
              <Button key="cancel" onClick={handleAgentModalCancel}>
                Cancel
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={creatingAgent}
                onClick={handleCreateAgent}
              >
                Create
              </Button>,
            ]}
          >
            <Form
              form={agentForm}
              layout="vertical"
            >
              <Form.Item
                name="name"
                label="Agent Name"
                rules={[{ required: true, message: 'Please enter an agent name' }]}
              >
                <Input placeholder="Enter agent name" />
              </Form.Item>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please enter an agent description' }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Describe what this agent does"
                />
              </Form.Item>
              <Form.Item
                name="isActive"
                label="Active"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Form>
          </Modal>

          {/* Add LLM Provider Modal */}
          <Modal
            title="Add Personal LLM Provider"
            open={isLLMProviderModalVisible}
            onCancel={() => setIsLLMProviderModalVisible(false)}
            footer={null}
            width={700}
          >
            <LLMProviderForm
              onSubmit={handleAddLLMProvider}
              isLoading={llmActionLoading}
              userContext={id as string}
            />
          </Modal>

          {/* Edit LLM Provider Modal */}
          {editingLLMProvider && (
            <Modal
              title="Edit Personal LLM Provider"
              open={isEditLLMProviderModalVisible}
              onCancel={() => setIsEditLLMProviderModalVisible(false)}
              footer={null}
              width={700}
            >
              <LLMProviderForm
                initialValues={editingLLMProvider}
                onSubmit={handleEditLLMProvider}
                isLoading={llmActionLoading}
                userContext={id as string}
              />
            </Modal>
          )}
        </Space>
      </div>
    </MainLayout>
  );
}
