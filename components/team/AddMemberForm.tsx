import React, { useState } from 'react';
import { Card, Select, Button, Table, Tag, Space, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

interface AddMemberFormProps {
  availableUsers: any[];
  teamMembers: any[];
  onAdd: (members: { userId: string, role: string }[]) => void;
  onCancel: () => void;
  userRole: string | null;
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({
  availableUsers,
  teamMembers,
  onAdd,
  onCancel,
  userRole
}) => {
  const [selectedUsers, setSelectedUsers] = useState<{ userId: string, role: string }[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("guest");

  const handleUserSelect = (userId: string) => {
    if (!userId) return;
    
    // Check if this user is already in the selection
    if (selectedUsers.some(u => u.userId === userId)) {
      return;
    }
    
    setSelectedUsers([...selectedUsers, { userId, role: selectedRole }]);
  };

  const handleRemoveSelectedUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.userId !== userId));
  };

  const filteredUsers = availableUsers.filter(user => 
    !teamMembers.some(member => member.userId === user.id) && 
    !selectedUsers.some(selected => selected.userId === user.id)
  );

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_: any, record: { userId: string, role: string }) => {
        const user = availableUsers.find(u => u.id === record.userId);
        return user?.name || record.userId;
      },
    },
    {
      title: 'Role',
      key: 'role',
      dataIndex: 'role',
      render: (role: string, record: { userId: string, role: string }) => (
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
          {userRole === 'owner' && <Option value="owner">Owner</Option>}
          {(userRole === 'owner' || userRole === 'admin') && <Option value="admin">Admin</Option>}
          <Option value="maintainer">Maintainer</Option>
          <Option value="developer">Developer</Option>
          <Option value="guest">Guest</Option>
        </Select>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: { userId: string, role: string }) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveSelectedUser(record.userId)}
        />
      ),
    },
  ];

  return (
    <Card title="Add Team Members" size="small">
      <Space style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 200 }}
          placeholder="Select users to add"
          onChange={handleUserSelect}
          value={null}
          showSearch
          optionFilterProp="children"
        >
          {filteredUsers.map(user => (
            <Option key={user.id} value={user.id}>{user.name}</Option>
          ))}
        </Select>
        
        <Select
          value={selectedRole}
          style={{ width: 120 }}
          onChange={setSelectedRole}
        >
          {userRole === 'owner' && <Option value="owner">Owner</Option>}
          {(userRole === 'owner' || userRole === 'admin') && <Option value="admin">Admin</Option>}
          <Option value="maintainer">Maintainer</Option>
          <Option value="developer">Developer</Option>
          <Option value="guest">Guest</Option>
        </Select>
      </Space>

      {selectedUsers.length > 0 ? (
        <>
          <Table 
            columns={columns} 
            dataSource={selectedUsers} 
            rowKey="userId"
            pagination={false}
            size="small"
          />
          
          <Space style={{ marginTop: 16 }}>
            <Button onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => onAdd(selectedUsers)}
            >
              Add Selected Members
            </Button>
          </Space>
        </>
      ) : (
        <Empty description="Select users to add to the team" />
      )}
    </Card>
  );
};

export default AddMemberForm;
