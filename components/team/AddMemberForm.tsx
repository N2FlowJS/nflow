import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Select, Space, Table } from 'antd';
import React, { useState } from 'react';

const { Option } = Select;

interface AddMemberFormProps {
  availableUsers: any[];
  teamMembers: any[];
  onAdd: (members: { userId: string, permission: string }[]) => void;
  onCancel: () => void;
  userPermission: string | null;
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({
  availableUsers,
  teamMembers,
  onAdd,
  onCancel,
  userPermission
}) => {
  const [selectedUsers, setSelectedUsers] = useState<{ userId: string, permission: string }[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("guest");

  const handleUserSelect = (userId: string) => {
    if (!userId) return;

    // Check if this user is already in the selection
    if (selectedUsers.some(u => u.userId === userId)) {
      return;
    }

    setSelectedUsers([...selectedUsers, { userId, permission: selectedRole }]);
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
      render: (_: any, record: { userId: string, permission: string }) => {
        const user = availableUsers.find(u => u.id === record.userId);
        return user?.name || record.userId;
      },
    },
    {
      title: 'Permission',
      key: 'permission',
      dataIndex: 'permission',
      render: (permission: string, record: { userId: string, permission: string }) => (
        <Select
          value={permission}
          style={{ width: 120 }}
          onChange={(permission) => {
            setSelectedUsers(
              selectedUsers.map(u =>
                u.userId === record.userId ? { ...u, permission: permission } : u
              )
            );
          }}
        >
          {userPermission === 'owner' && <Option value="owner">Owner</Option>}
          {(userPermission === 'owner' || userPermission === 'admin') && <Option value="admin">Admin</Option>}
          <Option value="maintainer">Maintainer</Option>
          <Option value="developer">Developer</Option>
          <Option value="guest">Guest</Option>
        </Select>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: { userId: string, permission: string }) => (
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
          {userPermission === 'owner' && <Option value="owner">Owner</Option>}
          {(userPermission === 'owner' || userPermission === 'admin') && <Option value="admin">Admin</Option>}
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
