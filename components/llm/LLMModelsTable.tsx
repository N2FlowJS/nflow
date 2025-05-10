import { DeleteOutlined, EditOutlined, PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Modal, Popconfirm, Space, Table, Tag, Tooltip, Typography, message, Spin } from 'antd';
import React, { useState } from 'react';
import { LLMModel, LLMProvider } from '../../models/llm';
import { deleteLLMModel, fetchModelsByProvider, updateLLMModel } from '../../services/llmService';
import LLMModelForm from './LLMModelForm';

const { Title } = Typography;

interface LLMModelsTableProps {
  models: LLMModel[];
  provider: LLMProvider;
  loading: boolean;
  onRefresh: () => void;
}

const LLMModelsTable: React.FC<LLMModelsTableProps> = ({ models, provider, loading, onRefresh }) => {
  const [editingModel, setEditingModel] = useState<LLMModel | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [fetchedModels, setFetchedModels] = useState<any[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isQuickAddModalVisible, setIsQuickAddModalVisible] = useState(false);
  const [fetchingModels, setFetchingModels] = useState(false);

  const handleEdit = (model: LLMModel) => {
    setEditingModel(model);
    setIsEditModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(true);
      await deleteLLMModel(id);
      message.success('Model deleted successfully');
      onRefresh();
    } catch (error: unknown) {
      console.error('Delete model error:', error);
      message.error('Failed to delete model');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingModel?.id) return;

    try {
      await updateLLMModel(editingModel.id, values);
      setIsEditModalVisible(false);
      message.success('Model updated successfully');
      onRefresh();
    } catch (error: unknown) {
      console.error('Update model error:', error);
      message.error('Failed to update model');
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
      // Implementation would depend on your API structure
      // This is a placeholder for the actual implementation
      // You would call your API to add these models

      message.success(`${selectedModels.length} models added successfully`);
      setIsQuickAddModalVisible(false);
      setSelectedModels([]);
      onRefresh();
    } catch (error) {
      console.error('Error adding models:', error);
      message.error('Failed to add models');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: 'Model',
      key: 'name',
      render: (record: LLMModel) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Typography.Text strong>{record.name}</Typography.Text>
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
      title: 'Context',
      dataIndex: 'contextWindow',
      key: 'contextWindow',
      render: (value: number) => (value ? `${value.toLocaleString()} tokens` : '-'),
    },

    {
      title: 'Actions',
      key: 'actions',
      render: (record: LLMModel) => (
        <Space size="small">
          <Tooltip title="Edit Model">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>

          <Popconfirm title="Delete this model?" description="This action cannot be undone." onConfirm={() => handleDelete(record.id)} okText="Delete" cancelText="Cancel" okButtonProps={{ danger: true }}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const quickAddModalTitle = provider.providerType === 'openai' ? 'Quick Add OpenAI Models' : 'Quick Add Models';

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4}>Models for {provider.name}</Title>
        <Space>
          {['openai', 'openai-compatible'].includes(provider.providerType) && (
            <Button type="primary" icon={<ThunderboltOutlined />} onClick={handleFetchModels} ghost>
              Quick Add Models
            </Button>
          )}
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalVisible(true)}>
            Add Model
          </Button>
        </Space>
      </div>

      <Table dataSource={models} columns={columns} rowKey="id" loading={loading} pagination={false} />

      {/* Edit Model Modal */}
      <Modal title="Edit LLM Model" open={isEditModalVisible} onCancel={() => setIsEditModalVisible(false)} footer={null} width={700}>
        {editingModel && <LLMModelForm initialValues={editingModel} providerId={provider.id} onSubmit={handleEditSubmit} isLoading={actionLoading} />}
      </Modal>

      {/* Add Model Modal */}
      <Modal title="Add LLM Model" open={isAddModalVisible} onCancel={() => setIsAddModalVisible(false)} footer={null} width={700}>
        <LLMModelForm
          providerId={provider.id}
          onSubmit={async () => {
            try {
              // Will be implemented by integrating with API
              message.success('Model added successfully');
              setIsAddModalVisible(false);
              onRefresh();
            } catch {
              message.error('Failed to add model');
            }
          }}
        />
      </Modal>

      {/* Quick Add Models Modal */}
      <Modal title={quickAddModalTitle} open={isQuickAddModalVisible} onCancel={() => setIsQuickAddModalVisible(false)} okText="Add Selected Models" okButtonProps={{ disabled: selectedModels.length === 0, loading: actionLoading }} onOk={handleQuickAddModels} width={700}>
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
                  },
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
                    render: (model: any) => <Tag color={model.id.includes('embedding') ? 'purple' : 'green'}>{model.id.includes('embedding') ? 'Embedding' : 'Chat'}</Tag>,
                  },
                ]}
              />
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default LLMModelsTable;
