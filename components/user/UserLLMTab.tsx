import React, { useState } from 'react';
import { Card, Typography, Button, Space, Table, Tag, Popconfirm, Alert } from 'antd';
import { PlusOutlined, ApiOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, StopOutlined, ExperimentOutlined } from '@ant-design/icons';
import { LLMProvider } from '../../types/llm';
import UserLLMProviderDetail from '../llm/UserLLMProviderDetail';
import LLMProviderPreferences from '../profile/LLMProviderPreferences';

const { Title, Text } = Typography;

interface UserLLMTabProps {
  userId: string;
  isCurrentUser: boolean;
  currentUserId: string | null;
  llmProviders: LLMProvider[];
  llmProviderLoading: boolean;
  onOpenAddModal: () => void;
  onOpenEditModal: (provider: LLMProvider) => void;
  onDeleteProvider: (providerId: string) => void;
  onRefreshProviders: () => void;
}

const UserLLMTab: React.FC<UserLLMTabProps> = ({
  userId,
  isCurrentUser,
  currentUserId,
  llmProviders,
  llmProviderLoading,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteProvider,
  onRefreshProviders
}) => {
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | null>(null);

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
      case 'azure':
        color = 'blue';
        icon = <ApiOutlined />;
        label = 'Azure';
        break;
      case 'anthropic':
        color = 'purple';
        icon = <ApiOutlined />;
        label = 'Anthropic';
        break;
      case 'local':
        color = 'orange';
        icon = <ExperimentOutlined />;
        label = 'Local';
        break;
      case 'custom':
        color = 'geekblue';
        icon = <ExperimentOutlined />;
        label = 'Custom';
        break;
      default:
        color = 'default';
        break;
    }

    return <Tag color={color} icon={icon}>{label}</Tag>;
  };

  // Define columns for the providers table
  const llmProviderColumns = [
    {
      title: 'Provider Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'providerType',
      key: 'providerType',
      render: (type: string) => getProviderTypeTag(type),
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
        <Tag color={isActive ? 'success' : 'error'} icon={isActive ? <CheckCircleOutlined /> : <StopOutlined />}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: LLMProvider) => (
        <Space>
          <Button
            icon={<ApiOutlined />}
            type="primary"
            size="small"
            onClick={() => setSelectedProvider(record)}
          >
            Manage Models
          </Button>
          <Button
            icon={<EditOutlined />}
            type="text"
            onClick={() => onOpenEditModal(record)}
          />
          <Popconfirm
            title="Delete this provider?"
            description="This will delete the provider and all associated models. This action cannot be undone."
            onConfirm={() => onDeleteProvider(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {userId && <LLMProviderPreferences userId={userId} viewOnly={!isCurrentUser && currentUserId !== userId} />}
      
      {/* Provider detail view or list view */}
      {selectedProvider ? (
        <UserLLMProviderDetail
          userId={userId}
          provider={selectedProvider}
          onBackToList={() => setSelectedProvider(null)}
          onProviderUpdated={onRefreshProviders}
        />
      ) : (
        <Card 
          title={
            <Title level={4}>
              <Space>
                <ApiOutlined />
                Personal LLM Providers
              </Space>
            </Title>
          }
          extra={
            isCurrentUser && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onOpenAddModal}
              >
                Add Provider
              </Button>
            )
          }
          style={{ marginTop: 24 }}
        >
          <Alert
            message="Private LLM Providers"
            description="These LLM providers are private to your account and can be used for your personal agents and workflows."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Table
            dataSource={llmProviders}
            columns={llmProviderColumns}
            rowKey="id"
            loading={llmProviderLoading}
            pagination={false}
            locale={{ emptyText: 'No personal LLM providers configured' }}
          />
        </Card>
      )}
    </>
  );
};

export default UserLLMTab;
