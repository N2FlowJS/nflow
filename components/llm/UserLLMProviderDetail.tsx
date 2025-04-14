import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Modal,
  message,
  Popconfirm,
  Tooltip,
  Descriptions,
  Divider
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  StopOutlined,
  StarOutlined,
  StarFilled,
  ApiOutlined
} from '@ant-design/icons';
import { LLMModel, LLMProvider } from '../../types/llm';
import LLMModelForm from './LLMModelForm';
import {
  fetchUserProviderModels,
  createUserProviderModel,
  updateUserProviderModel,
  deleteUserProviderModel
} from '../../services/llmService';

const { Title, Text } = Typography;

interface UserLLMProviderDetailProps {
  userId: string;
  provider: LLMProvider;
  onBackToList: () => void;
  onProviderUpdated: () => void;
}

const UserLLMProviderDetail: React.FC<UserLLMProviderDetailProps> = ({
  userId,
  provider,
  onBackToList,
  onProviderUpdated
}) => {
  const [models, setModels] = useState<LLMModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddModelModalVisible, setIsAddModelModalVisible] = useState(false);
  const [isEditModelModalVisible, setIsEditModelModalVisible] = useState(false);
  const [editingModel, setEditingModel] = useState<LLMModel | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (provider) {
      fetchModels();
    }
  }, [provider]);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const data = await fetchUserProviderModels(userId, provider.id);
      setModels(data || []);
    } catch (error) {
      console.error('Error fetching models:', error);
      message.error('Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const handleAddModel = async (values: any) => {
    setActionLoading(true);
    try {
      await createUserProviderModel(userId, provider.id, values);
      message.success('Model added successfully');
      setIsAddModelModalVisible(false);
      fetchModels();
    } catch (error) {
      console.error('Error adding model:', error);
      message.error('Failed to add model');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditModel = async (values: any) => {
    if (!editingModel) return;
    
    setActionLoading(true);
    try {
      await updateUserProviderModel(userId, provider.id, editingModel.id, values);
      message.success('Model updated successfully');
      setIsEditModelModalVisible(false);
      fetchModels();
    } catch (error) {
      console.error('Error updating model:', error);
      message.error('Failed to update model');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    setActionLoading(true);
    try {
      await deleteUserProviderModel(userId, provider.id, modelId);
      message.success('Model deleted successfully');
      fetchModels();
    } catch (error) {
      console.error('Error deleting model:', error);
      message.error('Failed to delete model');
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
            {record.isDefault && (
              <Tooltip title="Default Model for this type">
                <StarFilled style={{ color: '#faad14' }} />
              </Tooltip>
            )}
            <Typography.Text strong>
              {record.displayName || record.name}
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
      title: 'Status',
      key: 'status',
      render: (record: LLMModel) => (
        <Tag color={record.isActive ? 'success' : 'error'} icon={record.isActive ? <CheckCircleOutlined /> : <StopOutlined />}>
          {record.isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: LLMModel) => (
        <Space size="small">
          <Tooltip title="Edit Model">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => {
                setEditingModel(record);
                setIsEditModelModalVisible(true);
              }} 
            />
          </Tooltip>
          
          {!record.isDefault && (
            <Tooltip title="Set as Default for this type">
              <Button
                type="text"
                icon={<StarOutlined />}
                onClick={() => handleSetDefault(record)}
                disabled={actionLoading}
              />
            </Tooltip>
          )}
          
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
      ),
    },
  ];

  const handleSetDefault = async (model: LLMModel) => {
    setActionLoading(true);
    try {
      await updateUserProviderModel(userId, provider.id, model.id, {
        isDefault: true
      });
      message.success('Default model updated');
      fetchModels();
    } catch (error) {
      console.error('Error setting default model:', error);
      message.error('Failed to update default model');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button onClick={onBackToList} style={{ marginRight: 16 }}>
          Back to Providers
        </Button>
        <Title level={3}>{provider.name} Models</Title>
      </div>

      <Card>
        <Descriptions title="Provider Details" bordered column={1}>
          <Descriptions.Item label="Type">
            {provider.providerType.toUpperCase()}
          </Descriptions.Item>
          <Descriptions.Item label="Endpoint URL">
            {provider.endpointUrl}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={provider.isActive ? 'success' : 'error'}>
              {provider.isActive ? 'Active' : 'Inactive'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {provider.description || 'No description'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Divider />

      <Card
        title={<Title level={4}>Models</Title>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddModelModalVisible(true)}
          >
            Add Model
          </Button>
        }
      >
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
        title="Add New Model"
        open={isAddModelModalVisible}
        onCancel={() => setIsAddModelModalVisible(false)}
        footer={null}
        width={700}
      >
        <LLMModelForm
          providerId={provider.id}
          onSubmit={handleAddModel}
          isLoading={actionLoading}
          providers={[provider]} // Add the current provider as the only option
        />
      </Modal>

      {/* Edit Model Modal */}
      {editingModel && (
        <Modal
          title="Edit Model"
          open={isEditModelModalVisible}
          onCancel={() => setIsEditModelModalVisible(false)}
          footer={null}
          width={700}
        >
          <LLMModelForm
            initialValues={editingModel}
            providerId={provider.id}
            onSubmit={handleEditModel}
            isLoading={actionLoading}
            providers={[provider]} // Add the current provider as the only option
          />
        </Modal>
      )}
    </div>
  );
};

export default UserLLMProviderDetail;
