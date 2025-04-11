import {
  ArrowLeftOutlined,
  CalendarOutlined,
  FileOutlined,
  SaveOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";
import {
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  List,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
  message,
  Tabs
} from "antd";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FileConfigModal from "../../../components/knowledge/FileConfigModal";
import KnowledgeConfigForm from "../../../components/knowledge/KnowledgeConfigForm";
import KnowledgeDetailForm from "../../../components/knowledge/KnowledgeDetailForm";
import KnowledgeFileList from "../../../components/knowledge/KnowledgeFileList";
import RetrievalTestingPanel from "../../../components/knowledge/RetrievalTestingPanel";
import MainLayout from "../../../components/layout/MainLayout";
import UploadFileModal from "../../../components/upload/UploadFileModal";
import { useAuth } from "../../../context/AuthContext";
import { updateFileConfig } from "../../../services/fileService";
import {
  fetchKnowledgeById,
  updateKnowledge,
} from "../../../services/knowledgeService";
import { Knowledge } from "../../../types/knowledge";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export default function KnowledgeDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [knowledge, setKnowledge] = useState<Knowledge | null>(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(true); // Always in editing mode
  const { isAuthenticated } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFileForConfig, setSelectedFileForConfig] = useState<any>(null);
  const [fileConfigModalVisible, setFileConfigModalVisible] = useState(false);
  const [savingFileConfig, setSavingFileConfig] = useState(false);
  const [activeTab, setActiveTab] = useState("files");

  const fetchKnowledgeDetail = async () => {
    if (!id || typeof id !== "string") return;

    setLoading(true);
    try {
      const data = await fetchKnowledgeById(id);
      if (data) {
        console.log("Knowledge data received:", data);
        setKnowledge(data as Knowledge);

        // Parse config JSON
        let config = { tokenChunk: 1000, chunkSeparator: "\n\n" };
        if (data.config) {
          try {
            config = JSON.parse(data.config);
          } catch (e) {
            console.error("Error parsing config JSON:", e);
          }
        }

        // Set form values including config
        form.setFieldsValue({
          name: data.name,
          description: data.description,
          config: config,
        });
      } else {
        message.error("Failed to fetch knowledge details");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchKnowledgeDetail();
    }
  }, [id]);

  const handleCancel = () => {
    // Just reset the form to original values without changing edit state
    form.setFieldsValue({
      name: knowledge?.name,
      description: knowledge?.description,
      config: knowledge?.config
        ? JSON.parse(knowledge.config)
        : { tokenChunk: 1000, chunkSeparator: "\n\n" },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!id || typeof id !== "string") return;

      // Convert config object to JSON string
      const dataToSubmit = {
        name: values.name,
        description: values.description,
        config: JSON.stringify(values.config),
      };
      console.log(dataToSubmit);

      const updated = await updateKnowledge(id, dataToSubmit);
      if (updated) {
        message.success("Knowledge updated successfully");
        setIsEditing(false);
        fetchKnowledgeDetail();
      } else {
        message.error("Failed to update knowledge");
      }
    } catch (error) {
      console.error("Form validation error:", error);
    }
  };

  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  const openFileConfigModal = (file: any) => {
    setSelectedFileForConfig(file);
    setFileConfigModalVisible(true);
  };

  const handleSaveFileConfig = async (config: any) => {
    if (!selectedFileForConfig) return;

    setSavingFileConfig(true);
    try {
      await updateFileConfig(
        selectedFileForConfig.id,
        config ? JSON.stringify(config) : null
      );
      message.success("File configuration updated successfully");
      setFileConfigModalVisible(false);
      fetchKnowledgeDetail();
    } catch (error) {
      console.error("Error saving file config:", error);
      message.error("Failed to update file configuration");
    } finally {
      setSavingFileConfig(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy HH:mm:ss");
  };

  if (loading) {
    return (
      <MainLayout title="Loading Knowledge">
        <div style={{ padding: "24px", textAlign: "center" }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!knowledge && !loading) {
    return (
      <MainLayout title="Knowledge Not Found">
        <div style={{ padding: "24px" }}>
          <Title level={4}>Knowledge not found</Title>
          <Button type="primary" onClick={() => router.push("/knowledge")}>
            Back to Knowledge List
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={knowledge?.name || "Knowledge Detail"}>
      {/* Breadcrumb and Header */}
      <Row gutter={[16, 24]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Breadcrumb style={{ marginBottom: 16 }}>
            <Breadcrumb.Item>
              <Link href="/knowledge">Knowledge</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{knowledge?.name || "Detail"}</Breadcrumb.Item>
          </Breadcrumb>

          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={2} style={{ margin: 0 }}>
                  {knowledge?.name}
                </Title>
              </Col>
              <Col>
                <Space>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.push("/knowledge")}
                  >
                    Back to List
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Main Content - Three Columns Layout */}
      <Row gutter={[16, 24]}>
        {/* Left Column - Forms that can be edited */}
        <Col xs={24} md={8}>
          <Form form={form} layout="vertical">
            {/* Description Card */}
            <Card
              title="Description"
              extra={<Text type="secondary">Editing mode</Text>}
              style={{ marginBottom: 24 }}
            >
              <KnowledgeDetailForm form={form} isEditing={true} />
            </Card>

            {/* Chunking Configuration */}
            <Card style={{ marginBottom: 24 }}>
              <KnowledgeConfigForm form={form} isEditing={true} />
            </Card>

            {/* Save Button at bottom of form */}
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              block
              disabled={!isAuthenticated}
            >
              Save Changes
            </Button>
          </Form>
        </Col>

        {/* Middle Column - Files and Testing */}
        <Col xs={24} md={12}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="Files" key="files">
                <KnowledgeFileList 
                  knowledge={knowledge!}
                  isAuthenticated={isAuthenticated}
                  handleOpenUploadModal={handleOpenUploadModal}
                  openFileConfigModal={openFileConfigModal}
                />
              </TabPane>
              <TabPane tab="Retrieval Testing" key="testing">
                {id && typeof id === "string" && (
                  <RetrievalTestingPanel knowledgeId={id} />
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>

        <Col xs={24} md={4}>
          <Card title="Creator Information" style={{ marginBottom: 24 }}>
            {knowledge?.createdBy ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  size={64}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#1677ff" }}
                />
                <div style={{ marginLeft: 16 }}>
                  <Text strong style={{ fontSize: 16 }}>
                    {knowledge.createdBy.name}
                  </Text>
                  <div>
                    <Text type="secondary">{knowledge.createdBy.email}</Text>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="blue">
                      {knowledge.createdBy.permission || "User"}
                    </Tag>
                  </div>
                </div>
              </div>
            ) : (
              <Text type="secondary">Creator information not available</Text>
            )}
          </Card>

          {/* Stats Card */}
          <Card title="Statistics" style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Files"
                  value={knowledge?.files?.length || 0}
                  prefix={<FileOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Users"
                  value={knowledge?.users?.length || 0}
                  prefix={<UserOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Teams"
                  value={knowledge?.teams?.length || 0}
                  prefix={<TeamOutlined />}
                />
              </Col>
            </Row>
          </Card>

          {/* Dates Card */}
          <Card title="Dates" style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text type="secondary">Created:</Text>
                <div>
                  <CalendarOutlined /> {formatDate(knowledge?.createdAt)}
                </div>
              </div>
              <Divider style={{ margin: "12px 0" }} />
              <div>
                <Text type="secondary">Last Updated:</Text>
                <div>
                  <CalendarOutlined /> {formatDate(knowledge?.updatedAt)}
                </div>
              </div>
            </Space>
          </Card>

          {/* Associated Users Card */}
          <Card title="Associated Users" style={{ marginBottom: 24 }}>
            {knowledge?.users && knowledge.users.length > 0 ? (
              <List
                size="small"
                dataSource={knowledge.users}
                renderItem={(user) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={user.name}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                description="No users associated"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>

          {/* Associated Teams Card */}
          <Card title="Associated Teams">
            {knowledge?.teams && knowledge.teams.length > 0 ? (
              <List
                size="small"
                dataSource={knowledge.teams}
                renderItem={(team) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={<TeamOutlined />}
                          style={{ backgroundColor: "#722ed1" }}
                        />
                      }
                      title={team.name}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                description="No teams associated"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Upload File Modal */}
      {id && typeof id === "string" && (
        <UploadFileModal
          knowledgeId={id}
          isOpen={isUploadModalOpen}
          onClose={handleCloseUploadModal}
          onUploadComplete={fetchKnowledgeDetail}
          isAuthenticated={isAuthenticated}
        />
      )}

      {/* File Config Modal */}
      {selectedFileForConfig && (
        <FileConfigModal
          visible={fileConfigModalVisible}
          onClose={() => setFileConfigModalVisible(false)}
          onSave={handleSaveFileConfig}
          fileId={selectedFileForConfig.id}
          fileName={selectedFileForConfig.originalName}
          fileConfig={
            selectedFileForConfig.config
              ? JSON.parse(selectedFileForConfig.config)
              : null
          }
          loading={savingFileConfig}
        />
      )}
    </MainLayout>
  );
}
