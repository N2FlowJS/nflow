import { ApiOutlined, ArrowLeftOutlined, EditOutlined, RobotOutlined, SaveOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Form, Input, Row, Space, Statistic, Tag, Typography } from 'antd';
import { useRouter } from 'next/router';
import React from 'react';
import { IUser } from '../../models/IUser';
import { LLMProvider } from '../../models/llm';

const { Title, Paragraph, Text } = Typography;

interface UserProfileHeaderProps {
  user: IUser;
  isCurrentUser: boolean;
  isEditing: boolean;
  currentUserId: string | null;
  form: any;
  theme: string;
  llmProviders: LLMProvider[];
  onEdit: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  user,
  isCurrentUser,
  isEditing,
  currentUserId,
  form,
  theme,
  llmProviders,
  onEdit,
  onCancel,
  onSubmit
}) => {
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
    <Card>
      <Row gutter={24} align="middle">
        {/* User Avatar Column */}
        <Col xs={24} sm={6} md={4} style={{ textAlign: 'center' }}>
          <Avatar
            size={100}
            icon={<UserOutlined />}
            style={{
              backgroundColor: theme === 'dark' ? '#1668dc' : '#1890ff',
              marginBottom: 16
            }}
          />
        </Col>

        {/* User Details Column */}
        <Col xs={24} sm={18} md={20}>
          <Row>
            <Col span={24}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                {/* User Name and Permission */}
                <Space direction="vertical" size="small">
                  <Space align="center">
                    <Title level={2} style={{ margin: 0 }}>
                      {isEditing ? (
                        <Form.Item
                          name="name"
                          style={{ marginBottom: 0 }}
                          rules={[{ required: true, message: 'Please enter a name' }]}
                        >
                          <Input placeholder="Enter name" />
                        </Form.Item>
                      ) : (
                        user?.name
                      )}
                    </Title>
                    <Tag color={getPermissionColor(user?.permission)} style={{ marginLeft: 8 }}>
                      {user?.permission?.toUpperCase()}
                    </Tag>
                  </Space>
                  <Text type="secondary" style={{ fontSize: '14px' }}>{user?.email}</Text>
                </Space>

                {/* Action Buttons */}
                <Space>
                  {!isEditing ? (
                    <>
                    
                      {(isCurrentUser || (!isCurrentUser && currentUserId !== user?.id)) && (
                        <Button
                          type="default"
                          icon={<EditOutlined />}
                          onClick={onEdit}
                        >
                          Edit Profile
                        </Button>
                      )}
                      {!isCurrentUser && (
                        <Button
                          icon={<ArrowLeftOutlined />}
                          onClick={() => router.push('/user')}
                        >
                          Back to List
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button onClick={onCancel}>
                        Cancel
                      </Button>
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={onSubmit}
                      >
                        Save Changes
                      </Button>
                    </>
                  )}
                </Space>
              </div>
            </Col>
          </Row>

          {isEditing ? (
            <Form
              form={form}
              layout="vertical"
            >
              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please enter a description' }]}
              >
                <Input.TextArea rows={3} placeholder="Enter a brief description" />
              </Form.Item>
            </Form>
          ) : (
            <>
              <Paragraph style={{ fontSize: '16px' }}>
                {user?.description || 'No description provided.'}
              </Paragraph>

              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Teams"
                    value={user?.teamsWithRoles?.length || 0}
                    prefix={<TeamOutlined />}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Agents"
                    value={user?.ownedAgents?.length || 0}
                    prefix={<RobotOutlined />}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="LLM Providers"
                    value={llmProviders?.length || 0}
                    prefix={<ApiOutlined />}
                  />
                </Col>
              </Row>
            </>
          )}
        </Col>
      </Row>
    </Card>
  );
};

export default UserProfileHeader;
