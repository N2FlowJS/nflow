import { MailOutlined, UserOutlined } from '@ant-design/icons';
import { Col, Form, Input, Row } from 'antd';
import React from 'react';
import { IUser } from '../../models/IUser';


interface UserProfileTabProps {
  user: IUser;
  form: any;
}

const UserProfileTab: React.FC<UserProfileTabProps> = ({ user, form }) => {
  return (
    <>
      <Form form={form} layout="vertical">
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter a name' }]}>
              <Input prefix={<UserOutlined />} placeholder="Enter your name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Email">
              <Input prefix={<MailOutlined />} value={user?.email} disabled placeholder="Email is not editable" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter a description' }]}>
          <Input.TextArea rows={4} placeholder="Enter a description about yourself" />
        </Form.Item>
      </Form>
    </>
  );
};

export default UserProfileTab;
