import { LockOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Input, message } from 'antd';
import { useState } from 'react';
import { updateUserProfile } from '../../services/userService';

interface PasswordChangeFormProps {
  userId: string;
}

export default function PasswordChangeForm({ userId }: PasswordChangeFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    // Check if passwords match
    if (values.newPassword !== values.confirmPassword) {
      message.error('New passwords do not match!');
      return;
    }

    try {
      setLoading(true);

      await updateUserProfile(userId, {
        currentPassword: values.currentPassword,
        password: values.newPassword,
      });

      message.success('Password updated successfully');
      form.resetFields();
    } catch (error: any) {
      // Check for specific error types
      if (error?.response?.status === 401) {
        message.error('Current password is incorrect');
      } else {
        console.error('Password update error:', error);
        message.error('Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        name="currentPassword"
        label="Current Password"
        rules={[{ required: true, message: 'Please enter your current password' }]}>
        <Input.Password prefix={<LockOutlined />} placeholder="Enter your current password" />
      </Form.Item>

      <Divider />

      <Form.Item
        name="newPassword"
        label="New Password"
        rules={[
          { required: true, message: 'Please enter your new password' },
          { min: 8, message: 'Password must be at least 8 characters' },
        ]}>
        <Input.Password prefix={<LockOutlined />} placeholder="Enter your new password" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="Confirm New Password"
        rules={[
          { required: true, message: 'Please confirm your new password' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('The two passwords do not match'));
            },
          }),
        ]}>
        <Input.Password prefix={<LockOutlined />} placeholder="Confirm your new password" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
          Update Password
        </Button>
      </Form.Item>
    </Form>
  );
}
