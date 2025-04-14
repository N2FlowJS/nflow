import React, { useEffect, useState } from 'react';
import { 
  Card, Form, Input, Button, Spin, 
  Typography, Space, message, Breadcrumb, Table, Select, Tag, Tabs, Badge, Modal, Switch, Alert
} from 'antd';
import { 
  ArrowLeftOutlined, SaveOutlined, UserOutlined, PlusOutlined, 
  DeleteOutlined, CrownOutlined, RobotOutlined, ApiOutlined, SettingOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useLocale } from '../../locale';
import { useTheme } from '../../theme';
import Link from 'next/link';
import MainLayout from '../../components/layout/MainLayout';
import { 
  fetchTeamById, 
  updateTeam, 
  addTeamMember, 
  updateTeamMember, 
  removeTeamMember, 
  fetchTeamMembers,
  fetchTeamLLMProviders,
  createTeamLLMProvider,
  deleteTeamLLMProvider
} from '../../services/teamService';
import { fetchAllUsers } from '../../services/userService';
import { createAgent } from '../../services/agentService';
import { checkAuthentication, redirectToLogin } from '../../services/authUtils';
import TeamLLMProviders from '../../components/teams/TeamLLMProviders';

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface User {
  id: string;
  name: string;
  description: string;
}

interface TeamMember {
  id: string;
  role: string;
  joinedAt: string;
  leftAt: string | null;
  userId: string;
  teamId: string;
  user: User;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  ownerType: string;
  createdAt: string;
  updatedAt: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy: User;
  users: User[];
  members: TeamMember[];
  ownedAgents?: Agent[];
}

