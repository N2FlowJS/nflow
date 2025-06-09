import { DeleteOutlined, EditOutlined, FileOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Form, Input, message, Popconfirm, Row, Select, Space, Spin, Typography } from 'antd';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import KnowledgeForm from '../../components/knowledge/KnowledgeForm';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../locale';
import { IKnowledge } from '../../models/IKnowledge';
import { createKnowledge, deleteKnowledge, fetchAllKnowledge, updateKnowledge } from '../../services/knowledgeService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function KnowledgeList() {
  console.log('Knowledge page rendered');

  const [knowledgeItems, setKnowledgeItems] = useState<IKnowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterCreator, setFilterCreator] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { messages } = useLocale();

  const loadKnowledgeItems = React.useCallback(
    async function loadKnowledgeItems() {
      setLoading(true);
      try {
        // Build query params for filtering
        const params = new URLSearchParams();
        if (searchText) params.append('search', searchText);
        if (filterCreator) params.append('createdBy', filterCreator);

        const queryString = params.toString() ? `?${params.toString()}` : '';
        const items = await fetchAllKnowledge(queryString);
        setKnowledgeItems(items);
      } catch (error) {
        console.error('Error loading knowledge items:', error);
        message.error('Failed to load knowledge items');
      } finally {
        setLoading(false);
      }
    },
    [filterCreator, searchText]
  );
  // Load knowledge items on component mount
  useEffect(() => {
    loadKnowledgeItems();
  }, [loadKnowledgeItems]);

  const handleSearch = () => {
    loadKnowledgeItems();
  };

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

  const renderCardView = () => (
    <Row gutter={[16, 16]}>
      {knowledgeItems.length === 0 && !loading ? (
        <Col span={24}>
          <Empty description={messages.knowledgeList.noKnowledgeItems || 'No knowledge items found'} />
        </Col>
      ) : (
        knowledgeItems.map((item) => (
          <Col xs={24} sm={12} md={8} lg={8} xl={6} key={item.id}>
            <Card
              hoverable
              style={{ height: '100%' }}
              actions={[
                <Button type="text" icon={<EditOutlined />} onClick={() => showModal(item)} key="edit" />,
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
                  key="delete">
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>,
              ]}>
              <Card.Meta
                title={<a onClick={() => router.push(`/knowledge/${item.id}`)}>{item.name}</a>}
                description={
                  <>
                    <Paragraph ellipsis={{ rows: 3 }}>{item.description}</Paragraph>
                    <Text type="secondary">
                      {messages.knowledgeList.createdBy}: {item.createdBy?.name || 'Unknown'}
                    </Text>
                  </>
                }
              />
            </Card>
          </Col>
        ))
      )}
    </Row>
  );

  return (
    <MainLayout title={messages.knowledgeList.knowledgeManagement}>
      <div style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Title level={2}>{messages.knowledgeList.knowledgeManagement}</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} disabled={!isAuthenticated}>
              {messages.knowledgeList.addKnowledge}
            </Button>
          </div>

          {!isAuthenticated && (
            <div style={{ marginBottom: 16 }}>
              <Text type="warning">{messages.knowledgeList.loginRequired}</Text>
            </div>
          )}

          <Space style={{ marginBottom: '16px', width: '100%' }}>
            <Input
              placeholder={messages.knowledgeList.searchPlaceholder || 'Search knowledge...'}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              suffix={<SearchOutlined style={{ cursor: 'pointer' }} onClick={handleSearch} />}
              onPressEnter={handleSearch}
            />

            <Select
              placeholder={messages.knowledgeList.creatorPlaceholder || 'Filter by creator'}
              allowClear
              style={{ width: 150 }}
              onChange={(value) => setFilterCreator(value)}>
              {knowledgeItems
                .map((item) => item.createdBy)
                .filter((creator, index, self) => creator && self.findIndex((c) => c && c.id === creator.id) === index)
                .map(
                  (creator) =>
                    creator && (
                      <Option key={creator.id} value={creator.id}>
                        {creator.name}
                      </Option>
                    )
                )}
            </Select>

            <Button onClick={handleSearch} type="primary">
              {messages.knowledgeList.filter || 'Filter'}
            </Button>
          </Space>

          <div style={{ minHeight: '200px' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <Spin size="large" />
              </div>
            ) : (
              renderCardView()
            )}
          </div>

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
