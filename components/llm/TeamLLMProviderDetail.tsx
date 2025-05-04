import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Descriptions,
  Divider,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd';
import React, { useEffect, useState } from 'react';
import { LLMModel, LLMProvider } from '../../models/llm';
import {
  createTeamProviderModel,
  deleteTeamProviderModel,
  fetchTeamProviderModels,
  updateTeamLLMProvider,
  updateTeamProviderModel
} from '../../services/teamService';
import LLMModelForm from './LLMModelForm';
import LLMProviderForm from './LLMProviderForm';

const { Title, Text } = Typography;

interface TeamLLMProviderDetailProps {
  teamId: string;
  provider: LLMProvider;
  canManageModels: boolean;
  onBackToList: () => void;
  onProviderUpdated: () => void;
}

const TeamLLMProviderDetail: React.FC<TeamLLMProviderDetailProps> = ({
  teamId,
  provider,
  canManageModels,
  onBackToList,
  onProviderUpdated
}) => {
  const [models, setModels] = useState<LLMModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isEditProviderModalVisible, setIsEditProviderModalVisible] = useState(false);
  const [editingModel, setEditingModel] = useState<LLMModel | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const fetchModels = React.useCallback(async () => {
    if (!provider?.id) return;
    if (!teamId) return;

    setLoading(true);
    try {
      const data = await fetchTeamProviderModels(teamId, provider.id);
      if (data) setModels(data);
    } catch (error: unknown) {
      console.error('Error fetching models:', error);
      message.error('Failed to load models');
    } finally {
      setLoading(false);
    }
  }, [teamId, provider?.id]);
  useEffect(() => {
    fetchModels();

  }, [fetchModels]);



  const handleAddModel = async (values: any) => {
    if (!provider?.id) return;

    setActionLoading(true);
    try {
      await createTeamProviderModel(teamId, provider.id, values);
      message.success('Model added successfully');
      setIsAddModalVisible(false);
      fetchModels();
    } catch (error: unknown) {
      console.error('Error adding model:', error);
      message.error('Failed to add model');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditModel = async (values: any) => {
    if (!provider?.id || !editingModel?.id) return;

    setActionLoading(true);
    try {
      await updateTeamProviderModel(teamId, provider.id, editingModel.id, values);
      message.success('Model updated successfully');
      setIsEditModalVisible(false);
      setEditingModel(null);
      fetchModels();
    } catch (error: unknown) {
      console.error('Error updating model:', error);
      message.error('Failed to update model');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    if (!provider?.id) return;

    try {
      await deleteTeamProviderModel(teamId, provider.id, modelId);
      message.success('Model deleted successfully');
      fetchModels();
    } catch (error: unknown) {
      console.error('Error deleting model:', error);
      message.error('Failed to delete model');
    }
  };

  const handleEditProvider = async (values: any) => {
    if (!provider?.id) return;

    setActionLoading(true);
    try {
      await updateTeamLLMProvider(teamId, provider.id, values);
      message.success('Provider updated successfully');
      setIsEditProviderModalVisible(false);
      onProviderUpdated(); // Call the callback to refresh provider data
    } catch (error: unknown) {
      console.error('Error updating provider:', error);
      message.error('Failed to update provider');
    } finally {
      setActionLoading(false);
    }
  };

  const getModelTypeTag = (type: string) => {
    let color = '';
    let label = type;

    switch (type) {
      case 'chat':
        color = 'green';
        label = 'Chat';
        break;
      case 'text':
        color = 'blue';
        label = 'Text';
        break;
      case 'embedding':
        color = 'purple';
        label = 'Embedding';
        break;
      case 'image':
        color = 'orange';
        label = 'Image';
        break;
      default:
        color = 'default';
        break;
    }

    return <Tag color={color}>{label}</Tag>;
  };

  const columns = [
    {
      title: 'Model',
      key: 'name',
      render: (record: LLMModel) => (
        <Space direction="vertical" size={0}>
          <Space>
          
            <Typography.Text strong>
              {record.name}
            </Typography.Text>
          </Space>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            {record.name}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'modelType',
      key: 'modelType',
      render: getModelTypeTag,
    },
    {
      title: 'Context Window',
      dataIndex: 'contextWindow',
      key: 'contextWindow',
      render: (value: number) => value ? `${value.toLocaleString()} tokens` : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: LLMModel) => (
        canManageModels ? (
          <Space size="small">
            <Tooltip title="Edit Model">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditingModel(record);
                  setIsEditModalVisible(true);
                }}
              />
            </Tooltip>


            <Popconfirm
              title="Delete this model?"
              description="This action cannot be undone."
              onConfirm={() => handleDeleteModel(record.id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
  ];

 
  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={onBackToList}>
              Back to providers
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              Provider: {provider.name}
            </Title>
          </Space>
          {canManageModels && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setIsEditProviderModalVisible(true)}
            >
              Edit Provider
            </Button>
          )}
        </div>

        <Descriptions bordered column={2}>
          <Descriptions.Item label="Name">{provider.name}</Descriptions.Item>
          <Descriptions.Item label="Type">{provider.providerType}</Descriptions.Item>
          <Descriptions.Item label="Endpoint URL">{provider.endpointUrl}</Descriptions.Item>
     
          <Descriptions.Item label="Description" span={2}>{provider.description || 'No description'}</Descriptions.Item>
        </Descriptions>

        <Divider />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4}>Models</Title>
          {canManageModels && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalVisible(true)}
            >
              Add Model
            </Button>
          )}
        </div>

        <Table
          dataSource={models}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* Add Model Modal */}
      <Modal
        title="Add Model"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
        width={700}
      >
        <LLMModelForm
          onSubmit={handleAddModel}
          isLoading={actionLoading}
          providerId={provider?.id}
          providerType={provider?.providerType}
          teamContext={teamId}
        />
      </Modal>

      {/* Edit Model Modal */}
      {editingModel && (
        <Modal
          title="Edit Model"
          open={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          footer={null}
          width={700}
        >
          <LLMModelForm
            initialValues={editingModel}
            onSubmit={handleEditModel}
            isLoading={actionLoading}
            providerId={provider?.id}
            providerType={provider?.providerType}
            teamContext={teamId}
          />
        </Modal>
      )}

      {/* Edit Provider Modal */}
      <Modal
        title="Edit Provider"
        open={isEditProviderModalVisible}
        onCancel={() => setIsEditProviderModalVisible(false)}
        footer={null}
        width={700}
      >
        <LLMProviderForm
          initialValues={provider}
          onSubmit={handleEditProvider}
          isLoading={actionLoading}
          teamContext={teamId}
        />
      </Modal>
    </div>
  );
};

export default TeamLLMProviderDetail;
