import {
  AppstoreOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CommentOutlined,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  MessageOutlined,
  RobotOutlined,
  SaveOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Grid,
  Input,
  Modal,
  Row,
  Space,
  Spin,
  Statistic,
  Switch,
  Tag,
  Typography,
  message,
} from 'antd';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import ChatInterface from '../../../components/chat/ChatInterface';
import MainLayout from '../../../components/layout/MainLayout';
import { useAuth } from '../../../context/AuthContext';
import { useLocale } from '../../../locale/index';
import { IAgent } from '../../../models/IAgent';
import { deleteAgent, fetchAgent, updateAgent } from '../../../services/agentService'; // Use the new service

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function AgentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [agent, setAgent] = useState<IAgent | null>(null);
  const [flowConfig, setFlowConfig] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const { t } = useLocale('agentDetail');

  // Add conversation management state
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);

  // Add drawer state
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Get user info from auth hook
  const { user } = useAuth();

  // Fetch agent data
  const fetchAgentData = React.useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await fetchAgent(id as string); // Use the service

      if (data) {
        setAgent(data);
        setFlowConfig(data.flowConfig);
      }

      // Initialize form with agent data
      form.setFieldsValue({
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      });
    } catch (error: unknown) {
      console.error('Error fetching agent:', error);
      message.error('Failed to load agent details');
    } finally {
      setLoading(false);
    }
  }, [id, form]);

  useEffect(() => {
    fetchAgentData();
  }, [fetchAgentData]);

  // Handle form submission
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const updatedAgent = await updateAgent(id as string, values); // Use the service
      setAgent(updatedAgent);
      message.success('Agent updated successfully');
    } catch (error: unknown) {
      console.error('Error updating agent:', error);
      message.error('Failed to update agent');
    } finally {
      setSaving(false);
    }
  };

  // Handle agent deletion
  const confirmDelete = () => {
    Modal.confirm({
      title: t('deleteConfirmation.title'),
      content: t('deleteConfirmation.content'),
      okText: t('deleteConfirmation.okText'),
      okType: 'danger',
      cancelText: t('deleteConfirmation.cancelText'),
      onOk: async () => {
        try {
          await deleteAgent(id as string); // Use the service
          message.success(t('deleteSuccess'));
          router.push('/agent');
        } catch (error: unknown) {
          console.error('Error deleting agent:', error);
          message.error(t('deleteFailed'));
        }
      },
    });
  };

  // Handle conversation creation
  const handleConversationCreated = useCallback((conversationId: string) => {
    setCurrentConversationId(conversationId);
    console.log('New conversation created:', conversationId);
  }, []);

  // Handle conversation updates
  const handleConversationUpdated = useCallback((conversationId: string) => {
    // Optional: Update UI based on conversation updates if needed
    console.log('Conversation updated:', conversationId);
  }, []);

  // Add handler to reset conversation ID when ChatInterface starts a new chat
  const handleNewChatStarted = useCallback(() => {
    setCurrentConversationId(undefined);
    // Optionally reset other related states if necessary
  }, []);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Get the status tag with appropriate color
  const renderStatusTag = () => (
    <Tag color={agent?.isActive ? 'success' : 'error'} style={{ marginLeft: 4 }}>
      {agent?.isActive ? t('active') : t('inactive')}
    </Tag>
  );

  // Get owner tag with appropriate icon
  const renderOwnerTag = () => {
    if (agent?.ownerType === 'user') {
      return (
        <Tag style={{ marginLeft: 4 }} icon={<UserOutlined />} color="blue">
          {agent?.user?.name || t('personalAgent')}
        </Tag>
      );
    }
    return (
      <Tag style={{ marginLeft: 4 }} icon={<TeamOutlined />} color="gold">
        {agent?.team?.name || t('teamAgent')}
      </Tag>
    );
  };

  if (loading) {
    return (
      <MainLayout title={t('loadingAgent')}>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!agent && !loading) {
    return (
      <MainLayout title={t('agentNotFound')}>
        <Title level={4}>{t('agentNotFound')}</Title>
        <Button type="primary" onClick={() => router.push('/agent')}>
          {t('backToAgentsList')}
        </Button>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`${t('agent')}: ${agent?.name || t('detail')}`}>
      <div className="dashboard-container" style={{ padding: isMobile ? '12px' : '24px' }}>
        {/* Page Header with title and actions */}
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <Space align="center">
              <Avatar size={isMobile ? 48 : 64} icon={<RobotOutlined />} style={{ backgroundColor: '#1677ff' }} />
              <div>
                <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>
                  {agent?.name}
                </Title>
                <Space size={[0, 8]} wrap style={{ marginTop: 8, justifyContent: 'space-between' }}>
                  {renderStatusTag()}
                  {renderOwnerTag()}
                </Space>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<CommentOutlined />}
                onClick={() => setIsChatOpen(true)}
                size={isMobile ? 'middle' : 'large'}>
                {!isMobile && t('chatWithAgent')}
              </Button>
              <Button
                icon={<AppstoreOutlined />}
                onClick={() => router.push(`/canvas/${id}`)}
                size={isMobile ? 'middle' : 'large'}>
                {!isMobile && t('flowEditor')}
              </Button>
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={confirmDelete}
                size={isMobile ? 'middle' : 'large'}
              />
            </Space>
          </Col>
        </Row>

        {/* Statistic Cards Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Card className="dashboard-stat-card" bordered={false}>
              <Statistic
                title={
                  <Space>
                    <RobotOutlined /> {t('status')}
                  </Space>
                }
                value={agent?.isActive ? t('active') : t('inactive')}
                valueStyle={{
                  color: agent?.isActive ? '#52c41a' : '#ff4d4f',
                  fontSize: isMobile ? '20px' : '24px',
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="dashboard-stat-card" bordered={false}>
              <Statistic
                title={
                  <Space>
                    <UserOutlined /> {t('owner')}
                  </Space>
                }
                value={agent?.ownerType === 'user' ? agent?.user?.name : agent?.team?.name}
                valueStyle={{
                  color: agent?.ownerType === 'user' ? '#1677ff' : '#fa8c16',
                  fontSize: isMobile ? '20px' : '24px',
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="dashboard-stat-card" bordered={false}>
              <Statistic
                title={
                  <Space>
                    <CalendarOutlined /> {t('lastUpdated')}
                  </Space>
                }
                value={new Date(agent?.updatedAt || '').toLocaleDateString()}
                valueStyle={{
                  color: '#722ed1',
                  fontSize: isMobile ? '20px' : '24px',
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Area */}
        <Row gutter={[16, 16]}>
          {/* Agent Settings */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <InfoCircleOutlined />
                  {t('agentSettings')}
                </Space>
              }
              className="dashboard-card"
              style={{ marginBottom: 16 }}>
              <Form form={form} layout="vertical" size={isMobile ? 'middle' : 'large'}>
                <Form.Item
                  name="name"
                  label={<b>{t('form.name')}</b>}
                  rules={[{ required: true, message: t('form.nameRequired') }]}>
                  <Input />
                </Form.Item>
                <Form.Item
                  name="description"
                  label={<b>{t('form.description')}</b>}
                  rules={[{ required: true, message: t('form.descriptionRequired') }]}>
                  <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item name="isActive" label={<b>{t('form.status')}</b>} valuePropName="checked">
                  <Switch checkedChildren={t('active')} unCheckedChildren={t('inactive')} />
                </Form.Item>

                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={saving}
                  block
                  size={isMobile ? 'middle' : 'large'}>
                  {t('save')}
                </Button>
              </Form>
            </Card>
          </Col>

          {/* Creation Info */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <UserOutlined />
                  {t('creationInfo')}
                </Space>
              }
              className="dashboard-card"
              style={{ marginBottom: 16 }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">{t('createdBy')}</Text>
                  <div>
                    <Space>
                      <Avatar size="small" icon={<UserOutlined />} />
                      <Text strong>{agent?.createdBy?.name || t('unknownUser')}</Text>
                    </Space>
                  </div>
                </div>

                <Divider style={{ margin: '8px 0' }} />

                <div>
                  <Text type="secondary">{t('createdAt')}</Text>
                  <div>
                    <Space>
                      <CalendarOutlined />
                      <Text>{new Date(agent?.createdAt || '').toLocaleString()}</Text>
                    </Space>
                  </div>
                </div>

                <Divider style={{ margin: '8px 0' }} />

                <div>
                  <Text type="secondary">{t('lastUpdated')}</Text>
                  <div>
                    <Space>
                      <CalendarOutlined />
                      <Text>{new Date(agent?.updatedAt || '').toLocaleString()}</Text>
                    </Space>
                  </div>
                </div>
              </Space>
            </Card>

            {/* Flow Configuration Status */}
            <Card
              title={
                <Space>
                  <SettingOutlined />
                  {t('flowConfiguration')}
                </Space>
              }
              className="dashboard-card">
              {!flowConfig ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <InfoCircleOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
                  <Typography.Title level={4}>{t('noFlowConfigFound')}</Typography.Title>
                  <Typography.Text type="secondary" style={{ marginBottom: '16px', display: 'block' }}>
                    {t('flowConfigNeeded')}
                  </Typography.Text>
                  <Button type="primary" icon={<EditOutlined />} onClick={() => router.push(`/canvas/${id}`)}>
                    {t('goToFlowEditor')}
                  </Button>
                </div>
              ) : (
                <div>
                  <Typography.Text type="success" style={{ marginBottom: '16px', display: 'block' }}>
                    <CheckCircleOutlined /> {t('flowConfigPresent')}
                  </Typography.Text>
                  <Space>
                    <Button icon={<EditOutlined />} onClick={() => router.push(`/canvas/${id}`)}>
                      {t('editFlowConfig')}
                    </Button>
                    <Button type="primary" icon={<CommentOutlined />} onClick={() => setIsChatOpen(true)}>
                      {t('testChat')}
                    </Button>
                  </Space>
                </div>
              )}
            </Card>
          </Col>

          {/* Additional info can be added here */}
        </Row>
      </div>

      {/* Chat Modal */}
      <Modal
        title={
          <Space>
            <MessageOutlined />
            {t('chatWithAgent')}: {agent?.name}
          </Space>
        }
        open={isChatOpen}
        onCancel={() => setIsChatOpen(false)}
        width={isMobile ? '100%' : '50%'}
        footer={null}
        destroyOnClose
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        {!flowConfig ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px',
            }}>
            <InfoCircleOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
            <Typography.Title level={4}>{t('noFlowConfigFound')}</Typography.Title>
            <Typography.Text type="secondary" style={{ marginBottom: '16px' }}>
              {t('flowConfigNeeded')}
            </Typography.Text>
            <Button type="primary" icon={<EditOutlined />} onClick={() => router.push(`/canvas/${id}`)}>
              {t('goToFlowEditor')}
            </Button>
          </div>
        ) : (
          <div style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <ChatInterface
              agentId={id as string}
              flowConfig={flowConfig}
              id={currentConversationId}
              onConversationCreated={handleConversationCreated}
              onConversationUpdated={handleConversationUpdated}
              onNewChatStarted={handleNewChatStarted}
              variables={{
                agentName: agent?.name,
                userDisplayName: user?.name || 'User',
              }}
            />
          </div>
        )}
      </Modal>
    </MainLayout>
  );
}
