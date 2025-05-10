import React from 'react';
import { Form, Input, Typography, Row, Col, Divider } from 'antd';
import { UserOutlined, MailOutlined, CalendarOutlined } from '@ant-design/icons';
import { IUser } from '../../models/IUser';

const { Text, Paragraph } = Typography;

interface UserProfileTabProps {
  user: IUser;
  isEditing: boolean;
  form: any;
}

const UserProfileTab: React.FC<UserProfileTabProps> = ({
  user,
  isEditing,
  form,
}) => {
  return (
    <>
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
        <div className="user-info-container">
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <div className="info-item">
                <Text strong style={{ fontSize: '16px' }}>Name: </Text>
                <Text style={{ fontSize: '16px' }}>{user?.name}</Text>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className="info-item">
                <Text strong style={{ fontSize: '16px' }}>Email: </Text>
                <Text style={{ fontSize: '16px' }}>{user?.email || 'No email provided'}</Text>
              </div>
            </Col>
            <Col span={24}>
              <div className="info-item">
                <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: 8 }}>
                  Description:
                </Text>
                <Paragraph style={{ fontSize: '16px' }}>
                  {user?.description || 'No description provided.'}
                </Paragraph>
              </div>
            </Col>
            <Col span={24}>
              <Divider style={{ margin: '16px 0' }} />
              <Row gutter={32}>
                <Col xs={24} sm={12}>
                  <div className="date-item">
                    <Text type="secondary">Created At:</Text>
                    <div>
                      <CalendarOutlined style={{ marginRight: 8 }} />
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="date-item">
                    <Text type="secondary">Last Login:</Text>
                    <div>
                      <CalendarOutlined style={{ marginRight: 8 }} />
                      {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      )}

      <style jsx global>{`
        .user-info-container {
          padding: 0;
        }
        .info-item {
          margin-bottom: 8px;
        }
        .date-item {
          background-color: #f9f9f9;
          padding: 12px;
          border-radius: 6px;
          margin-top: 8px;
        }
      `}</style>
    </>
  );
};

export default UserProfileTab;
