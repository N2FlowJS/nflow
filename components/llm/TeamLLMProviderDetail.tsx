import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ThunderboltOutlined
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
  Typography,
  Spin
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
import { fetchModelsByProvider } from '../../services/llmService';
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
  const [fetchedModels, setFetchedModels] = useState<any[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isQuickAddModalVisible, setIsQuickAddModalVisible] = useState(false);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [batchActionLoading, setBatchActionLoading] = useState(false);

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

  const handleFetchModels = async () => {
    if (!['openai', 'openai-compatible'].includes(provider.providerType)) {
      message.warning('Quick add is only available for OpenAI or OpenAI-compatible providers.');
      return;
    }

    setFetchingModels(true);
    setIsQuickAddModalVisible(true);
    try {
      const filteredModels = await fetchModelsByProvider(
        provider.id
      );
      setFetchedModels(filteredModels);
    } catch (error) {
      console.error('Error fetching models:', error);
      message.error('Failed to fetch models from OpenAI');
    } finally {
      setFetchingModels(false);
    }
  };

  const handleQuickAddModels = async () => {
    setActionLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const modelId of selectedModels) {
        try {
          const modelType = modelId.includes('embedding') ? 'embedding' : 'chat';
          const modelData = {
            name: modelId,
            modelType: modelType,
            providerId: provider.id,
            // Add appropriate context window size based on model
            contextWindow: modelId.includes('gpt-4') ? 8192 : 
                          (modelId.includes('gpt-3.5-turbo-16k') ? 16384 : 4096)
          };
          
          await createTeamProviderModel(teamId, provider.id, modelData as any);
          successCount++;
        } catch (err) {
          console.error(`Error adding model ${modelId}:`, err);
          errorCount++;
        }
      }

      if (successCount > 0) {
        message.success(`Successfully added ${successCount} models`);
      }
      
      if (errorCount > 0) {
        message.warning(`Failed to add ${errorCount} models`);
      }
      
      setIsQuickAddModalVisible(false);
      setSelectedModels([]);
      fetchModels();
    } catch (error) {
      console.error('Error adding models:', error);
      message.error('Failed to add models');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBatchDelete = async () => {
    if (!provider?.id || selectedRowKeys.length === 0) return;
    
    setBatchActionLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (const modelId of selectedRowKeys) {
        try {
          await deleteTeamProviderModel(teamId, provider.id, modelId as string);
          successCount++;
        } catch (err) {
          console.error(`Error deleting model ${modelId}:`, err);
          errorCount++;
        }
      }
      
      if (successCount > 0) {
        message.success(`Successfully deleted ${successCount} models`);
      }
      
      if (errorCount > 0) {
        message.warning(`Failed to delete ${errorCount} models`);
      }
      
      setSelectedRowKeys([]);
      fetchModels();
    } catch (error) {
      console.error('Error in batch delete:', error);
      message.error('Failed to delete selected models');
    } finally {
      setBatchActionLoading(false);
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

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    }
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

  const quickAddModalTitle = provider.providerType === 'openai' ? 'Quick Add OpenAI Models' : 'Quick Add Models';

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
          <Space>
            {canManageModels && selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`Delete ${selectedRowKeys.length} selected models?`}
                description="This action cannot be undone."
                onConfirm={handleBatchDelete}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true, loading: batchActionLoading }}
              >
                <Button 
                  type="primary" 
                  danger 
                  icon={<DeleteOutlined />}
                  loading={batchActionLoading}
                >
                  Delete Selected ({selectedRowKeys.length})
                </Button>
              </Popconfirm>
            )}
            {canManageModels && (
              <Space>
                {['openai', 'openai-compatible'].includes(provider.providerType) && (
                  <Button
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    onClick={handleFetchModels}
                    ghost
                  >
                    Quick Add Models
                  </Button>
                )}
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddModalVisible(true)}
                >
                  Add Model
                </Button>
              </Space>
            )}
          </Space>
        </div>

        <Table
          dataSource={models}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          rowSelection={canManageModels ? rowSelection : undefined}
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

      {/* Quick Add Models Modal */}
      <Modal
        title={quickAddModalTitle}
        open={isQuickAddModalVisible}
        onCancel={() => setIsQuickAddModalVisible(false)}
        okText="Add Selected Models"
        okButtonProps={{ disabled: selectedModels.length === 0, loading: actionLoading }}
        onOk={handleQuickAddModels}
        width={700}
      >
        {fetchingModels ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <Spin tip="Fetching available models..." />
          </div>
        ) : (
          <>
            <p>Select models you want to add to your provider:</p>
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              <Table
                dataSource={fetchedModels}
                rowKey="id"
                pagination={false}
                rowSelection={{
                  type: 'checkbox',
                  onChange: (selectedRowKeys) => {
                    setSelectedModels(selectedRowKeys as string[]);
                  }
                }}
                columns={[
                  {
                    title: 'Model ID',
                    dataIndex: 'id',
                    key: 'id',
                  },
                  {
                    title: 'Type',
                    key: 'type',
                    render: (model: any) => (
                      <Tag color={model.id.includes('embedding') ? 'purple' : 'green'}>
                        {model.id.includes('embedding') ? 'Embedding' : 'Chat'}
                      </Tag>
                    )
                  }
                ]}
              />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default TeamLLMProviderDetail;
