import React, { useEffect, useState } from "react";
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

  // Load flow config when switching to chat tab
  useEffect(() => {
    if (activeTab === 'chat' && !flowConfig && id) {
      loadFlowConfig();
    }
  }, [activeTab, flowConfig, id]);

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
  const handleConversationCreated = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    console.log("New conversation created:", conversationId);
    // You might want to add this to a conversations list
  };

  // Handle conversation updates
  const handleConversationUpdated = (conversationId: string) => {
    console.log("Conversation updated:", conversationId);
    // You might want to update timestamps or other metadata
  };

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
              alignItems: "center",
            }}
          >
            <Space align="center">
              <RobotOutlined style={{ fontSize: "24px" }} />
              <Title level={2} style={{ margin: 0 }}>
                {agent?.name}
              </Title>
              {agent?.ownerType === "user" ? (
                <Space>
                  <UserOutlined />
                  <Link href={`/user/${agent.user?.id}`}>
                    {agent.user?.name}
                  </Link>
                </Space>
              ) : (
                <Space>
                  <TeamOutlined />
                  <Link href={`/team/${agent?.team?.id}`}>
                    {agent?.team?.name}
                  </Link>
                </Space>
              )}
            </Space>

            <Space>
              {isEditing ? (
                <>
                  <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={saving}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <>
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
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.push("/agent")}
                  >
                    Back to List
                  </Button>
                  <Button type="primary" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={confirmDelete}
                  >
                    Delete
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
                        checkedChildren={<><ThunderboltOutlined /> Streaming On</>}
                        unCheckedChildren={<><ThunderboltOutlined /> Streaming Off</>}
                        checked={enableStreaming}
                        onChange={setEnableStreaming}
                      />
                    </Space>
                  </div>
                }
                style={{
                  padding: 0,
                  height: 'calc(80vh - 180px)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {flowLoading ? (
                  <div style={{ textAlign: 'center', margin: '100px 0' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>Loading agent flow...</div>
                  </div>
                ) : !flowConfig ? (
                  <div style={{ textAlign: 'center', margin: '100px 0' }}>
                    <Typography.Title level={4}>No flow configuration found</Typography.Title>
                    <Button
                      type="primary"
                      onClick={() => router.push(`/agent/flow-editor?agentId=${id}`)}
                    >
                      Create Flow
                    </Button>
                  </div>
                ) : (
                  <ChatInterface
                    agentId={id as string}
                    flowConfig={flowConfig}
                    enableStreaming={enableStreaming}
                    userId={user?.id}
                    teamId={agent?.ownerType === 'team' ? agent.team?.id : undefined}
                    id={currentConversationId}
                    onConversationCreated={handleConversationCreated}
                    onConversationUpdated={handleConversationUpdated}
                    variables={{
                      agentName: agent?.name,
                      userDisplayName: user?.name
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
