import {
  CalendarOutlined,
  FileOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  SearchOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";
import FileConfigModal from "../../../components/knowledge/FileConfigModal";
import KnowledgeConfigForm from "../../../components/knowledge/KnowledgeConfigForm";
import KnowledgeDetailForm from "../../../components/knowledge/KnowledgeDetailForm";
import KnowledgeFileList from "../../../components/knowledge/KnowledgeFileList";
import RetrievalTestingPanel from "../../../components/knowledge/RetrievalTestingPanel";
import MainLayout from "../../../components/layout/MainLayout";
import UploadFileModal from "../../../components/upload/UploadFileModal";
import { useAuth } from "../../../context/AuthContext";
import { Knowledge } from "../../../models/knowledge";
import { updateFileConfig } from "../../../services/fileService";
import {
  fetchKnowledgeById,
  updateKnowledge,
} from "../../../services/knowledgeService";
import {
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Grid,
  List,
  message,
  Row,
  Space,
  Spin,
  Statistic,
  Tabs,
  Tag,
  Typography
} from "antd";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState, CSSProperties } from "react";
import { useLocale } from "../../../locale/index";
import KnowledgeModelForm from "../../../components/knowledge/KnowledgeModelForm";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

export default function KnowledgeDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [knowledge, setKnowledge] = useState<Knowledge | null>(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const { isAuthenticated } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFileForConfig, setSelectedFileForConfig] = useState<any>(null);
  const [fileConfigModalVisible, setFileConfigModalVisible] = useState(false);
  const [savingFileConfig, setSavingFileConfig] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { messages } = useLocale();
  const [activeTab, setActiveTab] = useState('files');

  const fetchKnowledgeDetail = React.useCallback(async () => {
    if (!id || typeof id !== "string") return;

    setLoading(true);
    try {
      const data = await fetchKnowledgeById(id);
      if (data) {
        console.log("Knowledge data received:", data);
        setKnowledge(data as Knowledge);

        // Parse config JSON
        let config = { tokenChunk: 1000, chunkSeparator: ["\n", "\n"] };
        if (data.config) {
          try {
            const parsed = JSON.parse(data.config);
            // Đảm bảo chunkSeparator là mảng
            if (parsed && typeof parsed.chunkSeparator === "string") {
              parsed.chunkSeparator = [parsed.chunkSeparator];
            }
            if (parsed && Array.isArray(parsed.chunkSeparator)) {
              config = parsed;
            } else {
              config = { ...parsed, chunkSeparator: ["\n", "\n"] };
            }
          } catch (e) {
            console.error("Error parsing config JSON:", e);
          }
        }

        // Set form values including config
        form.setFieldsValue({
          name: data.name,
          description: data.description,
          config: config,
          modelId: data.modelId
        });
      } else {
        message.error(messages.knowledgeDetail.fetchKnowledgeFailed);
      }
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id, form, messages]);

  useEffect(() => {
    fetchKnowledgeDetail();

  }, [fetchKnowledgeDetail]);



  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!id || typeof id !== "string") return;

      const dataToSubmit = {
        name: values.name,
        modelId: values.modelId,
        description: values.description,
        updateKnowledge: values.updateKnowledge,
        config: JSON.stringify(values.config,),
      };

      const updated = await updateKnowledge(id, dataToSubmit);
      if (updated) {
        message.success("Knowledge updated successfully");
        fetchKnowledgeDetail();
      } else {
        message.error("Failed to update knowledge");
      }
    } catch (error: unknown) {
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
      message.success(messages.knowledgeDetail.fileConfigUpdated);
      setFileConfigModalVisible(false);
      fetchKnowledgeDetail();
    } catch (error: unknown) {
      console.error("Error saving file config:", error);
      message.error(messages.knowledgeDetail.fileConfigUpdateFailed);
    } finally {
      setSavingFileConfig(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy HH:mm:ss");
  };

  // Mobile tab styles
  const mobileTabStyle: CSSProperties = {
    padding: '8px',
    textAlign: 'center',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.3s',
  };

  const mobileActiveTabStyle: CSSProperties = {
    ...mobileTabStyle,
    borderBottom: '2px solid #1890ff',
    color: '#1890ff',
  };

  // Custom render for mobile tabs
  const renderMobileTabs = () => {
    const tabs = [
      { key: 'files', icon: <FileOutlined />, label: messages.knowledgeDetail.dataSet },
      { key: 'content', icon: <SettingOutlined />, label: messages.knowledgeDetail.config },
      { key: 'testing', icon: <SearchOutlined />, label: messages.knowledgeDetail.testing.testing },
      { key: 'info', icon: <InfoCircleOutlined />, label: messages.knowledgeDetail.info },
    ];

    return (
      <>
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
          zIndex: 1000
        }}>
          <Row>
            {tabs.map(tab => (
              <Col span={6} key={tab.key}>
                <div
                  style={activeTab === tab.key ? mobileActiveTabStyle : mobileTabStyle}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <div style={{ fontSize: '18px' }}>{tab.icon}</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>{tab.label}</div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
        <div style={{ paddingBottom: '80px' }}>
          {tabs.map(tab => (
            <div key={tab.key} style={{ display: activeTab === tab.key ? 'block' : 'none' }}>
              {tab.key === 'files' && (
                <KnowledgeFileList
                  knowledge={knowledge!}
                  isAuthenticated={isAuthenticated}
                  handleOpenUploadModal={handleOpenUploadModal}
                  openFileConfigModal={openFileConfigModal}
                />
              )}
              {tab.key === 'content' && (
                <Form form={form} layout="vertical">
                  <Card
                    title={messages.knowledgeDetail.description}
                    style={{ marginBottom: isMobile ? 12 : 24 }}
                    size={isMobile ? "small" : "default"}
                  >
                    <KnowledgeDetailForm form={form} />
                  </Card>

                  <Card
                    style={{ marginBottom: isMobile ? 12 : 24 }}
                    size={isMobile ? "small" : "default"}
                  >
                    <KnowledgeConfigForm form={form} />
                  </Card>

                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSubmit}
                    block
                    disabled={!isAuthenticated}
                    size={isMobile ? "middle" : "large"}
                  >
                    {messages.knowledgeDetail.saveChanges}
                  </Button>
                </Form>
              )}
              {tab.key === 'testing' && id && typeof id === 'string' && (
                <RetrievalTestingPanel knowledgeId={id} />
              )}
              {tab.key === 'info' && renderInfoContent()}
            </div>
          ))}
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <MainLayout title={messages.knowledgeDetail.loadingKnowledge}>
        <div style={{ padding: "24px", textAlign: "center" }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!knowledge && !loading) {
    return (
      <MainLayout title={messages.knowledgeDetail.knowledgeNotFound}>
        <div style={{ padding: "24px" }}>
          <Title level={4}>{messages.knowledgeDetail.knowledgeNotFound}</Title>
          <Button type="primary" onClick={() => router.push("/knowledge")}>
            {messages.knowledgeDetail.backToKnowledgeList}
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Create info content that works for both desktop and mobile
  const renderInfoContent = () => {
    return (
      <Space direction="vertical" style={{ width: '100%' }} size={isMobile ? 'small' : 'middle'}>
        {/* Creator Information Card */}
        <Card
          title={messages.knowledgeDetail.creatorInformation}
          size={isMobile ? "small" : "default"}
          style={{ marginBottom: isMobile ? 12 : 24 }}
        >
          {knowledge?.createdBy ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              flexDirection: isMobile ? "column" : "row",
              textAlign: isMobile ? "center" : "left"
            }}>
              <Avatar
                size={isMobile ? 48 : 64}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#1677ff" }}
              />
              <div style={{
                marginLeft: isMobile ? 0 : 16,
                marginTop: isMobile ? 12 : 0
              }}>
                <Text strong style={{ fontSize: isMobile ? 14 : 16 }}>
                  {knowledge.createdBy.name}
                </Text>
                <div>
                  <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>
                    {knowledge.createdBy.email}
                  </Text>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Tag color="blue">
                    {knowledge.createdBy.permission || "User"}
                  </Tag>
                </div>
              </div>
            </div>
          ) : (
            <Text type="secondary">{messages.knowledgeDetail.creatorInfoNotAvailable}</Text>
          )}
        </Card>

        {/* Stats Card */}
        <Card
          title={messages.knowledgeDetail.statistics}
          size={isMobile ? "small" : "default"}
          style={{ marginBottom: isMobile ? 12 : 24 }}
        >
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Statistic
                title={messages.knowledgeDetail.files}
                value={knowledge?.files?.length || 0}
                prefix={<FileOutlined />}
                valueStyle={{ fontSize: isMobile ? 20 : 24 }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title={messages.knowledgeDetail.users}
                value={knowledge?.users?.length || 0}
                prefix={<UserOutlined />}
                valueStyle={{ fontSize: isMobile ? 20 : 24 }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title={messages.knowledgeDetail.teams}
                value={knowledge?.teams?.length || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ fontSize: isMobile ? 20 : 24 }}
              />
            </Col>
          </Row>
        </Card>

        {/* Dates Card */}
        <Card
          title={messages.knowledgeDetail.dates}
          size={isMobile ? "small" : "default"}
          style={{ marginBottom: isMobile ? 12 : 24 }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text type="secondary">{messages.knowledgeDetail.created}:</Text>
              <div>
                <CalendarOutlined /> {formatDate(knowledge?.createdAt)}
              </div>
            </div>
            <Divider style={{ margin: "8px 0" }} />
            <div>
              <Text type="secondary">{messages.knowledgeDetail.lastUpdated}:</Text>
              <div>
                <CalendarOutlined /> {formatDate(knowledge?.updatedAt)}
              </div>
            </div>
          </Space>
        </Card>

        {/* Associated Users Card */}
        <Card
          title={messages.knowledgeDetail.associatedUsers}
          size={isMobile ? "small" : "default"}
          style={{ marginBottom: isMobile ? 12 : 24 }}
        >
          {knowledge?.users && knowledge.users.length > 0 ? (
            <List
              size="small"
              dataSource={knowledge.users}
              renderItem={(user) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} size={isMobile ? "small" : "default"} />}
                    title={user.name}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              description={messages.knowledgeDetail.noUsersAssociated}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>

        {/* Associated Teams Card */}
        <Card
          title={messages.knowledgeDetail.associatedTeams}
          size={isMobile ? "small" : "default"}
        >
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
                        size={isMobile ? "small" : "default"}
                      />
                    }
                    title={team.name}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              description={messages.knowledgeDetail.noTeamsAssociated}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      </Space>
    );
  };

  return (
    <MainLayout title={knowledge?.name || messages.knowledgeDetail.knowledgeDetail}>
      {/* Breadcrumb and Header - more compact on mobile */}
      <Row gutter={[isMobile ? 8 : 16, isMobile ? 12 : 24]} style={{ marginBottom: isMobile ? 12 : 24 }}>
        <Col span={24}>
          <Breadcrumb style={{ marginBottom: isMobile ? 8 : 16 }}>
            <Breadcrumb.Item>
              <Link href="/knowledge">{messages.knowledgeDetail.knowledge}</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{knowledge?.name || messages.knowledgeDetail.detail}</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      {/* Main Content - Unified layout for both mobile and desktop */}
      <Row>
        <Col span={24}>
          {isMobile ? renderMobileTabs() : (
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              size="large"
              style={{ marginBottom: 24 }}
            >
              <TabPane
                tab={
                  <span>
                    <FileOutlined />
                    <span style={{ marginLeft: 8 }}>{messages.knowledgeDetail.dataSet}</span>
                  </span>
                }
                key="files"
              >
                <KnowledgeFileList
                  knowledge={knowledge!}
                  isAuthenticated={isAuthenticated}
                  handleOpenUploadModal={handleOpenUploadModal}
                  openFileConfigModal={openFileConfigModal}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <SettingOutlined />
                    <span style={{ marginLeft: 8 }}>{messages.knowledgeDetail.config}</span>
                  </span>
                }
                key="content"
              >
                <Form form={form} layout="vertical">
                  <Card
                    title={messages.knowledgeDetail.description}
                    style={{ marginBottom: isMobile ? 12 : 24 }}
                    size={isMobile ? "small" : "default"}
                  >
                    <KnowledgeDetailForm form={form} />
                  </Card>
                  <Card
                    title={
                      <div>
                        <SettingOutlined /> Embedding Configuration
                      </div>
                    }
                    style={{ marginBottom: isMobile ? 12 : 24 }}
                    size={isMobile ? "small" : "default"}
                  >
                    <KnowledgeModelForm form={form} />
                  </Card>
                  <Card
                    title={
                      <div>
                        <SettingOutlined /> Chunking Configuration
                      </div>
                    }
                    style={{ marginBottom: isMobile ? 12 : 24 }}
                    size={isMobile ? "small" : "default"}
                  >
                    <KnowledgeConfigForm form={form} />
                  </Card>
                

                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSubmit}
                    block
                    disabled={!isAuthenticated}
                    size={isMobile ? "middle" : "large"}
                  >
                    {messages.knowledgeDetail.saveChanges}
                  </Button>
                </Form>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <SearchOutlined />
                    <span style={{ marginLeft: 8 }}>{messages.knowledgeDetail.testing.testing}</span>
                  </span>
                }
                key="testing"
              >
                {id && typeof id === "string" && (
                  <RetrievalTestingPanel knowledgeId={id} />
                )}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <InfoCircleOutlined />
                    <span style={{ marginLeft: 8 }}>{messages.knowledgeDetail.info}</span>
                  </span>
                }
                key="info"
              >
                {renderInfoContent()}
              </TabPane>
            </Tabs>
          )}
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
