import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Typography, message } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../locale';
import AuthLayout from '../../components/layout/AuthLayout';

const { Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const {  messages } = useLocale();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        message.success(messages.login.success);
        router.push('/');
      } else {
        message.error(messages.login.failed);
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error(messages.login.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={messages.login.title} subtitle={messages.login.subtitle}>
      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: messages.login.emailRequired },
            { type: 'email', message: messages.login.emailInvalid }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder={messages.login.email}
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: messages.login.passwordRequired }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={messages.login.password}
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
          >
            {messages.login.submit}
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center' }}>
        <Text>{messages.login.noAccount} </Text>
        <Link href="/auth/register">{messages.login.registerNow}</Link>
      </div>
    </AuthLayout>
  );
}
