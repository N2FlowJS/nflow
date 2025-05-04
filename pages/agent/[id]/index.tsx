import {
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  RobotOutlined,
  SaveOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UserOutlined
} from "@ant-design/icons";
import {
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Spin,
  Switch,
  Tag,
  Typography,
  message,
  Grid
} from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import ChatInterface from "../../../components/chat/ChatInterface";
import MainLayout from "../../../components/layout/MainLayout";
import { IAgent } from "../../../models/IAgent";
import {
  deleteAgent,
  fetchAgent,
  fetchFlowConfig,
  updateAgent,
} from "../../../services/agentService"; // Use the new service
import { useAuth } from "../../../context/AuthContext";
import { useLocale } from '../../../locale/index';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function AgentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [agent, setAgent] = useState<IAgent | null>(null);
  const [flowConfig, setFlowConfig] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [flowLoading, setFlowLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const { t } = useLocale('agentDetail');

  // Add streaming state
  const [enableStreaming, setEnableStreaming] = useState(true);

  // Add conversation management state
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);

  // Get user info from auth hook
  const { user } = useAuth();

  // Fetch agent data
  const fetchAgentData = React.useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await fetchAgent(id as string); // Use the service
      if (data) setAgent(data);

      // Initialize form with agent data
      form.setFieldsValue({
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      });
    } catch (error: unknown) {
      console.error("Error fetching agent:", error);
      message.error("Failed to load agent details");
    } finally {
      setLoading(false);
    }
  }, [id, form]);

  // Fetch flow configuration when needed
  const loadFlowConfig = React.useCallback(async () => {
    if (!id) return;

    setFlowLoading(true);
    try {
      const config = await fetchFlowConfig(id as string);
      setFlowConfig(config);
    } catch (error: unknown) {
      console.error("Error fetching flow config:", error);
      message.error("Failed to load agent flow configuration");
    } finally {
      setFlowLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAgentData();

  }, [fetchAgentData]);

  // Load flow config only when the chat tab is active and config isn't loaded yet
  useEffect(() => {
    loadFlowConfig();

  }, [loadFlowConfig]); // Added flowLoading dependency

  // Handle form submission
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const updatedAgent = await updateAgent(id as string, values); // Use the service
      setAgent(updatedAgent);
      message.success("Agent updated successfully");
    } catch (error: unknown) {
      console.error("Error updating agent:", error);
      message.error("Failed to update agent");
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
          router.push("/agent");
        } catch (error: unknown) {
          console.error("Error deleting agent:", error);
          message.error(t('deleteFailed'));
        }
      },
    });
  };

  // Handle conversation creation
  const handleConversationCreated = useCallback((conversationId: string) => {
    setCurrentConversationId(conversationId);
    console.log("New conversation created:", conversationId);
  }, []);

  // Handle conversation updates
  const handleConversationUpdated = useCallback((conversationId: string) => {
    // Optional: Update UI based on conversation updates if needed
    console.log("Conversation updated:", conversationId);
  }, []);

  // Add handler to reset conversation ID when ChatInterface starts a new chat
  const handleNewChatStarted = useCallback(() => {
    setCurrentConversationId(undefined);
    // Optionally reset other related states if necessary
  }, []);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  if (loading) {
    return (
      <MainLayout title={t('loadingAgent')}>
        <div style={{ padding: "24px", textAlign: "center" }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!agent && !loading) {
    return (
      <MainLayout title={t('agentNotFound')}>
        <div style={{ padding: "24px" }}>
          <Title level={4}>{t('agentNotFound')}</Title>
          <Button type="primary" onClick={() => router.push("/agent")}>
            {t('backToAgentsList')}
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`${t('agent')}: ${agent?.name || t('detail')}`}>
      <div style={{ padding: isMobile ? '12px' : '24px' }}>
        <Breadcrumb
          style={{ marginBottom: isMobile ? '12px' : '24px' }}
          items={[
            {
              title: <Link href="/">Home</Link>,
            },
            {
              title: <Link href="/agent">{t('agents')}</Link>,
            },
            {
              title: agent?.name || t('detail'),
            },
          ]}
        />

        <Row gutter={[16, 16]} align="stretch">
          {/* Agent Info Card */}
          <Col xs={24} md={8}>
            <Card>
              <Row align="middle" >
                <Col flex="none" >
                  <Avatar
                    size={isMobile ? 56 : 72}
                    icon={<RobotOutlined />}
                    style={{
                      background: "#1677ff",
                      marginRight: isMobile ? 16 : 32,
                      marginBottom: isMobile ? 16 : 0
                    }}
                  />
                </Col>
                <Col flex="auto">
                  <Title level={isMobile ? 3 : 2} style={{ margin: 0 }}>{agent?.name}</Title>
                  <Typography.Text type="secondary" style={{ fontSize: isMobile ? 14 : 16 }}>
                    {agent?.description}
                  </Typography.Text>
                  <div style={{ marginTop: 12 }}>
                    <Tag color={agent?.isActive ? "green" : "red"}>
                      {agent?.isActive ? t('active') : t('inactive')}
                    </Tag>
                    {agent?.ownerType === "user" ? (
                      <Tag icon={<UserOutlined />} color="blue">
                        {agent?.user?.name}
                      </Tag>
                    ) : (
                      <Tag icon={<TeamOutlined />} color="gold">
                        {agent?.team?.name}
                      </Tag>
                    )}
                  </div>
                </Col>
              </Row>

              <Divider style={{ margin: 0 }} />

              <Form
                form={form}
                layout="vertical"
                size={isMobile ? "middle" : "large"}
              >
                <Form.Item
                  name="name"
                  label={<b>{t('form.name')}</b>}
                  rules={[{ required: true }]}
                >
                  <Input size="large" />
                </Form.Item>
                <Form.Item
                  name="description"
                  label={<b>{t('form.description')}</b>}
                  rules={[{ required: true }]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item name="isActive" label={<b>{t('form.status')}</b>} valuePropName="checked">
                  <Switch checkedChildren={t('active')} unCheckedChildren={t('inactive')} />
                </Form.Item>
                <Divider />
                <Row gutter={24}>
                  <Col span={12}>
                    <Text type="secondary">{t('createdBy')}</Text>
                    <div><b>{agent?.createdBy?.name}</b></div>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">{t('createdAt')}</Text>
                    <div><b>{new Date(agent?.createdAt || "").toLocaleString()}</b></div>
                  </Col>
                  <Col span={12} style={{ marginTop: 16 }}>
                    <Text type="secondary">{t('lastUpdated')}</Text>
                    <div><b>{new Date(agent?.updatedAt || "").toLocaleString()}</b></div>
                  </Col>
                </Row>
                {/* Add Save button at the bottom */}
                <Row justify="space-between" style={{ marginTop: 24 }}>
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={confirmDelete}
                    size={isMobile ? "middle" : "large"}
                  />
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={saving}
                    size={isMobile ? "middle" : "large"}
                  >
                    {t('save')}
                  </Button>
                </Row>
              </Form>
            </Card>
          </Col>

          {/* Chat Interface Card */}
          <Col xs={24} md={16}>
            <Card
              title={
                <Space
                  style={{
                    width: "100%",
                    justifyContent: "space-between",
                    flexWrap: isMobile ? 'wrap' : 'nowrap',
                    rowGap: isMobile ? '8px' : 0
                  }}
                >
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => router.push(`/agent/canvas/${id}`)}
                    size={isMobile ? "middle" : "large"}
                  >
                    {!isMobile && t('flowEditor')}
                  </Button>
                  {!isMobile && <Typography.Text strong>{t('chatWithAgent')}</Typography.Text>}
                  <Switch
                    checkedChildren={<ThunderboltOutlined />}
                    unCheckedChildren={<ThunderboltOutlined />}
                    checked={enableStreaming}
                    onChange={setEnableStreaming}
                  />
                </Space>
              }
            >
              {flowLoading ? (
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <Spin size="large" />
                  <Typography.Text style={{ marginTop: 16 }}>{t('loadingAgentFlow')}</Typography.Text>
                </div>
              ) : !flowConfig ? (
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                  <InfoCircleOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
                  <Typography.Title level={4}>{t('noFlowConfigFound')}</Typography.Title>
                  <Typography.Text type="secondary" style={{ marginBottom: '16px' }}>
                    {t('flowConfigNeeded')}
                  </Typography.Text>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => router.push(`/agent/flow-editor?agentId=${id}`)}
                  >
                    {t('goToFlowEditor')}
                  </Button>
                </div>
              ) : (
                <ChatInterface
                  agentId={id as string}
                  flowConfig={flowConfig}
                  enableStreaming={enableStreaming}
                  id={currentConversationId}
                  onConversationCreated={handleConversationCreated}
                  onConversationUpdated={handleConversationUpdated}
                  onNewChatStarted={handleNewChatStarted}
                  variables={{
                    agentName: agent?.name,
                    userDisplayName: user?.name || 'User',
                  }}
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
}
