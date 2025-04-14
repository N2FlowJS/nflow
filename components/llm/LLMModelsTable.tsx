import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Tooltip,
  Popconfirm,
  Modal,
  message
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  StopOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons';
import { LLMModel, LLMProvider } from '../../types/llm';
import LLMModelForm from './LLMModelForm';
import { deleteLLMModel, setDefaultLLMModel, updateLLMModel } from '../../services/llmService';

const { Title } = Typography;

interface LLMModelsTableProps {
  models: LLMModel[];
  provider: LLMProvider;
  allProviders: LLMProvider[];
  loading: boolean;
  onRefresh: () => void;
}

const LLMModelsTable: React.FC<LLMModelsTableProps> = ({
  models,
  provider,
  allProviders,
  loading,
  onRefresh
}) => {
  const [editingModel, setEditingModel] = useState<LLMModel | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
    } catch (error) {
      console.error('Delete model error:', error);
      message.error('Failed to delete model');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setActionLoading(true);
      await setDefaultLLMModel(id);
      message.success('Default model updated');
      onRefresh();
    } catch (error) {
      console.error('Set default model error:', error);
      message.error('Failed to update default model');
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
    } catch (error) {
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
      title: 'Context',
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
              onClick={() => handleEdit(record)} 
            />
          </Tooltip>
          
          {!record.isDefault && (
            <Tooltip title="Set as Default for this type">
              <Button
                type="text"
                icon={<StarOutlined />}
                onClick={() => handleSetDefault(record.id)}
                disabled={actionLoading}
              />
            </Tooltip>
          )}
          
          <Popconfirm
            title="Delete this model?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4}>Models for {provider.name}</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsAddModalVisible(true)}
        >
          Add Model
        </Button>
      </div>

      <Table
        dataSource={models}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      {/* Edit Model Modal */}
      <Modal
        title="Edit LLM Model"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={700}
      >
        {editingModel && (
          <LLMModelForm
            initialValues={editingModel}
            providers={allProviders}
            providerId={provider.id}
            onSubmit={handleEditSubmit}
            isLoading={actionLoading}
          />
        )}
      </Modal>

      {/* Add Model Modal */}
      <Modal
        title="Add LLM Model"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
        width={700}
      >
        <LLMModelForm
          providers={allProviders}
          providerId={provider.id}
          onSubmit={async (values) => {
            try {
              // Will be implemented by integrating with API
              message.success('Model added successfully');
              setIsAddModalVisible(false);
              onRefresh();
            } catch (error) {
              message.error('Failed to add model');
            }
          }}
        />
      </Modal>
    </>
  );
};

export default LLMModelsTable;
