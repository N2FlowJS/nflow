import React, { useEffect, useState } from 'react';
import {
  Layout,
  Typography,
  Breadcrumb,
  Spin,
  message,
  Alert
} from 'antd';
import { useRouter } from 'next/router';
import Link from 'next/link';
import LLMProviderForm from '../../../../components/llm/LLMProviderForm';
import { createLLMProvider } from '../../../../services/llmService';
import { CreateLLMProviderRequest } from '../../../../types/llm';
import { checkAuthentication, hasAdminAccess, redirectToLogin } from '../../../../services/authUtils';

const { Content } = Layout;
const { Title } = Typography;

export default function NewLLMProvider() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<any>(null);

  // Check authentication
  const validateAuthentication = async () => {
    try {
      const authData = await checkAuthentication();
      
      if (!authData) {
        setAuthenticated(false);
        return;
      }
      
      setAuthenticated(true);
      setUserData(authData);
      
      // Check if user has admin permission
      if (!hasAdminAccess(authData)) {
        message.error('You do not have permission to access this page');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthenticated(false);
    }
  };

  useEffect(() => {
    validateAuthentication();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (authenticated === false) {
      redirectToLogin('/admin/llm/providers/new');
    }
  }, [authenticated]);

  const handleSubmit = async (data: CreateLLMProviderRequest) => {
    try {
      setLoading(true);
      await createLLMProvider(data);
      message.success('LLM provider created successfully');
      router.push('/admin/llm');
    } catch (error) {
      console.error('Create provider error:', error);
      message.error('Failed to create LLM provider');
    } finally {
      setLoading(false);
    }
  };

  if (authenticated === null) {
    return (
      <Layout>
        <Content style={{ padding: '24px' }}>
          <Spin size="large" />
          <p>Checking authentication...</p>
        </Content>
      </Layout>
    );
  }

  if (authenticated === false) {
    return (
      <Layout>
        <Content style={{ padding: '24px' }}>
          <Alert
            message="Authentication Required"
            description="You need to be logged in to view this page. Redirecting to login..."
            type="warning"
            showIcon
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout>
      <Content style={{ padding: '24px' }}>
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item>
            <Link href="/admin">Admin</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/admin/llm">LLM Management</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>New Provider</Breadcrumb.Item>
        </Breadcrumb>

        <Title level={2}>Add New LLM Provider</Title>
        
        <LLMProviderForm 
          onSubmit={(values) => handleSubmit(values as CreateLLMProviderRequest)}
          isLoading={loading}
        />
      </Content>
    </Layout>
  );
}
