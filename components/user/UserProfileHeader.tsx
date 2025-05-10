import { ArrowLeftOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { Avatar, Button, Col, Form, Input, Row, Tag, Typography } from 'antd';
import { useRouter } from 'next/router';
import React from 'react';
import { IUser } from '../../models/IUser';

const { Title, Paragraph, Text } = Typography;

interface UserProfileHeaderProps {
  user: IUser;
  isCurrentUser: boolean;
  isEditing: boolean;
  currentUserId: string | null;
  theme: string;
  onEdit: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ user, isCurrentUser, isEditing, currentUserId, theme, onEdit, onCancel, onSubmit }) => {
  const router = useRouter();

  const getPermissionColor = (permission?: string) => {
    switch (permission) {
      case 'owner':
        return 'gold';
      case 'maintainer':
        return 'green';
      case 'developer':
        return 'blue';
      default:
        return 'default';
    }
  };

  return (
    <Row gutter={[24, 16]} align="middle">
      {/* User Avatar Column */}
      <Col xs={24} sm={6} md={4} style={{ textAlign: 'center' }}>
        <div className="avatar-wrapper">
          <Avatar
            size={100}
            // src={user?.avatarUrl}
            style={{
              backgroundColor: theme === 'dark' ? '#1668dc' : '#1890ff',
              boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
              fontSize: '42px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
        </div>
      </Col>

      {/* User Details Column */}
      <Col xs={24} sm={18} md={20}>
        <div className="profile-header-content">
          {/* User Name and Email */}
          <div style={{ marginBottom: isEditing ? 0 : '16px' }}>
            {isEditing ? (
              <Form.Item name="name" style={{ marginBottom: 0 }} rules={[{ required: true, message: 'Please enter a name' }]}>
                <Input placeholder="Enter name" size="large" />
              </Form.Item>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <Title level={2} style={{ margin: 0 }}>
                  {user?.name}
                </Title>
                <Tag color={getPermissionColor(user?.permission)}>{user?.permission?.toUpperCase()}</Tag>
              </div>
            )}
            <Text type="secondary">{user?.email}</Text>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '16px', marginTop: isEditing ? '16px' : 0 }}>
            {isEditing ? (
              <Form.Item name="description" rules={[{ required: true, message: 'Please enter a description' }]} style={{ marginBottom: 0 }}>
                <Input.TextArea rows={2} placeholder="Enter a brief description" />
              </Form.Item>
            ) : (
              <Paragraph style={{ fontSize: '16px', marginBottom: 0 }}>{user?.description || 'No description provided.'}</Paragraph>
            )}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            {!isEditing ? (
              <>
                {(isCurrentUser || (!isCurrentUser && currentUserId !== user?.id)) && (
                  <Button type="primary" icon={<EditOutlined />} onClick={onEdit}>
                    Edit Profile
                  </Button>
                )}
                {!isCurrentUser && (
                  <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/user')}>
                    Back to List
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button onClick={onCancel}>Cancel</Button>
                <Button type="primary" icon={<SaveOutlined />} onClick={onSubmit}>
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>
      </Col>

      <style jsx global>{`
        .avatar-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 12px;
        }
        .profile-header-content {
          display: flex;
          flex-direction: column;
        }
        .action-buttons {
          display: flex;
          gap: 8px;
          justify-content: flex-start;
        }
        @media (max-width: 576px) {
          .avatar-wrapper {
            margin-bottom: 24px;
          }
        }
      `}</style>
    </Row>
  );
};

export default UserProfileHeader;
