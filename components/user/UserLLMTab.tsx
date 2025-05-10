import { ApiOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Empty, Popconfirm, Row, Space, Spin, Tag, Tooltip, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { LLMProvider } from '../../models/llm';
import { fetchUserPreferences } from '../../services/userService';
import UserLLMProviderDetail from '../llm/UserLLMProviderDetail';

const { Title, Text } = Typography;

interface UserLLMTabProps {
  userId: string;
  isCurrentUser: boolean;
  llmProviders: LLMProvider[];
  llmProviderLoading: boolean;
  onOpenEditModal: (provider: LLMProvider) => void;
  onDeleteProvider: (providerId: string) => void;
  onRefreshProviders: () => void;
}

const UserLLMTab: React.FC<UserLLMTabProps> = ({ userId, isCurrentUser, llmProviders, llmProviderLoading, onOpenEditModal, onDeleteProvider, onRefreshProviders }) => {
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | null>(null);
  const [allProviders, setAllProviders] = useState<{
    systemProviders: LLMProvider[];
    teamProviders: LLMProvider[];
    userProviders: LLMProvider[];
  }>({ systemProviders: [], teamProviders: [], userProviders: [] });
  const [loading, setLoading] = useState(false);

  // Fetch all available providers
  useEffect(() => {
    const fetchAllProviders = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const data = await fetchUserPreferences(userId);
        setAllProviders({
          systemProviders: data.availableProviders?.systemProviders || [],
          teamProviders: data.availableProviders?.teamProviders || [],
          userProviders: data.availableProviders?.userProviders || [],
        });
      } catch (error) {
        console.error('Error fetching all providers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProviders();
  }, [userId]);

  // Get provider type tag for display
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

    return (
      <Tag color={color} icon={icon}>
        {label}
      </Tag>
    );
  };

  // Get owner tag
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

  // Render provider cards
  const renderProviderCards = (providers: LLMProvider[], title: string, isPersonal: boolean = false) => {
    if (providers.length === 0) {
      return null;
    }

    return (
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          {title}
        </Title>
        <Row gutter={[16, 16]}>
          {providers.map((provider) => (
            <Col xs={24} sm={12} md={8} lg={6} key={provider.id}>
              <Card
                hoverable
                className="provider-card"
                actions={
                  isPersonal
                    ? [
                        <Button key="manage" type="link" icon={<ApiOutlined />} onClick={() => setSelectedProvider(provider)}>
                          Models
                        </Button>,
                        <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => onOpenEditModal(provider)} />,
                        <Popconfirm key="delete" title="Delete this provider?" description="This will delete the provider and all associated models. This action cannot be undone." onConfirm={() => onDeleteProvider(provider.id)} okText="Delete" cancelText="Cancel" okButtonProps={{ danger: true }}>
                          <Button type="link" danger icon={<DeleteOutlined />} />
                        </Popconfirm>,
                      ]
                    : undefined
                }>
                <div style={{ marginBottom: 12 }}>
                  {getProviderTypeTag(provider.providerType)}
                  {getOwnerTag(provider)}
                </div>
                <Typography.Title level={5} ellipsis style={{ marginTop: 0, marginBottom: 8 }}>
                  {provider.name || 'Unnamed Provider'}
                </Typography.Title>
                <Space style={{ marginTop: 8 }}>
                  <Text type="secondary">{provider.models?.length || 0} models</Text>
                  {!isPersonal && (
                    <Button type="primary" size="small" icon={<ApiOutlined />} onClick={() => setSelectedProvider(provider)}>
                      View Models
                    </Button>
                  )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  if (loading && llmProviderLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" />
        <Text style={{ display: 'block', marginTop: 16 }}>Loading providers...</Text>
      </div>
    );
  }

  return (
    <>
      {/* Provider detail view or list view */}
      {selectedProvider ? (
        <UserLLMProviderDetail userId={userId} provider={selectedProvider} onBackToList={() => setSelectedProvider(null)} onProviderUpdated={onRefreshProviders} />
      ) : (
        <div>
          {/* Personal Providers Section with management capabilities */}
          <div style={{ marginBottom: 24 }}>
            {llmProviderLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
                <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
                  Loading personal providers...
                </Text>
              </div>
            ) : llmProviders.length === 0 ? (
              <Empty description={`No personal providers ${isCurrentUser ? 'configured' : 'available'}`} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Row gutter={[16, 16]}>
                {llmProviders.map((provider) => (
                  <Col xs={24} sm={12} lg={8} xl={6} key={provider.id}>
                    <Card
                      hoverable
                      className="provider-card"
                      actions={[
                        <Button key="manage" type="link" icon={<ApiOutlined />} onClick={() => setSelectedProvider(provider)}>
                          Models
                        </Button>,
                        <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => onOpenEditModal(provider)} disabled={!isCurrentUser} />,
                        <Popconfirm key="delete" title="Delete this provider?" description="This will delete the provider and all associated models. This action cannot be undone." onConfirm={() => onDeleteProvider(provider.id)} okText="Delete" cancelText="Cancel" okButtonProps={{ danger: true }}>
                          <Button type="link" danger icon={<DeleteOutlined />} disabled={!isCurrentUser} />
                        </Popconfirm>,
                      ]}>
                      <div style={{ marginBottom: 12 }}>
                        {getProviderTypeTag(provider.providerType)}
                        <Tag color="green">Personal</Tag>
                      </div>
                      <Typography.Title level={5} ellipsis style={{ marginTop: 0 }}>
                        {provider.name || 'Unnamed Provider'}
                      </Typography.Title>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text type="secondary">{provider.models?.length || 0} models</Text>
                        <Button type="primary" size="small" icon={<ApiOutlined />} onClick={() => setSelectedProvider(provider)}>
                          Manage
                        </Button>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>

          {/* Other Available Providers */}
          {(allProviders.teamProviders.length > 0 || allProviders.systemProviders.length > 0) && (
            <>
              <Divider />
              <Title level={4}>Other Available Providers</Title>

              {/* Team Providers */}
              {renderProviderCards(allProviders.teamProviders, 'Team Providers')}

              {/* System Providers */}
              {renderProviderCards(allProviders.systemProviders, 'System Providers')}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default UserLLMTab;
