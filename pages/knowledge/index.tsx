import { DeleteOutlined, EditOutlined, FileOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  message, Popconfirm,
  Space,
  Table,
  Typography,
  Card,
  Row,
  Col
} from 'antd';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import KnowledgeForm from '../../components/knowledge/KnowledgeForm';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { IKnowledge } from "../../models/IKnowledge";
import { createKnowledge, deleteKnowledge, fetchAllKnowledge, updateKnowledge } from '../../services/knowledgeService';
import { useLocale } from '../../locale';
import { useScreenSize } from '../../hooks/useScreenSize';

const { Title, Text, Paragraph } = Typography;

export default function KnowledgeList() {
  const [knowledgeItems, setKnowledgeItems] = useState<IKnowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { messages } = useLocale();
  const { isMobile } = useScreenSize();

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
    } catch (error: unknown) {
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

    {
      title: messages.knowledgeList.name,
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (text: string, record: IKnowledge) => (
        <a onClick={() => router.push(`/knowledge/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: messages.knowledgeList.description,
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: messages.knowledgeList.createdBy,
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (createdBy: { name: string }) => createdBy?.name || 'Unknown',
    },
    {
      title: messages.knowledgeList.actions,
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
            title={messages.knowledgeList.deleteConfirmation}
            onConfirm={() => handleDelete(record.id)}
            okText={messages.knowledgeList.yes}
            cancelText={messages.knowledgeList.no}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderMobileView = () => (
    <Row gutter={[16, 16]}>
      {knowledgeItems.map(item => (
        <Col xs={24} sm={12} key={item.id}>
          <Card
            actions={[
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => showModal(item)}
                key="edit"
              />,
              <Button
                type="text"
                icon={<FileOutlined />}
                onClick={() => router.push(`/knowledge/${item.id}/files`)}
                key="files"
              />,
              <Popconfirm
                title={messages.knowledgeList.deleteConfirmation}
                onConfirm={() => handleDelete(item.id)}
                okText={messages.knowledgeList.yes}
                cancelText={messages.knowledgeList.no}
                key="delete"
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>,
            ]}
          >
            <Card.Meta
              title={<a onClick={() => router.push(`/knowledge/${item.id}`)}>{item.name}</a>}
              description={
                <>
                  <Paragraph ellipsis={{ rows: 2 }}>{item.description}</Paragraph>
                  <Text type="secondary">{messages.knowledgeList.createdBy}: {item.createdBy?.name || 'Unknown'}</Text>
                </>
              }
            />
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <MainLayout title={messages.knowledgeList.knowledgeManagement}>
      <div style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap:'wrap' }}>
            <Title level={2}>{messages.knowledgeList.knowledgeManagement}</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
              disabled={!isAuthenticated}
            >
              {messages.knowledgeList.addKnowledge}
            </Button>
          </div>

          {!isAuthenticated && (
            <div style={{ marginBottom: 16 }}>
              <Text type="warning">
                {messages.knowledgeList.loginRequired}
              </Text>
            </div>
          )}

          {isMobile ? renderMobileView() : (
            <Table
              columns={columns}
              dataSource={knowledgeItems}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          )}

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
