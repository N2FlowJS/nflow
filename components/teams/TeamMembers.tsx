import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Table, 
  Button, 
  Space,
  Tag,
  Tooltip,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
  Avatar
} from 'antd';
import { 
  UserAddOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined
} from '@ant-design/icons';
import { format } from 'date-fns';
import { addTeamMember, updateTeamMember, removeTeamMember } from '../../services/teamService';

const { Title, Text } = Typography;
const { Option } = Select;

interface TeamMembersProps {
  teamId: string;
  members: any[];
  currentUserRole: string | null;
  onMembersChange: (members: any[]) => void;
}

export default function TeamMembers({ 
  teamId, 
  members, 
  currentUserRole,
  onMembersChange
}: TeamMembersProps) {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Check if user has permission to manage members
  const canManageMembers = 
    currentUserRole === 'owner' || 
    currentUserRole === 'admin';

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'gold';
      case 'admin':
        return 'red';
      case 'maintainer':
        return 'green';
      case 'developer':
        return 'blue';
      case 'guest':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return dateString ? format(new Date(dateString), 'MMM dd, yyyy') : 'N/A';
  };

  const handleAddMember = async () => {
    try {
      const values = await addForm.validateFields();
      setLoading(true);
      
      await addTeamMember(teamId, {
        userId: values.userId,
        role: values.role
      });

      message.success('Team member added successfully');
      setIsAddModalVisible(false);
      addForm.resetFields();
      
      // Fetch updated members list
      const updatedMembers = [...members, {
        id: Date.now().toString(), // Temporary ID
        userId: values.userId,
        role: values.role,
        joinedAt: new Date().toISOString(),
        user: { id: values.userId, name: 'New Member' } // Placeholder
      }];
      
      onMembersChange(updatedMembers);
    } catch (error) {
      console.error('Error adding team member:', error);
      message.error('Failed to add team member');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = async () => {
    if (!selectedMember) return;
    
    try {
      const values = await editForm.validateFields();
      setLoading(true);
      
      await updateTeamMember(teamId, selectedMember.userId, {
        role: values.role
      });

      message.success('Member role updated successfully');
      setIsEditModalVisible(false);
      
      // Update local state
      const updatedMembers = members.map(member => 
        member.userId === selectedMember.userId
          ? { ...member, role: values.role }
          : member
      );
      
      onMembersChange(updatedMembers);
    } catch (error) {
      console.error('Error updating member role:', error);
      message.error('Failed to update member role');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      setLoading(true);
      await removeTeamMember(teamId, userId);
      
      message.success('Member removed from team');
      
      // Update local state
      const updatedMembers = members.filter(member => member.userId !== userId);
      onMembersChange(updatedMembers);
    } catch (error) {
      console.error('Error removing team member:', error);
      message.error('Failed to remove team member');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Member',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>
              <Text strong>{user?.name || 'Unknown User'}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {user?.email || 'No email'}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => {
        // Don't allow editing/removing the owner if you're not the owner
        const isOwner = record.role === 'owner';
        const canEdit = canManageMembers && (!isOwner || currentUserRole === 'owner');
        
        return (
          <Space>
            <Tooltip title="Edit Role">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                  setSelectedMember(record);
                  editForm.setFieldsValue({ role: record.role });
                  setIsEditModalVisible(true);
                }}
                disabled={!canEdit}
              />
            </Tooltip>
            <Tooltip title="Remove from Team">
              <Popconfirm
                title="Remove member from team?"
                description="Are you sure you want to remove this member from the team?"
                onConfirm={() => handleRemoveMember(record.userId)}
                okText="Yes"
                cancelText="No"
                disabled={!canEdit}
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={!canEdit}
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4}>
          <Space>
            <UserOutlined />
            Team Members ({members.length})
          </Space>
        </Title>
        {canManageMembers && (
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setIsAddModalVisible(true)}
          >
            Add Member
          </Button>
        )}
      </div>

      <Table
        dataSource={members}
        columns={columns}
        rowKey={record => record.id || record.userId}
        pagination={{ pageSize: 10 }}
      />

      {/* Add Member Modal */}
      <Modal
        title="Add Team Member"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsAddModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleAddMember}
            loading={loading}
          >
            Add Member
          </Button>
        ]}
      >
        <Form
          form={addForm}
          layout="vertical"
        >
          <Form.Item
            name="userId"
            label="Select User"
            rules={[{ required: true, message: 'Please select a user' }]}
          >
            <Select placeholder="Select user to add">
              {/* This would typically be populated from an API call */}
              <Option value="user1">User 1</Option>
              <Option value="user2">User 2</Option>
              <Option value="user3">User 3</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
            initialValue="guest"
          >
            <Select>
              {currentUserRole === 'owner' && (
                <Option value="owner">Owner</Option>
              )}
              {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                <Option value="admin">Admin</Option>
              )}
              <Option value="maintainer">Maintainer</Option>
              <Option value="developer">Developer</Option>
              <Option value="guest">Guest</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Member Role Modal */}
      <Modal
        title="Edit Member Role"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsEditModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleEditRole}
            loading={loading}
          >
            Update Role
          </Button>
        ]}
      >
        <Form
          form={editForm}
          layout="vertical"
        >
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select>
              {currentUserRole === 'owner' && (
                <Option value="owner">Owner</Option>
              )}
              {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                <Option value="admin">Admin</Option>
              )}
              <Option value="maintainer">Maintainer</Option>
              <Option value="developer">Developer</Option>
              <Option value="guest">Guest</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
