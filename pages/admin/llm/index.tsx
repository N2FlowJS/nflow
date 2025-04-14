import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Card,
  Tabs,
  Spin,
  Alert,
} from 'antd';
import { useRouter } from 'next/router';
import LLMProvidersTable from '../../../components/llm/LLMProvidersTable';
import { fetchAllLLMProviders } from '../../../services/llmService';
import { LLMProvider } from '../../../types/llm';
import { checkAuthentication, hasAdminAccess, redirectToLogin } from '../../../services/authUtils';

const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

export default function LLMAdministration() {
  const router = useRouter();
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthenticated(false);
    }
  };

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllLLMProviders();
      setProviders(data);
    } catch (err) {
      console.error('Error fetching LLM providers:', err);
      setError('Failed to load LLM providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validateAuthentication();
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchProviders();
    }
  }, [authenticated]);

  // Redirect if not authenticated
  useEffect(() => {
    if (authenticated === false) {
      redirectToLogin('/admin/llm');
    }
  }, [authenticated]);

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
        <Title level={2}>LLM Management</Title>
        
        {error && (
          <Alert 
            message="Error" 
            description={error} 
            type="error" 
            showIcon 
            style={{ marginBottom: 16 }} 
          />
        )}
        
        <Card>
          <Tabs defaultActiveKey="providers">
            <TabPane tab="LLM Providers" key="providers">
              <LLMProvidersTable 
                providers={providers} 
                loading={loading} 
                onRefresh={fetchProviders} 
              />
            </TabPane>
            <TabPane tab="Settings" key="settings">
              <p>Global LLM settings will be implemented here.</p>
            </TabPane>
          </Tabs>
        </Card>
      </Content>
    </Layout>
  );
}
