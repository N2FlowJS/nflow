import { IdcardOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, Form, Input, Typography, message } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../locale';
import LanguageMenu from '../../components/layout/LanguageMenu';

const { Title, Text } = Typography;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const { antdLocale, t } = useLocale('register');

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const success = await register({
        name: values.name,
        email: values.email,
        code: values.code,
        password: values.password,
        description: values.description || '',
      });

      if (success) {
        message.success(t('success'));
        router.push('/');
      } else {
        message.error(t('failed'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      message.error(t('error'));
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
        backgroundColor: '#f0f2f5',
        padding: '20px 0'
      }}>
        <Card style={{ width: 450, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2}>{t('title')}</Title>
            <Text type="secondary">{t('subtitle')}</Text>
          </div>
          <LanguageMenu />

          <Form
            name="register"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: t('nameRequired') }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder={t('name')}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: t('emailRequired') },
                { type: 'email', message: t('emailInvalid') }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder={t('email')}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="code"
              rules={[{ required: true, message: t('codeRequired') }]}
            >
              <Input
                prefix={<IdcardOutlined />}
                placeholder={t('code')}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: t('passwordRequired') },
                { min: 6, message: t('passwordMin') }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('password')}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: t('confirmPasswordRequired') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t('passwordsDoNotMatch')));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('confirmPassword')}
                size="large"
              />
            </Form.Item>

            <Form.Item name="description">
              <Input.TextArea
                placeholder={t('description')}
                rows={3}
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
                {t('submit')}
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text>{t('alreadyHaveAccount')} </Text>
            <Link href="/auth/login">{t('login')}</Link>
          </div>
        </Card>
      </div>
    </ConfigProvider>
  );
}
