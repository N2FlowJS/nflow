import React from 'react';
import { Card, Tag, Button, Select, Space, Avatar, Tooltip, Popconfirm, Row, Col, Typography, Empty } from 'antd';
import { UserOutlined, DeleteOutlined, CrownOutlined, CalendarOutlined, LogoutOutlined } from '@ant-design/icons';
import { format } from 'date-fns';

const { Option } = Select;
const { Text, Title } = Typography;

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

  const getRoleBadge = (permission: string) => {
    if (permission === 'owner') {
      return <Tag color="gold" icon={<CrownOutlined />}>{permission?.toUpperCase()}</Tag>;
    }
    return <Tag color={getRoleColor(permission)}>{permission?.toUpperCase()}</Tag>;
  };

  if (members.length === 0) {
    return <Empty description={isFormerMembers ? 'No former members' : 'No team members yet'} />;
  }

  return (
    <Row gutter={[16, 16]}>
      {members.map(member => (
        <Col xs={24} sm={12} md={8} lg={8} xl={6} key={member.id || member.userId}>
          <Card 
            hoverable
            style={{ height: '100%' }}
            actions={showActions && !isFormerMembers && member.role !== 'owner' ? [
              <Tooltip title="Remove from team" key="remove">
                <Popconfirm
                  title="Remove this member?"
                  description="Are you sure you want to remove this member from the team?"
                  onConfirm={() => onRemove && onRemove(member.userId)}
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
            ] : []}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space align="center">
                <Avatar size={64} icon={<UserOutlined />} />
                <div>
                  <Title level={5} style={{ margin: 0 }}>
                    {member.user?.name || 'Unknown User'}
                  </Title>
                  <Text type="secondary">
                    {member.user?.email || 'No email'}
                  </Text>
                </div>
              </Space>
              
              <div style={{ marginTop: 16 }}>
                <Text strong>Permission: </Text>
                {showActions && !isFormerMembers && currentUserRole === 'owner' && member.permission !== 'owner' ? (
                  <Select 
                    value={member.permission} 
                    style={{ width: 120, marginLeft: 8 }}
                    onChange={(newRole) => onUpdateRole && onUpdateRole(member.userId, newRole)}
                  >
                    <Option value="admin">Admin</Option>
                    <Option value="maintainer">Maintainer</Option>
                    <Option value="developer">Developer</Option>
                    <Option value="guest">Guest</Option>
                  </Select>
                ) : getRoleBadge(member.permission)}
              </div>
              
              <Space direction="vertical" style={{ marginTop: 8 }}>
                <Text>
                  <CalendarOutlined /> Joined: {member.joinedAt ? format(new Date(member.joinedAt), 'MMM dd, yyyy') : 'N/A'}
                </Text>
                
                {isFormerMembers && (
                  <Text>
                    <LogoutOutlined /> Left: {member.leftAt ? format(new Date(member.leftAt), 'MMM dd, yyyy') : 'N/A'}
                  </Text>
                )}
              </Space>
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default MemberList;
