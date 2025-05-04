import { ApiOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import React, { useState } from 'react';
import { LLMProvider } from '../../models/llm';
import UserLLMProviderDetail from '../llm/UserLLMProviderDetail';
import LLMProviderPreferences from '../profile/LLMProviderPreferences';

const { Title } = Typography;

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
  userName?: string;  // Add this line
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
  onRefreshProviders,
  userName  // Add this line
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
      default:
        color = 'default';
        break;
    }

    return <Tag color={color} icon={icon}>{label}</Tag>;
  };

  // Define columns for the providers table
  const llmProviderColumns = [

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
      {userId && <LLMProviderPreferences userId={userId} viewOnly={!isCurrentUser && currentUserId !== userId} userName={userName} />}

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
                {`${isCurrentUser ? 'My' : userName + "'s"} LLM Providers`}
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
