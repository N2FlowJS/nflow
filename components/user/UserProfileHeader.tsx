import React from 'react';
import { Card, Form, Input, Button, Typography, Space, Avatar, Row, Col, Statistic } from 'antd';
import { UserOutlined, TeamOutlined, RobotOutlined, ApiOutlined, EditOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { IUser } from '../../types/IUser';
import { LLMProvider } from '../../types/llm';

const { Title, Paragraph } = Typography;

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
  
  return (
    <Card>
      <Row gutter={24} align="middle">
        {/* User Avatar */}
        <Col xs={24} sm={6} md={4} style={{ textAlign: 'center' }}>
          <Avatar
            size={100}
            icon={<UserOutlined />}
            style={{
              backgroundColor: theme === 'dark' ? '#1668dc' : '#1890ff',
              marginBottom: 16
            }}
          />
          {isCurrentUser && !isEditing && (
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={onEdit}
              style={{ display: 'block', margin: '0 auto' }}
            >
              Edit Profile
            </Button>
          )}
        </Col>

        {/* User Details */}
        <Col xs={24} sm={18} md={20}>
          <Row>
            <Col span={24}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
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
                <Space>
                  {isEditing ? (
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
                  ) : (
                    <>
                      {!isCurrentUser && (
                        <Button
                          icon={<ArrowLeftOutlined />}
                          onClick={() => router.push('/user')}
                        >
                          Back to List
                        </Button>
                      )}
                      {!isCurrentUser && currentUserId !== user?.id && (
                        <Button type="primary" onClick={onEdit}>
                          Edit
                        </Button>
                      )}
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
