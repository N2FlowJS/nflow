import {
  ApiOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Empty,
  message,
  Modal,
  Popconfirm,
  Row,
  Spin,
  Tag,
  Typography
} from 'antd';
import React, { useEffect, useState } from 'react';
import { LLMProvider } from '../../models/llm';
import { createTeamLLMProvider, deleteTeamLLMProvider, fetchTeamLLMProviders, updateTeamLLMProvider } from '../../services/teamService';
import LLMProviderForm from '../llm/LLMProviderForm';
import TeamLLMProviderDetail from '../llm/TeamLLMProviderDetail';

const { Title, Text } = Typography;

interface TeamLLMProvidersProps {
  teamId: string;
  userRole: string;
  canManageProviders: boolean;
}

const TeamLLMProviders: React.FC<TeamLLMProvidersProps> = ({
  teamId,
  canManageProviders
}) => {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingProvider, setEditingProvider] = useState<LLMProvider | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | null>(null);
  const fetchProviders = React.useCallback(async () => {
    if (!teamId) return
    setLoading(true);
    try {
      const data = await fetchTeamLLMProviders(teamId);
      if (data) setProviders(data);
    } catch (error: unknown) {
      console.error('Error fetching team LLM providers:', error);
      message.error('Failed to load team LLM providers');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleDelete = async (providerId: string) => {
    try {
      setActionLoading(true);
      await deleteTeamLLMProvider(teamId, providerId);
      message.success('Provider deleted successfully');
      fetchProviders(); // Refresh data
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.error('Error adding provider:', error);
      message.error('Failed to add provider');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditProvider = async (values: any) => {
    if (!editingProvider?.id) return;

    setActionLoading(true);
    try {
      await updateTeamLLMProvider(teamId, editingProvider.id, values);
      message.success('Provider updated successfully');
      setIsEditModalVisible(false);
      setEditingProvider(null);
      fetchProviders(); // Refresh the list after update
    } catch (error: unknown) {
      console.error('Error updating provider:', error);
      message.error('Failed to update provider: ' + (error instanceof Error ? error.message : 'Unknown error'));
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

  // Provider Card Component
  const ProviderCard = ({ provider }: { provider: LLMProvider }) => (
    <Card
      hoverable
      style={{ height: '100%' }}
      actions={[
        <Button
          key="manage"
          icon={<ApiOutlined />}
          type="link"
          onClick={() => setSelectedProvider(provider)}
        >
          Manage Models
        </Button>,
        ...(canManageProviders && provider.teamOwnerId === teamId ? [
          <Button
            key="edit"
            icon={<EditOutlined />}
            type="link"
            onClick={() => {
              setEditingProvider(provider);
              setIsEditModalVisible(true);
            }}
          />,
          <Popconfirm
            key="delete"
            title="Delete this provider?"
            description="This will delete the provider and all associated models. This action cannot be undone."
            onConfirm={() => handleDelete(provider.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        ] : [])
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        {getProviderTypeTag(provider.providerType)}
        {getOwnershipTag(provider)}
      </div>
      
      <div style={{ marginBottom: 8 }}>
        <Text strong>{provider.name || provider.providerType}</Text>
      </div>
      
      <div>
        <Text type="secondary">{provider.models?.length || 0} models available</Text>
      </div>
    </Card>
  );


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

        {providers.length > 0 ? (
          <Row gutter={[16, 16]}>
            {providers.map(provider => (
              <Col xs={24} sm={12} md={8} lg={6} key={provider.id}>
                <ProviderCard provider={provider} />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="No team LLM providers configured" />
        )}
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
