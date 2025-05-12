import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space,
  Tag,
  Tooltip,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
  Avatar,
  List,
  Divider
} from 'antd';
import { 
  UserAddOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { format } from 'date-fns';
import { addTeamMember, updateTeamMember, removeTeamMember } from '../../services/teamService';

const { Title, Text } = Typography;
const { Option } = Select;

interface TeamMembersProps {
  teamId: string;
  members: any[];
  currentUserPermission: string | null;
  onMembersChange: (members: any[]) => void;
}

export default function TeamMembers({ 
  teamId, 
  members, 
  currentUserPermission,
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
    currentUserPermission === 'owner' || 
    currentUserPermission === 'admin';

  const getPermissionColor = (permission: string) => {
    switch (permission) {
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
      
      await addTeamMember(teamId, [{
        userId: values.userId,
        permission: values.permission
      }]);

      message.success('Team member added successfully');
      setIsAddModalVisible(false);
      addForm.resetFields();
      
      // Fetch updated members list
      const updatedMembers = [...members, {
        id: Date.now().toString(), // Temporary ID
        userId: values.userId,
        permission: values.permission,
        joinedAt: new Date().toISOString(),
        user: { id: values.userId, name: 'New Member' } // Placeholder
      }];
      
      onMembersChange(updatedMembers);
    } catch (error: unknown) {
      console.error('Error adding team member:', error);
      message.error('Failed to add team member');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPermission = async () => {
    if (!selectedMember) return;
    
    try {
      const values = await editForm.validateFields();
      setLoading(true);
      
      await updateTeamMember(teamId, selectedMember.userId, {
        permission: values.permission
      });

      message.success('Member permission updated successfully');
      setIsEditModalVisible(false);
      
      // Update local state
      const updatedMembers = members.map(member => 
        member.userId === selectedMember.userId
          ? { ...member, permission: values.permission }
          : member
      );
      
      onMembersChange(updatedMembers);
    } catch (error: unknown) {
      console.error('Error updating member permission:', error);
      message.error('Failed to update member permission');
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
    } catch (error: unknown) {
      console.error('Error removing team member:', error);
      message.error('Failed to remove team member');
    } finally {
      setLoading(false);
    }
  };

  const renderActions = (record: any) => {
    // Don't allow editing/removing the owner if you're not the owner
    const isOwner = record.permission === 'owner';
    const canEdit = canManageMembers && (!isOwner || currentUserPermission === 'owner');
    
    return [
      <Tooltip title="Edit permission" key="edit">
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => {
            setSelectedMember(record);
            editForm.setFieldsValue({ permission: record.permission });
            setIsEditModalVisible(true);
          }}
          disabled={!canEdit}
        />
      </Tooltip>,
      <Tooltip title="Remove from Team" key="delete">
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
    ];
  };

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

      <List
        dataSource={members}
        rowKey={record => record.id || record.userId}
        pagination={{ pageSize: 10 }}
        renderItem={(item) => (
          <List.Item
            key={item.id || item.userId}
            actions={renderActions(item)}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={
                <Space>
                  <Text strong>{item.user?.name || 'Unknown User'}</Text>
                  <Tag color={getPermissionColor(item.permission)}>
                    {item.permission.charAt(0).toUpperCase() + item.permission.slice(1)}
                  </Tag>
                </Space>
              }
              description={
                <Space>
                  <Text type="secondary">{item.user?.email || 'No email'}</Text>
                  <Divider type="vertical" />
                  <Space>
                    <CalendarOutlined />
                    <Text type="secondary">Joined: {formatDate(item.joinedAt)}</Text>
                  </Space>
                </Space>
              }
            />
          </List.Item>
        )}
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
            name="permission"
            label="Permission"
            rules={[{ required: true, message: 'Please select a permission' }]}
            initialValue="guest"
          >
            <Select>
              {currentUserPermission === 'owner' && (
                <Option value="owner">Owner</Option>
              )}
              {(currentUserPermission === 'owner' || currentUserPermission === 'admin') && (
                <Option value="admin">Admin</Option>
              )}
              <Option value="maintainer">Maintainer</Option>
              <Option value="developer">Developer</Option>
              <Option value="guest">Guest</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Member Permission Modal */}
      <Modal
        title="Edit Member Permission"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsEditModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleEditPermission}
            loading={loading}
          >
            Update Permission
          </Button>
        ]}
      >
        <Form
          form={editForm}
          layout="vertical"
        >
          <Form.Item
            name="permission"
            label="Permission"
            rules={[{ required: true, message: 'Please select a permission' }]}
          >
            <Select>
              {currentUserPermission === 'owner' && (
                <Option value="owner">Owner</Option>
              )}
              {(currentUserPermission === 'owner' || currentUserPermission === 'admin') && (
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
