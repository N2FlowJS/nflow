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
  Badge,
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
  ExperimentOutlined,
  ApiOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { LLMProvider } from '../../types/llm';
import LLMProviderForm from './LLMProviderForm';
import { deleteLLMProvider, setDefaultLLMProvider, updateLLMProvider } from '../../services/llmService';

const { Title } = Typography;

interface LLMProvidersTableProps {
  providers: LLMProvider[];
  loading: boolean;
  onRefresh: () => void;
}

const LLMProvidersTable: React.FC<LLMProvidersTableProps> = ({
  providers,
  loading,
  onRefresh
}) => {
  const router = useRouter();
  const [editingProvider, setEditingProvider] = useState<LLMProvider | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleEdit = (provider: LLMProvider) => {
    setEditingProvider(provider);
    setIsEditModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(true);
      await deleteLLMProvider(id);
      message.success('Provider deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Delete provider error:', error);
      message.error('Failed to delete provider');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setActionLoading(true);
      await setDefaultLLMProvider(id);
      message.success('Default provider updated');
      onRefresh();
    } catch (error) {
      console.error('Set default provider error:', error);
      message.error('Failed to update default provider');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingProvider?.id) return;
    
    try {
      await updateLLMProvider(editingProvider.id, values);
      setIsEditModalVisible(false);
      message.success('Provider updated successfully');
      onRefresh();
    } catch (error) {
      console.error('Update provider error:', error);
      message.error('Failed to update provider');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: LLMProvider) => (
        <Space>
          {record.isDefault && (
            <Tooltip title="Default Provider">
              <StarFilled style={{ color: '#faad14' }} />
            </Tooltip>
          )}
          <span>{text}</span>
          {!record.isActive && (
            <Tag color="red">Disabled</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'providerType',
      key: 'providerType',
      render: (type: string) => {
        let color = '';
        let icon = null;
        let label = type;

        switch (type) {
          case 'openai':
            color = 'green';
            icon = <ApiOutlined />;
            label = 'OpenAI';
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
      },
    },
    {
      title: 'Models',
      dataIndex: 'models',
      key: 'models',
      render: (models: any[]) => (
        <Badge count={models?.length || 0} overflowCount={99} style={{ backgroundColor: '#1890ff' }} />
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: LLMProvider) => (
        <Tag color={record.isActive ? 'success' : 'error'} icon={record.isActive ? <CheckCircleOutlined /> : <StopOutlined />}>
          {record.isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: LLMProvider) => (
        <Space size="small">
          <Tooltip title="Edit Provider">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)} 
            />
          </Tooltip>
          
          {!record.isDefault && (
            <Tooltip title="Set as Default">
              <Button
                type="text"
                icon={<StarOutlined />}
                onClick={() => handleSetDefault(record.id)}
                disabled={actionLoading}
              />
            </Tooltip>
          )}
          
          <Tooltip title="View Models">
            <Button
              type="text"
              icon={<ApiOutlined />}
              onClick={() => router.push(`/admin/llm/providers/${record.id}`)}
            />
          </Tooltip>
          
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
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4}>LLM Providers</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push('/admin/llm/providers/new')}
        >
          Add Provider
        </Button>
      </div>

      <Table
        dataSource={providers}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      {/* Edit Provider Modal */}
      <Modal
        title="Edit LLM Provider"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={700}
      >
        {editingProvider && (
          <LLMProviderForm
            initialValues={editingProvider}
            onSubmit={handleEditSubmit}
            isLoading={actionLoading}
          />
        )}
      </Modal>
    </>
  );
};

export default LLMProvidersTable;
