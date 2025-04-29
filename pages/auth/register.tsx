import { IdcardOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Typography, message } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../locale';
import AuthLayout from '../../components/layout/AuthLayout';

const { Text } = Typography;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const {  t } = useLocale('register');

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
    } catch (error: unknown) {
      console.error('Registration error:', error);
      message.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t('title')} subtitle={t('subtitle')}>
      <Form
        name="register"
        onFinish={onFinish}
        layout="vertical"
        requiredMark={false}
        size="large"
        style={{ width: '100%', maxWidth: '360px', margin: '0 auto' }}
      >
        <Form.Item
          name="name"
          style={{ marginBottom: 24 }}
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
          style={{ marginBottom: 24 }}
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
          style={{ marginBottom: 24 }}
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
          style={{ marginBottom: 24 }}
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
          style={{ marginBottom: 24 }}
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

        <Form.Item
          name="description"
          style={{ marginBottom: 32 }}
        >
          <Input.TextArea
            placeholder={t('description')}
            rows={3}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 24 }}>
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
    </AuthLayout>
  );
}
