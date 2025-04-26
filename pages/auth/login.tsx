import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, Form, Input, Typography, message } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../locale';

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { antdLocale, messages } = useLocale();

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
    <ConfigProvider locale={antdLocale}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5'
      }}>
        <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2}>{messages.login.title}</Title>
            <Text type="secondary">{messages.login.subtitle}</Text>
          </div>

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
        </Card>
      </div>
    </ConfigProvider>
  );
}
