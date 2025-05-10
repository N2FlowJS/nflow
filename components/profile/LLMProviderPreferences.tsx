import {
  ApiOutlined,
} from '@ant-design/icons';
import {
  Card,
  Col,
  Empty,
  message,
  Row,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { LLMProvider } from '../../models/llm';
import { fetchUserPreferences } from '../../services/userService';

const { Title, Text } = Typography;

interface LLMProviderPreferencesProps {
  userId?: string;
  teamId?: string;
  userName?: string;
}

const LLMProviderPreferences: React.FC<LLMProviderPreferencesProps> = ({
  userId,
  userName
}) => {
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<any>(null);
  
  // Fetch preferences including available models and current defaults
  const fetchPreferences = React.useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const data = await fetchUserPreferences(userId);
      setPreferences(data);
    } catch (error: unknown) {
      console.error('Error fetching LLM preferences:', error);
      message.error('Failed to load LLM preferences');
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const getProviderTypeTag = (type: string) => {
    let color = '';
    let icon = null;
    let label = type;

    switch (type) {
      case 'openai':
        color = 'green';
        icon = <ApiOutlined />;
        label = 'OpenAI';
        break;
      case 'openai-compatible':
        color = 'cyan';
        icon = <ApiOutlined />;
        label = 'OpenAI Compatible';
        break;

      default:
        color = 'default';
        break;
    }

    return <Tag color={color} icon={icon}>{label}</Tag>;
  };

  const getOwnerTag = (provider: LLMProvider) => {
    if (provider.ownerType === 'system') {
      return <Tag color="gold">System</Tag>;
    } else if (provider.ownerType === 'user') {
      return (
        <Tooltip title={`Owner: ${provider.userOwner?.name || 'User'}`}>
          <Tag color="green">Personal</Tag>
        </Tooltip>
      );
    } else if (provider.ownerType === 'team') {
      return (
        <Tooltip title={`Team: ${provider.teamOwner?.name || 'Team'}`}>
          <Tag color="blue">Team</Tag>
        </Tooltip>
      );
    }
    return null;
  };

  const renderProviderCards = (providers: LLMProvider[], title: string) => {
    if (providers.length === 0) {
      return null;
    }

    return (
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>{title}</Title>
        <Row gutter={[16, 16]}>
          {providers.map(provider => (
            <Col xs={24} sm={12} md={8} lg={6} key={provider.id}>
              <Card 
                hoverable
                className="provider-preference-card"
              >
                <div style={{ marginBottom: 12 }}>
                  {getProviderTypeTag(provider.providerType)}
                  {getOwnerTag(provider)}
                </div>
                <Typography.Title level={5} ellipsis style={{ margin: '0 0 12px 0' }}>
                  {provider.name || 'Unnamed Provider'}
                </Typography.Title>
                <Space style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    {provider.models?.length || 0} models
                  </Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  const renderAllProviders = () => {
    if (!preferences) return null;

    const systemProviders = preferences.availableProviders?.systemProviders || [];
    const userProviders = preferences.availableProviders?.userProviders || [];
    const teamProviders = preferences.availableProviders?.teamProviders || [];
    
    const hasAnyProviders = systemProviders.length > 0 || userProviders.length > 0 || teamProviders.length > 0;
    
    if (!hasAnyProviders) {
      return <Empty description="No providers available" />;
    }

    return (
      <>
        {userProviders.length > 0 && renderProviderCards(userProviders, `${userName ? `${userName}'s` : 'My'} Providers`)}
        {teamProviders.length > 0 && renderProviderCards(teamProviders, 'Team Providers')}
        {systemProviders.length > 0 && renderProviderCards(systemProviders, 'System Providers')}
      </>
    );
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading LLM preferences...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Title level={3}>Available LLM Providers</Title>
      <Text type="secondary">
        These providers are available for use with your agents and workflows.
      </Text>

      <div style={{ marginTop: 24 }}>
        {renderAllProviders()}
      </div>

      <style jsx global>{`
        .provider-preference-card {
          height: 100%;
          transition: all 0.3s;
        }
        
        .provider-preference-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-3px);
        }
        
        .provider-preference-card .ant-card-body {
          padding: 16px;
        }
      `}</style>
    </Card>
  );
};

export default LLMProviderPreferences;
