import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input,
  Space, Typography, message, Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import { fetchAllKnowledge, createKnowledge, updateKnowledge, deleteKnowledge } from '../../services/knowledgeService';
import { IKnowledge } from "../../types/IKnowledge";
import KnowledgeForm from '../../components/knowledge/KnowledgeForm';

const { Title, Text } = Typography;

export default function KnowledgeList() {
  const [knowledgeItems, setKnowledgeItems] = useState<IKnowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  // Load knowledge items on component mount
  useEffect(() => {
    loadKnowledgeItems();
  }, []);

  async function loadKnowledgeItems() {
    setLoading(true);
    const items = await fetchAllKnowledge();
    setKnowledgeItems(items);
    setLoading(false);
  }

  const showModal = (record?: IKnowledge) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        name: record.name,
        description: record.description,
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      message.error('You must be logged in to create or edit knowledge items');
      return;
    }

    try {
      const values = await form.validateFields();
      
      let success = false;
      
      if (editingId) {
        // Update existing knowledge
        const updated = await updateKnowledge(editingId, values);
        success = !!updated;
        if (success) message.success('Knowledge updated successfully');
      } else {
        // Create new knowledge
        const created = await createKnowledge(values);
        success = !!created;
        if (success) message.success('Knowledge created successfully');
      }

      if (success) {
        loadKnowledgeItems();
        setIsModalVisible(false);
        form.resetFields();
      } else {
        message.error(`Failed to ${editingId ? 'update' : 'create'} knowledge`);
      }
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteKnowledge(id);
    if (success) {
      message.success('Knowledge deleted successfully');
      loadKnowledgeItems();
    } else {
      message.error('Failed to delete knowledge');
    }
  };

  const columns = [
    // {
    //   title: 'ID',
    //   dataIndex: 'id',
    //   key: 'id',
    //   ellipsis: true,
    //   width: '20%',
    // },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (text: string, record: IKnowledge) => (
        <a onClick={() => router.push(`/knowledge/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (createdBy: { name: string }) => createdBy?.name || 'Unknown',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      render: (_: any, record: IKnowledge) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          />
          <Button
            type="text"
            icon={<FileOutlined />}
            onClick={() => router.push(`/knowledge/${record.id}/files`)}
          />
          <Popconfirm
            title="Are you sure you want to delete this item?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="Knowledge Management">
      <div style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2}>Knowledge Management</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
              disabled={!isAuthenticated}
            >
              Add Knowledge
            </Button>
          </div>
          
          {!isAuthenticated && (
            <div style={{ marginBottom: 16 }}>
              <Text type="warning">
                Please log in to create new knowledge items.
              </Text>
            </div>
          )}
          
          <Table
            columns={columns}
            dataSource={knowledgeItems}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
          
          <KnowledgeForm
            form={form}
            visible={isModalVisible}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            isEditing={!!editingId}
            user={user}
          />
        </Space>
      </div>
    </MainLayout>
  );
}
