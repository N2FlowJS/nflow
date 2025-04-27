import { LockOutlined, UserOutlined, GoogleOutlined, GithubOutlined } from '@ant-design/icons';
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
  const { messages } = useLocale();


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
        size="large"
        style={{ width: '100%', maxWidth: '360px', margin: '0 auto' }}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: messages.login.emailRequired },
            { type: 'email', message: messages.login.emailInvalid }
          ]}
          style={{ marginBottom: 24 }}
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
          style={{ marginBottom: 32 }}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={messages.login.password}
            size="large"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 16 }}>
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

        <div style={{ 
          display: 'flex', 
          gap: '12px',
          marginBottom: '24px'
        }}>
          <Button
            icon={<GoogleOutlined />}
            size="large"
            block
            style={{
              background: '#fff',
              color: '#444',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              height: '48px',
              transition: 'all 0.3s'
            }}
            onClick={() => window.location.href = '/api/auth/oauth/google'}
          >
            Google
          </Button>
          <Button
            icon={<GithubOutlined />}
            size="large"
            block
            style={{
              background: '#24292f',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              height: '48px',
              transition: 'all 0.3s'
            }}
            onClick={() => window.location.href = '/api/auth/oauth/github'}
          >
            GitHub
          </Button>
        </div>
      </Form>

      <div style={{ textAlign: 'center' }}>
        <Text>{messages.login.noAccount} </Text>
        <Link href="/auth/register">{messages.login.registerNow}</Link>
      </div>
    </AuthLayout>
  );
}
