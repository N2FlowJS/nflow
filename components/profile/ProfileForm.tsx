import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  message, 
  Typography,
  Divider,
  Avatar,
  Space
} from 'antd';
import { UserOutlined, SaveOutlined, MailOutlined } from '@ant-design/icons';
import { updateUserProfile } from '../../services/userService';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ProfileFormProps {
  userData: any;
  userId: string;
}

export default function ProfileForm({ userData, userId }: ProfileFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // Initialize form with user data
  React.useEffect(() => {
    if (userData) {
      form.setFieldsValue({
        name: userData.name,
        email: userData.email,
        description: userData.description,
      });
    }
  }, [userData, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      await updateUserProfile(userId, {
        name: values.name,
        email: values.email,
        description: values.description,
      });
      
      message.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return (
      <Card>
        <Text>Error loading user data</Text>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Title level={4}>Profile Information</Title>
        <Avatar 
          size={64} 
          icon={<UserOutlined />}
          style={{ backgroundColor: '#1890ff' }}
        />
      </div>
      
      <Divider />
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          name: userData.name,
          email: userData.email,
          description: userData.description,
        }}
      >
        <Form.Item
          name="name"
          label="Full Name"
          rules={[
            { required: true, message: 'Please enter your name' },
            { max: 100, message: 'Name cannot be longer than 100 characters' }
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Your name" />
        </Form.Item>
        
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email address' }
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Your email" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="Bio"
          rules={[
            { max: 500, message: 'Bio cannot be longer than 500 characters' }
          ]}
        >
          <TextArea 
            placeholder="A short description about yourself" 
            rows={4} 
            showCount 
            maxLength={500}
          />
        </Form.Item>
        
        <Space>
          <Text type="secondary">User ID: {userId}</Text>
          <Text type="secondary">Role: {userData.permission}</Text>
        </Space>
        
        <Divider />
        
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<SaveOutlined />} 
            loading={loading}
          >
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
