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
  message
} from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import ChatInterface from "@components/chat/ChatInterface";
import MainLayout from "@components/layout/MainLayout";
import { IAgent } from "@models/IAgent";
import {
  deleteAgent,
  fetchAgent,
  fetchFlowConfig,
  updateAgent,
} from "@services/agentService"; // Use the new service
import { useAuth } from "../../../context/AuthContext";

const { Title, Text } = Typography;

export default function AgentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [agent, setAgent] = useState<IAgent | null>(null);
  const [flowConfig, setFlowConfig] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [flowLoading, setFlowLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

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
      data && setAgent(data);

      // Initialize form with agent data
      form.setFieldsValue({
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      });
    } catch (error) {
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
    } catch (error) {
      console.error("Error fetching flow config:", error);
      message.error("Failed to load agent flow configuration");
    } finally {
      setFlowLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAgentData && fetchAgentData();

  }, [fetchAgentData]);

  // Load flow config only when the chat tab is active and config isn't loaded yet
  useEffect(() => {
    loadFlowConfig && loadFlowConfig();

  }, [loadFlowConfig]); // Added flowLoading dependency

  // Handle form submission
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const updatedAgent = await updateAgent(id as string, values); // Use the service
      setAgent(updatedAgent);
      message.success("Agent updated successfully");
    } catch (error) {
      console.error("Error updating agent:", error);
      message.error("Failed to update agent");
    } finally {
      setSaving(false);
    }
  };

  // Handle agent deletion
  const confirmDelete = () => {
    Modal.confirm({
      title: "Are you sure you want to delete this agent?",
      content: "This action cannot be undone.",
      okText: "Yes, delete it",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteAgent(id as string); // Use the service
          message.success("Agent deleted successfully");
          router.push("/agent");
        } catch (error) {
          console.error("Error deleting agent:", error);
          message.error("Failed to delete agent");
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

  if (loading) {
    return (
      <MainLayout title="Loading Agent">
        <div style={{ padding: "24px", textAlign: "center" }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!agent && !loading) {
    return (
      <MainLayout title="Agent Not Found">
        <div style={{ padding: "24px" }}>
          <Title level={4}>Agent not found</Title>
          <Button type="primary" onClick={() => router.push("/agent")}>
            Back to Agents List
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Agent: ${agent?.name || "Detail"}`}>
      <div style={{ padding: '24px' }}>
        <Breadcrumb
          items={[
            {
              title: <Link href="/">Home</Link>,
            },
            {
              title: <Link href="/agent">Agents</Link>,
            },
            {
              title: agent?.name || "Detail",
            },
          ]}
        />

        <Row gutter={32} align="stretch">

          <Col xs={24} md={6}>
            <Card

            >
              <Row align="middle" style={{ padding: 32 }}>
                <Col flex="none">
                  <Avatar
                    size={72}
                    icon={<RobotOutlined />}
                    style={{ background: "#1677ff", marginRight: 32 }}
                  />
                </Col>
                <Col flex="auto">
                  <Title level={2} style={{ margin: 0 }}>{agent?.name}</Title>
                  <Typography.Text type="secondary" style={{ fontSize: 16 }}>
                    {agent?.description}
                  </Typography.Text>
                  <div style={{ marginTop: 12 }}>
                    <Tag color={agent?.isActive ? "green" : "red"}>
                      {agent?.isActive ? "Active" : "Inactive"}
                    </Tag>
                    {agent?.ownerType === "user" ? (
                      <Tag icon={<UserOutlined />} color="blue" style={{ marginLeft: 8 }}>
                        {agent?.user?.name}
                      </Tag>
                    ) : (
                      <Tag icon={<TeamOutlined />} color="gold" style={{ marginLeft: 8 }}>
                        {agent?.team?.name}
                      </Tag>
                    )}
                  </div>
                </Col>

              </Row>
              <Divider style={{ margin: 0 }} />
              <div style={{ padding: 32 }}>
                <Form form={form} layout="vertical" disabled={false /* Always editable */}>
                  <Form.Item
                    name="name"
                    label={<b>Name</b>}
                    rules={[{ required: true }]}
                  >
                    <Input size="large" />
                  </Form.Item>
                  <Form.Item
                    name="description"
                    label={<b>Description</b>}
                    rules={[{ required: true }]}
                  >
                    <Input.TextArea rows={4} />
                  </Form.Item>
                  <Form.Item name="isActive" label={<b>Status</b>} valuePropName="checked">
                    <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                  </Form.Item>
                  <Divider />
                  <Row gutter={24}>
                    <Col span={12}>
                      <Text type="secondary">Created By</Text>
                      <div><b>{agent?.createdBy?.name}</b></div>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">Created At</Text>
                      <div><b>{new Date(agent?.createdAt || "").toLocaleString()}</b></div>
                    </Col>
                    <Col span={12} style={{ marginTop: 16 }}>
                      <Text type="secondary">Last Updated</Text>
                      <div><b>{new Date(agent?.updatedAt || "").toLocaleString()}</b></div>
                    </Col>
                  </Row>
                  {/* Add Save button at the bottom */}
                  <Row justify="space-between" style={{ marginTop: 24 }}>

                    <Button type="primary" danger icon={<DeleteOutlined />} onClick={confirmDelete}>
                    </Button>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
                      Save
                    </Button>
                  </Row>
                </Form>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={14} style={{ minHeight: 600 }}>
            <Card
              title={
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => router.push(`/agent/flow-editor?agentId=${id}`)}
                  >
                    Flow Editor
                  </Button>
                  <Typography.Text strong>Chat with Agent</Typography.Text>
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
                  <Typography.Text style={{ marginTop: 16 }}>Loading agent flow...</Typography.Text>
                </div>
              ) : !flowConfig ? (
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                  <InfoCircleOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
                  <Typography.Title level={4}>No Flow Configuration Found</Typography.Title>
                  <Typography.Text type="secondary" style={{ marginBottom: '16px' }}>
                    This agent needs a flow defined before you can chat with it.
                  </Typography.Text>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => router.push(`/agent/flow-editor?agentId=${id}`)}
                  >
                    Go to Flow Editor
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
