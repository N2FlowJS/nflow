import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Spin,
  Typography,
  Space,
  message,
  Breadcrumb,
  Tabs,
  Switch,
  Modal,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  TeamOutlined,
  RobotOutlined,
  DeleteOutlined,
  EditOutlined,
  CommentOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import Link from "next/link";
import MainLayout from "../../../components/layout/MainLayout";
import {
  fetchAgent,
  updateAgent,
  deleteAgent,
  fetchFlowConfig,
} from "../../../services/agentService"; // Use the new service
import { IAgent } from "../../../types/IAgent";
import ChatInterface from "../../../components/chat/ChatInterface";
import { useAuth } from "../../../context/AuthContext";

const { Title } = Typography;
const { TabPane } = Tabs;

export default function AgentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [agent, setAgent] = useState<IAgent | null>(null);
  const [flowConfig, setFlowConfig] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [flowLoading, setFlowLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("info");

  // Add streaming state
  const [enableStreaming, setEnableStreaming] = useState(true);

  // Add conversation management state
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);

  // Get user info from auth hook
  const { user } = useAuth();

  // Fetch agent data
  const fetchAgentData = async () => {
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
  };

  // Fetch flow configuration when needed
  const loadFlowConfig = async () => {
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
  };

  useEffect(() => {
    if (id) {
      fetchAgentData();
    }
  }, [id]);

  // Load flow config only when the chat tab is active and config isn't loaded yet
  useEffect(() => {
    if (activeTab === 'chat' && !flowConfig && id && !flowLoading) {
      loadFlowConfig();
    }
  }, [activeTab, flowConfig, id, flowLoading]); // Added flowLoading dependency

  // Handle form submission
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const updatedAgent = await updateAgent(id as string, values); // Use the service
      setAgent(updatedAgent);
      message.success("Agent updated successfully");
      setIsEditing(false);
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
      <div style={{ padding: "24px" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/">Home</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/agent">Agents</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{agent?.name || "Detail"}</Breadcrumb.Item>
          </Breadcrumb>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start", // Align items to the start for better vertical alignment
            }}
          >
            <Space direction="vertical" size="small">
              <Space align="center">
                <RobotOutlined style={{ fontSize: "24px", color: '#1890ff' }} />
                <Title level={2} style={{ margin: 0 }}>
                  {agent?.name}
                </Title>
              </Space>
              {/* Owner Info */}
              <Space style={{ marginLeft: '32px' }}>
                {agent?.ownerType === "user" ? (
                  <Space size="small">
                    <UserOutlined />
                    <Typography.Text type="secondary">Owned by:</Typography.Text>
                    <Link href={`/user/${agent.user?.id}`}>
                      {agent.user?.name}
                    </Link>
                  </Space>
                ) : (
                  <Space size="small">
                    <TeamOutlined />
                    <Typography.Text type="secondary">Owned by Team:</Typography.Text>
                    <Link href={`/team/${agent?.team?.id}`}>
                      {agent?.team?.name}
                    </Link>
                  </Space>
                )}
              </Space>
            </Space>

            <Space wrap> {/* Use wrap for responsiveness */}
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push("/agent")}
              >
                Back to List
              </Button>
              {isEditing ? (
                <>
                  <Button onClick={() => { setIsEditing(false); form.resetFields(); }}>Cancel</Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={saving}
                  >
                    Save Agent Info
                  </Button>
                </>
              ) : (
                <>
                   <Button
                    icon={<EditOutlined />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Agent Info
                  </Button>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() =>
                      router.push(`/agent/flow-editor?agentId=${id}`)
                    }
                  >
                    Open Flow Editor
                  </Button>
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={confirmDelete}
                  >
                    Delete Agent
                  </Button>
                </>
              )}
            </Space>
          </div>

          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane
              tab={
                <span>
                  <InfoCircleOutlined />
                  Agent Information
                </span>
              }
              key="info"
            >
              <Card>
                <Form form={form} layout="vertical" disabled={!isEditing}>
                  <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: "Please enter a name" }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label="Description"
                    rules={[
                      { required: true, message: "Please enter a description" },
                    ]}
                  >
                    <Input.TextArea rows={4} />
                  </Form.Item>

                  <Form.Item name="isActive" label="Active" valuePropName="checked">
                    <Switch />
                  </Form.Item>

                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div>
                      <strong>Created By:</strong> {agent?.createdBy?.name}
                    </div>
                    <div>
                      <strong>Created At:</strong>{" "}
                      {new Date(agent?.createdAt || "").toLocaleString()}
                    </div>
                    <div>
                      <strong>Last Updated:</strong>{" "}
                      {new Date(agent?.updatedAt || "").toLocaleString()}
                    </div>
                  </Space>
                </Form>
              </Card>
            </TabPane>

            <TabPane
              tab={
                <span>
                  <CommentOutlined />
                  Chat
                </span>
              }
              key="chat"
            >
              <Card
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Chat with Agent</span>
                    <Space>
                      <Switch
                        checkedChildren={<><ThunderboltOutlined /> Streaming</>}
                        unCheckedChildren={<><ThunderboltOutlined /> No Streaming</>}
                        checked={enableStreaming}
                        onChange={setEnableStreaming}
                        disabled={flowLoading || !flowConfig} // Disable switch while loading or if no config
                      />
                    </Space>
                  </div>
                }
                bodyStyle={{ padding: 0, height: 'calc(75vh - 100px)', display: 'flex', flexDirection: 'column' }} // Adjusted height and padding
              >
                {/* Conditional Rendering for Chat Interface */}
                {flowLoading ? (
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Spin size="large" />
                    <Typography.Text style={{ marginTop: 16 }}>Loading agent flow...</Typography.Text>
                  </div>
                ) : !flowConfig ? (
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                    <InfoCircleOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }}/>
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
                  // Render ChatInterface only when flowConfig is loaded
                  <ChatInterface
                    agentId={id as string}
                    flowConfig={flowConfig} // Pass the loaded config
                    enableStreaming={enableStreaming}
                    id={currentConversationId} // Pass current conversation ID
                    onConversationCreated={handleConversationCreated}
                    onConversationUpdated={handleConversationUpdated}
                    onNewChatStarted={handleNewChatStarted} // Pass the new handler
                    variables={{ // Pass relevant variables
                      agentName: agent?.name,
                      userDisplayName: user?.name || 'User', // Provide default
                      // Add other necessary variables here
                    }}
                  />
                )}
              </Card>
            </TabPane>
          </Tabs>
        </Space>
      </div>
    </MainLayout>
  );
}
