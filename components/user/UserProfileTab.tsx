import React from 'react';
import { Card, Form, Input, Button, Typography, Row, Col, Divider, Tag } from 'antd';
import { EditOutlined, UserOutlined, MailOutlined, CalendarOutlined } from '@ant-design/icons';
import { IUser } from '../../types/IUser';

const { Title, Text, Paragraph } = Typography;

interface UserProfileTabProps {
  user: IUser;
  isCurrentUser: boolean;
  isEditing: boolean;
  form: any;
  onEdit: () => void;
}

const UserProfileTab: React.FC<UserProfileTabProps> = ({
  user,
  isCurrentUser,
  isEditing,
  form,
  onEdit
}) => {
  return (
    <Card
      title={<Title level={4}>User Information</Title>}
      extra={
        !isEditing && isCurrentUser && (
          <Button type="primary" icon={<EditOutlined />} onClick={onEdit}>
            Edit Profile
          </Button>
        )
      }
    >
      {isEditing ? (
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Please enter a name' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter your name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
              >
                <Input
                  prefix={<MailOutlined />}
                  value={user?.email}
                  disabled
                  placeholder="Email is not editable"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter a description about yourself"
            />
          </Form.Item>
        </Form>
      ) : (
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <Text strong style={{ fontSize: '16px' }}>Name: </Text>
            <Text style={{ fontSize: '16px' }}>{user?.name}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong style={{ fontSize: '16px' }}>Email: </Text>
            <Text style={{ fontSize: '16px' }}>{user?.email || 'No email provided'}</Text>
          </Col>
          <Col span={24}>
            <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: 8 }}>
              Description:
            </Text>
            <Paragraph style={{ fontSize: '16px' }}>
              {user?.description || 'No description provided.'}
            </Paragraph>
          </Col>
          <Col span={24}>
            <Divider />
            <Row gutter={16}>
              <Col span={8}>
                <Text type="secondary">Created At:</Text>
                <div>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </Col>
              <Col span={8}>
                <Text type="secondary">Last Login:</Text>
                <div>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'N/A'}
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default UserProfileTab;
