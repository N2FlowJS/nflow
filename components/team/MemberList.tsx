import React from 'react';
import { Table, Tag, Button, Select, Space, Avatar, Tooltip, Popconfirm } from 'antd';
import { UserOutlined, DeleteOutlined, CrownOutlined } from '@ant-design/icons';
import { format } from 'date-fns';

const { Option } = Select;

interface MemberListProps {
  members: any[];
  currentUserRole: string | null;
  onRemove?: (userId: string) => void;
  onUpdateRole?: (userId: string, role: string) => void;
  showActions?: boolean;
  isFormerMembers?: boolean;
}

const MemberList: React.FC<MemberListProps> = ({
  members,
  currentUserRole,
  onRemove,
  onUpdateRole,
  showActions = true,
  isFormerMembers = false
}) => {
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
    if (role === 'owner') {
      return <Tag color="gold" icon={<CrownOutlined />}>{role.toUpperCase()}</Tag>;
    }
    return <Tag color={getRoleColor(role)}>{role.toUpperCase()}</Tag>;
  };

  const columns = [
    {
      title: 'Member',
      key: 'user',
      render: (record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>
              <strong>{record.user?.name || 'Unknown User'}</strong>
            </div>
            <div>
              <small style={{ color: '#999' }}>{record.user?.email || 'No email'}</small>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string, record: any) => (
        showActions && !isFormerMembers && currentUserRole === 'owner' && role !== 'owner' ? (
          <Select 
            value={role} 
            style={{ width: 120 }}
            onChange={(newRole) => onUpdateRole && onUpdateRole(record.userId, newRole)}
          >
            <Option value="admin">Admin</Option>
            <Option value="maintainer">Maintainer</Option>
            <Option value="developer">Developer</Option>
            <Option value="guest">Guest</Option>
          </Select>
        ) : getRoleBadge(role)
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (date: string) => date ? format(new Date(date), 'MMM dd, yyyy') : 'N/A',
    },
    ...(isFormerMembers ? [
      {
        title: 'Left',
        dataIndex: 'leftAt',
        key: 'leftAt',
        render: (date: string) => date ? format(new Date(date), 'MMM dd, yyyy') : 'N/A',
      }
    ] : []),
    ...(showActions && !isFormerMembers ? [
      {
        title: 'Actions',
        key: 'actions',
        render: (record: any) => {
          // Don't allow removing owner (unless current user is also owner)
          const canRemove = record.role !== 'owner' || currentUserRole === 'owner';
          
          return canRemove ? (
            <Tooltip title="Remove from team">
              <Popconfirm
                title="Remove this member?"
                description="Are you sure you want to remove this member from the team?"
                onConfirm={() => onRemove && onRemove(record.userId)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </Tooltip>
          ) : null;
        },
      }
    ] : []),
  ];

  return (
    <Table
      dataSource={members}
      columns={columns}
      rowKey={record => record.id || record.userId}
      pagination={{ pageSize: 10 }}
      locale={{ emptyText: isFormerMembers ? 'No former members' : 'No team members yet' }}
    />
  );
};

export default MemberList;