export default function TeamDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<{userId: string, role: string}[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("guest");
  const [memberTab, setMemberTab] = useState<string>("current");
  const [mainTab, setMainTab] = useState<string>("details");
  const { locale, antdLocale } = useLocale();
  const { theme } = useTheme();
  const [agentForm] = Form.useForm();
  const [isAgentModalVisible, setIsAgentModalVisible] = useState(false);
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);

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

  const handleUserSelect = (userId: string) => {
    if (!userId) return;
    
    // Check if this user is already in the selection
    if (selectedUsers.some(u => u.userId === userId)) {
      message.info('This user is already selected');
      return;
    }
    
    setSelectedUsers([...selectedUsers, { userId, role: selectedRole }]);
  };

  const handleRemoveSelectedUser = (userId: string) => {
    setSelectedUsers(selectedUsers?.filter(u => u.userId !== userId));
  };

  const handleAddMembers = async () => {
    if (!selectedUsers.length) {
      message.info('Please select users to add');
      return;
    }

    try {
      for (const member of selectedUsers) {
        await addTeamMember(id as string, member);
      }
      
      message.success('Members added successfully');
      fetchTeamDetail();
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error adding members:', error);
      message.error('An error occurred');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeTeamMember(id as string, userId);
      message.success('Member removed successfully');
      fetchTeamDetail();
    } catch (error) {
      console.error('Error removing member:', error);
      message.error('An error occurred');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateTeamMember(id as string, userId, { role: newRole });
      message.success('Role updated successfully');
      fetchTeamDetail();
    } catch (error) {
      console.error('Error updating role:', error);
      message.error('An error occurred');
    }
  };

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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Tag color="gold" icon={<CrownOutlined />}>{role.toUpperCase()}</Tag>;
      case 'admin':
        return <Tag color="red">{role.toUpperCase()}</Tag>;
      case 'maintainer':
        return <Tag color="volcano">{role.toUpperCase()}</Tag>;
      case 'developer':
        return <Tag color="geekblue">{role.toUpperCase()}</Tag>;
      case 'guest':
        return <Tag color="green">{role.toUpperCase()}</Tag>;
      default:
        return <Tag>{role.toUpperCase()}</Tag>;
    }
  };

  const activeMembers = members?.filter(member => !member.leftAt) || [];
  const formerMembers = members?.filter(member => member.leftAt) || [];

  const currentMemberColumns = [
    {
      title: 'Name',
      dataIndex: ['user', 'name'],
      key: 'name',
      render: (text: string, record: TeamMember) => (
        <a onClick={() => router.push(`/user/${record.user.id}`)}>{text}</a>
      ),
    },
    {
      title: 'Role',
      key: 'role',
      dataIndex: 'role',
      render: (role: string, record: TeamMember) => (
        <>
          {role === 'owner' ? (
            getRoleBadge(role)
          ) : (
            <Select 
              value={role} 
              style={{ width: 120 }}
              onChange={(newRole) => handleRoleChange(record.userId, newRole)}
              disabled={role === 'owner'} // Cannot change owner role
            >
              <Option value="admin">Admin</Option>
              <Option value="maintainer">Maintainer</Option>
              <Option value="developer">Developer</Option>
              <Option value="guest">Guest</Option>
            </Select>
          )}
        </>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      render: (_: any, record: TeamMember) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveMember(record.userId)}
          disabled={record.role === 'owner'} // Cannot remove owner
        />
      ),
    },
  ];

  const formerMemberColumns = [
    {
      title: 'Name',
      dataIndex: ['user', 'name'],
      key: 'name',
      render: (text: string, record: TeamMember) => (
        <a onClick={() => router.push(`/user/${record.user.id}`)}>{text}</a>
      ),
    },
    {
      title: 'Role',
      key: 'role',
      dataIndex: 'role',
      render: (role: string) => getRoleBadge(role)
    },
    {
      title: 'Joined',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Left',
      dataIndex: 'leftAt',
      key: 'leftAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
  ];

  const selectedUserColumns = [
    {
      title: 'Name',
      key: 'name',
      render: (_: any, record: {userId: string, role: string}) => {
        const user = availableUsers.find(u => u.id === record.userId);
        return user?.name || record.userId;
      },
    },
    {
      title: 'Role',
      key: 'role',
      dataIndex: 'role',
      render: (role: string, record: {userId: string, role: string}) => (
        <Select 
          value={role} 
          style={{ width: 120 }}
          onChange={(newRole) => {
            setSelectedUsers(
              selectedUsers.map(u => 
                u.userId === record.userId ? { ...u, role: newRole } : u
              )
            );
          }}
        >
          <Option value="admin">Admin</Option>
          <Option value="maintainer">Maintainer</Option>
          <Option value="developer">Developer</Option>
          <Option value="guest">Guest</Option>
        </Select>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: {userId: string, role: string}) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveSelectedUser(record.userId)}
        />
      ),
    },
  ];

  const getTeamSummary = () => {
    if (!members || members.length === 0) return null;
    
    const ownerCount = members.filter(m => m.role === 'owner' && !m.leftAt).length;
    const adminCount = members.filter(m => m.role === 'admin' && !m.leftAt).length;
    const devCount = members.filter(m => m.role === 'developer' && !m.leftAt).length;
    const maintainerCount = members.filter(m => m.role === 'maintainer' && !m.leftAt).length;
    const guestCount = members.filter(m => m.role === 'guest' && !m.leftAt).length;
    
    return (
      <Space size="middle" wrap style={{ marginBottom: 16 }}>
        <Badge count={ownerCount}>
          <Tag color="gold" icon={<CrownOutlined />}>OWNER</Tag>
        </Badge>
        <Badge count={adminCount}>
          <Tag color="red">ADMIN</Tag>
        </Badge>
        <Badge count={maintainerCount}>
          <Tag color="volcano">MAINTAIN</Tag>
        </Badge>
        <Badge count={devCount}>
          <Tag color="geekblue">DEV</Tag>
        </Badge>
        <Badge count={guestCount}>
          <Tag color="green">GUEST</Tag>
        </Badge>
      </Space>
    );
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
      
      // Prepare payload with owner info
      const payload = {
        ...values,
        ownerType: 'team',
        teamId: id as string,
        flowConfig: JSON.stringify({ nodes: [], edges: [] })
      };
      
      const newAgent = await createAgent(payload);
      
      message.success('Agent created successfully');
      setIsAgentModalVisible(false);
      agentForm.resetFields();
      
      // Refresh team data to show the new agent
      fetchTeamDetail();
    } catch (error) {
      console.error('Form validation or submission error:', error);
      message.error('An error occurred while creating the agent');
    } finally {
      setCreatingAgent(false);
    }
  };

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
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2}>
              <Space>
                <TeamOutlined />
                {team?.name}
              </Space>
            </Title>
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
                  <Button 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => router.push('/team')}
                  >
                    Back to List
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={handleEdit}
                    disabled={userRole !== 'owner' && userRole !== 'admin'}
                  >
                    Edit
                  </Button>
                </>
              )}
            </Space>
          </div>
          
          <Tabs activeKey={mainTab} onChange={setMainTab}>
            <TabPane 
              tab={<span><SettingOutlined /> Details</span>}
              key="details"
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
                  {team?.createdBy && (
                    <Form.Item label="Created by">
                      <Input 
                        disabled
                        value={team.createdBy.name}
                        prefix={<UserOutlined />}
                      />
                    </Form.Item>
                  )}
                </Form>
              </Card>
            </TabPane>
            
            <TabPane 
              tab={<span><UserOutlined /> Members</span>}
              key="members"
            >
              <Card 
                tabList={[
                  { key: 'current', tab: (
                    <span>
                      Current Members
                      <Badge count={activeMembers.length} style={{ marginLeft: 8 }} />
                    </span>
                  )},
                  { key: 'former', tab: (
                    <span>
                      Former Members
                      <Badge count={formerMembers.length} style={{ marginLeft: 8 }} />
                    </span>
                  )}
                ]}
                activeTabKey={memberTab}
                onTabChange={setMemberTab}
                extra={
                  memberTab === 'current' && (userRole === 'owner' || userRole === 'admin') ? (
                    <Space>
                      <Select
                        style={{ width: 200 }}
                        placeholder="Select users to add"
                        onChange={handleUserSelect}
                        value={null}
                        showSearch
                        optionFilterProp="children"
                      >
                        {availableUsers
                          .filter(user => !activeMembers.some(member => member.userId === user.id) && 
                                  !selectedUsers.some(selected => selected.userId === user.id))
                          .map(user => (
                            <Option key={user.id} value={user.id}>{user.name}</Option>
                          ))
                        }
                      </Select>
                      <Select
                        value={selectedRole}
                        style={{ width: 120 }}
                        onChange={setSelectedRole}
                      >
                        <Option value="admin">Admin</Option>
                        <Option value="maintainer">Maintainer</Option>
                        <Option value="developer">Developer</Option>
                        <Option value="guest">Guest</Option>
                      </Select>
                    </Space>
                  ) : null
                }
              >
                {memberTab === 'current' ? (
                  <>
                    {getTeamSummary()}
                    
                    {selectedUsers.length > 0 && (
                      <Card style={{ marginBottom: 16 }} title="Users to add">
                        <Table 
                          columns={selectedUserColumns} 
                          dataSource={selectedUsers} 
                          rowKey="userId"
                          pagination={false}
                          footer={() => (
                            <Button 
                              type="primary" 
                              icon={<PlusOutlined />}
                              onClick={handleAddMembers}
                            >
                              Add Selected Members
                            </Button>
                          )}
                        />
                      </Card>
                    )}
                    <Table 
                      columns={currentMemberColumns} 
                      dataSource={activeMembers} 
                      rowKey="id"
                      pagination={false}
                      locale={{ emptyText: 'This team has no active members' }}
                    />
                  </>
                ) : (
                  <Table 
                    columns={formerMemberColumns} 
                    dataSource={formerMembers} 
                    rowKey="id"
                    pagination={false}
                    locale={{ emptyText: 'This team has no former members' }}
                  />
                )}
              </Card>
            </TabPane>
            
            <TabPane 
              tab={<span><RobotOutlined /> Agents</span>}
              key="agents"
            >
              <Card 
                extra={
                  (userRole === 'owner' || userRole === 'admin') ? (
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={showAgentModal}
                    >
                      Create Agent
                    </Button>
                  ) : null
                }
              >
                {team?.ownedAgents?.length === 0 && (
                  <div style={{ marginBottom: 16, fontStyle: 'italic', color: '#999' }}>
                    This team has not created any agents.
                  </div>
                )}
                
                <Table 
                  columns={agentColumns} 
                  dataSource={team?.ownedAgents || []} 
                  rowKey="id"
                  pagination={false}
                  locale={{ emptyText: 'This team has not created any agents' }}
                />
              </Card>
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
          <Modal
            title="Create New Team Agent"
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
        </Space>
      </div>
    </MainLayout>
  );
}
