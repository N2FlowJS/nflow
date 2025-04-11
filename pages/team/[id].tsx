import React, { useEffect, useState } from 'react';
import { 
  Card, Form, Input, Button, Spin, 
  Typography, Space, message, Breadcrumb, Table, Select, Tag, Tabs, Badge, Modal, Switch
} from 'antd';
import { 
  ArrowLeftOutlined, SaveOutlined, UserOutlined, PlusOutlined, 
  DeleteOutlined, HistoryOutlined, CrownOutlined, RobotOutlined 
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useLocale } from '../../locale';
import { useTheme } from '../../theme';
import Link from 'next/link';
import MainLayout from '../../components/layout/MainLayout';

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
  ownedAgents?: Agent[]; // Add owned agents
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
  const [activeTab, setActiveTab] = useState<string>("current");
  const { locale, antdLocale } = useLocale();
  const { theme } = useTheme();
  const [agentForm] = Form.useForm();
  const [isAgentModalVisible, setIsAgentModalVisible] = useState(false);
  const [creatingAgent, setCreatingAgent] = useState(false);

  const fetchTeamDetail = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/team/${id}`);
      const data = await res.json();
      setTeam(data);
      
      // Set form values
      form.setFieldsValue({
        name: data.name,
        description: data.description,
      });
    } catch (error) {
      message.error('Failed to fetch team details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const res = await fetch('/api/user');
      const users = await res.json();
      setAvailableUsers(users);
    } catch (error) {
      message.error('Failed to fetch users');
      console.error(error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTeamDetail();
      fetchAvailableUsers();
    }
  }, [id]);

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
      
      const res = await fetch(`/api/team/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      if (res.ok) {
        message.success('Team updated successfully');
        fetchTeamDetail();
        setIsEditing(false);
      } else {
        message.error('Failed to update team');
      }
    } catch (error) {
      console.error('Form validation error:', error);
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
      const res = await fetch(`/api/team/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: selectedUsers }),
      });
      
      if (res.ok) {
        message.success('Members added successfully');
        fetchTeamDetail();
        setSelectedUsers([]);
      } else {
        message.error('Failed to add members');
      }
    } catch (error) {
      console.error('Error adding members:', error);
      message.error('An error occurred');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const res = await fetch(`/api/team/${id}/members/${userId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        message.success('Member removed successfully');
        fetchTeamDetail();
      } else {
        message.error('Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      message.error('An error occurred');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/team/${id}/members/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (res.ok) {
        message.success('Role updated successfully');
        fetchTeamDetail();
      } else {
        message.error('Failed to update role');
      }
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
    let color;
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

  const activeMembers = team?.members?.filter(member => !member.leftAt) || [];
  const formerMembers = team?.members?.filter(member => member.leftAt) || [];

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
    if (!team?.members) return null;
    
    const ownerCount = team.members.filter(m => m.role === 'owner' && !m.leftAt).length;
    const adminCount = team.members.filter(m => m.role === 'admin' && !m.leftAt).length;
    const devCount = team.members.filter(m => m.role === 'developer' && !m.leftAt).length;
    const maintainerCount = team.members.filter(m => m.role === 'maintainer' && !m.leftAt).length;
    const guestCount = team.members.filter(m => m.role === 'guest' && !m.leftAt).length;
    
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
      
      // Get auth token from localStorage or context
      const token = localStorage.getItem('token');
      
      // Prepare payload with owner info
      const payload = {
        ...values,
        ownerType: 'team',
        teamId: id,
        flowConfig: JSON.stringify({ nodes: [], edges: [] })
      };
      
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        const newAgent = await res.json();
        message.success('Agent created successfully');
        setIsAgentModalVisible(false);
        agentForm.resetFields();
        
        // Refresh team data to show the new agent
        fetchTeamDetail();
      } else {
        const errorData = await res.json();
        message.error(errorData.error || 'Failed to create agent');
      }
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

  if (loading) {
    return (
      <MainLayout title="Loading Team">
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!team && !loading) {
    return (
      <MainLayout title="Team Not Found">
        <div style={{ padding: '24px' }}>
          <Title level={4}>Team not found</Title>
          <Button type="primary" onClick={() => router.push('/team')}>
            Back to Team List
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Team Profile">
      <div style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/team">Teams</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{team?.name || 'Detail'}</Breadcrumb.Item>
          </Breadcrumb>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2}>Team Profile</Title>
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
                  >
                    Edit
                  </Button>
                </>
              )}
            </Space>
          </div>
          
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

          <Card 
            title={
              <Space>
                <UserOutlined />
                <span>Team Members</span>
              </Space>
            }
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
            activeTabKey={activeTab}
            onTabChange={setActiveTab}
            extra={
              activeTab === 'current' ? (
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
            {activeTab === 'current' ? (
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

          {/* New Agents Card */}
          <Card 
            title={
              <Space>
                <RobotOutlined />
                <span>Team Agents</span>
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
