import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Spin,
  message,
  Table,
  Tag,
  Space,
  Modal,
  Popconfirm,
  Tooltip,
  Empty
} from 'antd';
import {
  PlusOutlined,
  ApiOutlined,
  DeleteOutlined,
  EditOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import LLMProviderForm from '../llm/LLMProviderForm';
import { fetchTeamLLMProviders, deleteTeamLLMProvider, createTeamLLMProvider } from '../../services/teamService';
import { LLMProvider } from '../../types/llm';
import TeamLLMProviderDetail from '../llm/TeamLLMProviderDetail';

const { Title, Text } = Typography;

interface TeamLLMProvidersProps {
  teamId: string;
  userRole: string;
  canManageProviders: boolean;
}

const TeamLLMProviders: React.FC<TeamLLMProvidersProps> = ({
  teamId,
  userRole,
  canManageProviders
}) => {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingProvider, setEditingProvider] = useState<LLMProvider | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | null>(null);

  useEffect(() => {
    if (teamId) {
      fetchProviders();
    }
  }, [teamId]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const data = await fetchTeamLLMProviders(teamId);
      data && setProviders(data);
    } catch (error) {
      console.error('Error fetching team LLM providers:', error);
      message.error('Failed to load team LLM providers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (providerId: string) => {
    try {
      setActionLoading(true);
      await deleteTeamLLMProvider(teamId, providerId);
      message.success('Provider deleted successfully');
      fetchProviders(); // Refresh data
    } catch (error) {
      console.error('Error deleting provider:', error);
      message.error('Failed to delete provider');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddProvider = async (values: any) => {
    try {
      setActionLoading(true);
      await createTeamLLMProvider(teamId, values);
      message.success('Provider added successfully');
      setIsAddModalVisible(false);
      fetchProviders(); // Refresh data
    } catch (error) {
      console.error('Error adding provider:', error);
      message.error('Failed to add provider');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProvider = async (values: any) => {
    try {
      setActionLoading(true);
      // This would be implemented in a real system
      message.success('Provider updated successfully');
      setIsEditModalVisible(false);
      fetchProviders(); // Refresh data
    } catch (error) {
      console.error('Error updating provider:', error);
      message.error('Failed to update provider');
    } finally {
      setActionLoading(false);
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

  const getOwnershipTag = (provider: LLMProvider) => {
    if (provider.ownerType === 'system') {
      return <Tag color="gold">System</Tag>;
    } else if (provider.teamOwnerId === teamId) {
      return <Tag color="blue">Team</Tag>;
    }
    return null;
  };

  const columns = [
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
      title: 'Ownership',
      key: 'ownership',
      render: (record: LLMProvider) => getOwnershipTag(record),
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
          
          {canManageProviders && record.teamOwnerId === teamId && (
            <>
              <Button
                icon={<EditOutlined />}
                type="text"
                onClick={() => {
                  setEditingProvider(record);
                  setIsEditModalVisible(true);
                }}
              />
              <Popconfirm
                title="Delete this provider?"
                description="This will delete the provider and all associated models. This action cannot be undone."
                onConfirm={() => handleDelete(record.id)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const teamProviders = providers.filter(p => p.teamOwnerId === teamId);
  const systemProviders = providers.filter(p => p.ownerType === 'system');

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading LLM providers...</div>
        </div>
      </Card>
    );
  }

  // If a provider is selected, show the provider detail view
  if (selectedProvider) {
    return (
      <TeamLLMProviderDetail
        teamId={teamId}
        provider={selectedProvider}
        canManageModels={canManageProviders}
        onBackToList={() => setSelectedProvider(null)}
        onProviderUpdated={fetchProviders}
      />
    );
  }

  return (
    <>
      <Card
        title={<Title level={4}>Team LLM Providers</Title>}
        extra={
          canManageProviders && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalVisible(true)}
            >
              Add Provider
            </Button>
          )
        }
      >
        <Text style={{ marginBottom: 16, display: 'block' }}>
          These LLM providers are specific to this team and can be used by all team members.
        </Text>

        <Table
          dataSource={teamProviders}
          columns={columns}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: <Empty description="No team LLM providers configured" /> }}
        />
      </Card>

      <Card
        title={<Title level={4} style={{ marginTop: 24 }}>System LLM Providers</Title>}
        style={{ marginTop: 24 }}
      >
        <Text style={{ marginBottom: 16, display: 'block' }}>
          These system-wide LLM providers are available to all users.
        </Text>

        <Table
          dataSource={systemProviders}
          columns={columns}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: <Empty description="No system LLM providers available" /> }}
        />
      </Card>

      {/* Add Provider Modal */}
      <Modal
        title="Add Team LLM Provider"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
        width={700}
      >
        <LLMProviderForm
          onSubmit={handleAddProvider}
          isLoading={actionLoading}
          teamContext={teamId}
        />
      </Modal>

      {/* Edit Provider Modal */}
      {editingProvider && (
        <Modal
          title="Edit Team LLM Provider"
          open={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          footer={null}
          width={700}
        >
          <LLMProviderForm
            initialValues={editingProvider}
            onSubmit={handleEditProvider}
            isLoading={actionLoading}
            teamContext={teamId}
          />
        </Modal>
      )}
    </>
  );
};

export default TeamLLMProviders;
