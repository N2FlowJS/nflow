import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Select,
  Button,
  Spin,
  message,
  Table,
  Tag,
  Tooltip,
  Tabs,
  Space,
  Empty,
} from 'antd';
import {
  ApiOutlined,
  StarOutlined,
  StarFilled,
  CheckCircleOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { updateUserPreferences, fetchUserPreferences } from '../../services/userService';
import { LLMProvider } from '../../types/llm';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface LLMProviderPreferencesProps {
  userId?: string;
  teamId?: string;
  viewOnly?: boolean;
}

const LLMProviderPreferences: React.FC<LLMProviderPreferencesProps> = ({
  userId,
  teamId,
  viewOnly = false
}) => {
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchPreferences();
    }
  }, [userId]);

  const fetchPreferences = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const data = await fetchUserPreferences(userId);
      setPreferences(data);
      setSelectedProvider(data.defaultLLMProviderId);
    } catch (error) {
      console.error('Error fetching LLM preferences:', error);
      message.error('Failed to load LLM preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
  };

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    try {
      await updateUserPreferences(userId, {
        defaultLLMProviderId: selectedProvider
      });
      message.success('Default LLM provider updated successfully');
      fetchPreferences(); // Refresh data
    } catch (error) {
      console.error('Error updating preferences:', error);
      message.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

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

  const columns = [
    {
      title: 'Provider Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: LLMProvider) => (
        <Space>
          {record.id === preferences?.defaultLLMProviderId && (
            <Tooltip title="Default Provider">
              <StarFilled style={{ color: '#faad14' }} />
            </Tooltip>
          )}
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'providerType',
      key: 'providerType',
      render: (type: string) => getProviderTypeTag(type),
    },
    {
      title: 'Owner',
      key: 'owner',
      render: (record: LLMProvider) => getOwnerTag(record),
    },
    {
      title: 'Models',
      dataIndex: 'models',
      key: 'models',
      render: (models: any[]) => (
        <span>{models?.length || 0} models</span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'} icon={isActive ? <CheckCircleOutlined /> : null}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
  ];

  const renderProviderSelector = () => {
    if (!preferences) return null;

    const allProviders = [
      ...(preferences.availableProviders?.systemProviders || []),
      ...(preferences.availableProviders?.userProviders || []),
      ...(preferences.availableProviders?.teamProviders || []),
    ];

    return (
      <div style={{ marginBottom: 24 }}>
        <Title level={4}>Default LLM Provider</Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Select
            placeholder="Select default LLM provider"
            style={{ width: 300 }}
            value={selectedProvider}
            onChange={handleProviderChange}
            disabled={viewOnly}
          >
            <Option value={null}>No default provider</Option>
            {allProviders.map(provider => (
              <Option key={provider.id} value={provider.id}>
                {provider.name} {getProviderTypeTag(provider.providerType)} {getOwnerTag(provider)}
              </Option>
            ))}
          </Select>

          {!viewOnly && (
            <Button
              type="primary"
              onClick={handleSave}
              loading={saving}
              icon={<StarFilled />}
            >
              Set as Default
            </Button>
          )}
        </div>
        <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
          The default provider will be used for all AI interactions unless otherwise specified
        </Text>
      </div>
    );
  };

  const renderProviderTabs = () => {
    if (!preferences) return null;

    return (
      <Tabs defaultActiveKey="all">
        <TabPane tab="All Providers" key="all">
          <Table
            dataSource={[
              ...(preferences.availableProviders?.systemProviders || []),
              ...(preferences.availableProviders?.userProviders || []),
              ...(preferences.availableProviders?.teamProviders || []),
            ]}
            columns={columns}
            rowKey="id"
            pagination={false}
          />
        </TabPane>
        <TabPane tab="System Providers" key="system">
          <Table
            dataSource={preferences.availableProviders?.systemProviders || []}
            columns={columns}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: <Empty description="No system providers available" /> }}
          />
        </TabPane>
        <TabPane tab="My Providers" key="user">
          <Table
            dataSource={preferences.availableProviders?.userProviders || []}
            columns={columns}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: <Empty description="You have no personal providers" /> }}
          />
        </TabPane>
        <TabPane tab="Team Providers" key="team">
          <Table
            dataSource={preferences.availableProviders?.teamProviders || []}
            columns={columns}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: <Empty description="No team providers available" /> }}
          />
        </TabPane>
      </Tabs>
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
      <Title level={3}>LLM Provider Preferences</Title>

      {renderProviderSelector()}

      <div style={{ marginTop: 24 }}>
        <Title level={4}>Available Providers</Title>
        {renderProviderTabs()}
      </div>
    </Card>
  );
};

export default LLMProviderPreferences;
