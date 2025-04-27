import {
  AppstoreOutlined,
  ArrowRightOutlined,
  CloudOutlined,
  DatabaseOutlined,
  FileOutlined,
  LoginOutlined,
  RobotOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  List,
  Row,
  Space,
  Statistic,
  Tag,
  Typography
} from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import { getAgentCount } from "../services/agentService";
import { fetchAllFiles } from "../services/fileService";
import { fetchAllKnowledge } from "../services/knowledgeService";
import { useLocale } from "../locale";

const { Title, Text, Paragraph } = Typography;

export default function Home() {

  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { login, loginWithToken } = useAuth();

  const [files, setFiles] = useState<any[]>([]);
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [agentCount, setAgentCount] = useState<number>(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const { messages } = useLocale();
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      if (typeof login === 'function' && login.length === 1) {
        loginWithToken(token);
      }
      router.replace('/');
    }
  }, []);
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setStatsLoading(false);
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setStatsLoading(true);
    try {
      const [filesData, knowledgeData, agentsCount] = await Promise.all([
        fetchAllFiles(),
        fetchAllKnowledge(),
        getAgentCount()
      ]);
      setFiles(filesData);
      setKnowledge(knowledgeData);
      setAgentCount(agentsCount);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const features = [
    {
      title: messages.home.knowledgeBase,
      icon: <DatabaseOutlined style={{ fontSize: 24, color: "#1677ff" }} />,
      description: messages.home.knowledgeBaseDescription,
      action: () => router.push("/knowledge"),
    },
    {
      title: messages.home.fileManagement,
      icon: <FileOutlined style={{ fontSize: 24, color: "#52c41a" }} />,
      description: messages.home.fileManagementDescription,
      action: () => router.push("/files"),
    },
    {
      title: messages.home.aiAgents,
      icon: <RobotOutlined style={{ fontSize: 24, color: "#722ed1" }} />,
      description: messages.home.aiAgentsDescription,
      action: () => router.push("/agent"),
    },
  ];

  return (
    <MainLayout title="N-Flow | Home">
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px 0" }}>
        {loading ? (
          <div className="loading-container">Loading...</div>
        ) : (
          <>
            {/* Hero Section */}
            <Row gutter={[24, 32]} align="middle" style={{ marginBottom: 48 }}>
              <Col xs={24} md={14}>
                <div style={{ padding: "20px 0" }}>
                  <Title level={1} style={{ marginBottom: 16 }}>
                    {messages.home.welcomeToNFlow}
                  </Title>
                  <Paragraph style={{ fontSize: 18, marginBottom: 24 }}>
                    {messages.home.heroDescription}
                  </Paragraph>

                  {!isAuthenticated ? (
                    <Space size="middle">
                      <Button
                        type="primary"
                        size="large"
                        icon={<LoginOutlined />}
                        onClick={() => router.push("/auth/login")}
                      >
                        {messages.home.signIn}
                      </Button>
                      <Button
                        size="large"
                        icon={<UserAddOutlined />}
                        onClick={() => router.push("/auth/register")}
                      >
                        {messages.home.createAccount}
                      </Button>
                    </Space>
                  ) : (
                    <Button
                      type="primary"
                      size="large"
                      icon={<AppstoreOutlined />}
                      onClick={() => router.push("/dashboard")}
                    >
                      {messages.home.goToDashboard}
                    </Button>
                  )}
                </div>
              </Col>
              <Col xs={24} md={10}>
                <Card>
                  {isAuthenticated ? (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        size={64}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: "#1677ff" }}
                      />
                      <div style={{ marginLeft: 16 }}>
                        <Title level={3} style={{ marginBottom: 4 }}>
                          <Button
                            type="link"
                            style={{ padding: 0 }}
                            onClick={() => router.push(`/user/${user?.id}`)}
                          >
                            {user?.name}
                          </Button>
                        </Title>
                        <Text>{user?.email}</Text>
                        <div style={{ marginTop: 8 }}>
                          <Tag color="blue">{user?.permission}</Tag>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <CloudOutlined style={{ fontSize: 64, color: "#1677ff", marginBottom: 16 }} />
                      <Title level={4}>{messages.home.cloudBasedPlatform}</Title>
                      <Paragraph>
                        {messages.home.cloudBasedDescription}
                      </Paragraph>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>

            {/* Dashboard Stats (for authenticated users) */}
            {isAuthenticated && (
              <Row gutter={[16, 16]} style={{ marginBottom: 48 }}>
                <Col xs={24} sm={8}>
                  <Card hoverable loading={statsLoading}>
                    <Statistic
                      title={messages.home.knowledgeBases}
                      value={knowledge.length}
                      prefix={<DatabaseOutlined />}
                      valueStyle={{ color: "#1677ff" }}
                    />
                    <div style={{ marginTop: 16 }}>
                      <Button type="link" onClick={() => router.push("/knowledge")}>
                        {messages.home.viewAll} <ArrowRightOutlined />
                      </Button>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card hoverable loading={statsLoading}>
                    <Statistic
                      title={messages.home.files}
                      value={files.length}
                      prefix={<FileOutlined />}
                      valueStyle={{ color: "#52c41a" }}
                    />
                    <div style={{ marginTop: 16 }}>
                      <Button type="link" onClick={() => router.push("/files")}>
                        {messages.home.viewAll} <ArrowRightOutlined />
                      </Button>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card hoverable loading={statsLoading}>
                    <Statistic
                      title={messages.home.aiAgents}
                      value={agentCount}
                      prefix={<RobotOutlined />}
                      valueStyle={{ color: "#722ed1" }}
                    />
                    <div style={{ marginTop: 16 }}>
                      <Button type="link" onClick={() => router.push("/agent")}>
                        {messages.home.viewAll} <ArrowRightOutlined />
                      </Button>
                    </div>
                  </Card>
                </Col>
              </Row>
            )}

            {/* Features Section */}
            <div style={{ marginBottom: 48 }}>
              <Title level={2} style={{ marginBottom: 24, textAlign: "center" }}>
                {messages.home.platformFeatures}
              </Title>
              <Row gutter={[24, 24]}>
                {features.map((feature, index) => (
                  <Col xs={24} md={8} key={index}>
                    <Card
                      hoverable
                      style={{ height: '100%' }}
                      actions={[
                        <Button
                          type="link"
                          key="explore"
                          onClick={feature.action}
                        >
                          {messages.home.explore} <ArrowRightOutlined />
                        </Button>
                      ]}
                    >
                      <div style={{ textAlign: "center", padding: "12px 0" }}>
                        <div style={{ marginBottom: 16 }}>{feature.icon}</div>
                        <Title level={4} style={{ marginBottom: 12 }}>
                          {feature.title}
                        </Title>
                        <Paragraph>{feature.description}</Paragraph>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Recent Activity or Getting Started */}
            {isAuthenticated && files.length > 0 ? (
              <div>
                <Title level={2} style={{ marginBottom: 24 }}>
                  {messages.home.recentFiles}
                </Title>
                <Card>
                  <List
                    loading={statsLoading}
                    dataSource={files.slice(0, 5)}
                    renderItem={(file) => (
                      <List.Item
                        key={file.id}
                        actions={[
                          <Button
                            type="link"
                            key="view"
                            onClick={() => router.push(`/files/${file.id}`)}
                          >
                            {messages.home.view}
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<FileOutlined style={{ fontSize: 20 }} />}
                          title={file.originalName}
                          description={`Uploaded: ${new Date(file.createdAt).toLocaleString()}`}
                        />
                        <div>
                          <Tag color={file.parsingStatus === 'completed' ? 'green' : 'orange'}>
                            {file.parsingStatus || 'pending'}
                          </Tag>
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>
              </div>
            ) : (
              <Card style={{ textAlign: "center", padding: "24px" }}>
                <Title level={3}>{messages.home.getStartedWithNFlow}</Title>
                <Paragraph style={{ fontSize: 16, marginBottom: 24 }}>
                  {messages.home.getStartedDescription}
                </Paragraph>
                <Steps
                  isAuthenticated={isAuthenticated}
                  onLoginClick={() => router.push("/auth/login")}
                  onRegisterClick={() => router.push("/auth/register")}
                  onKnowledgeClick={() => router.push("/knowledge")}
                  onFileClick={() => router.push("/files")}
                  onAgentClick={() => router.push("/agent")}
                  messages={messages}
                />
              </Card>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}

interface StepsProps {
  isAuthenticated: boolean;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onKnowledgeClick: () => void;
  onFileClick: () => void;
  onAgentClick: () => void;
  messages: any;
}

function Steps({
  isAuthenticated,
  onLoginClick,
  onRegisterClick,
  onKnowledgeClick,
  onFileClick,
  onAgentClick,
  messages
}: StepsProps) {
  return (
    <List
      bordered
      dataSource={[
        {
          title: isAuthenticated ? messages.home.stepsLoggedIn : messages.home.stepsCreateAccount,
          description: isAuthenticated
            ? messages.home.stepsLoggedInDescription
            : messages.home.stepsCreateAccountDescription,
          action: isAuthenticated ? null : (
            <Space>
              <Button type="primary" onClick={onLoginClick}>{messages.home.login}</Button>
              <Button onClick={onRegisterClick}>{messages.home.register}</Button>
            </Space>
          )
        },
        {
          title: messages.home.stepsCreateKnowledgeBase,
          description: messages.home.stepsCreateKnowledgeBaseDescription,
          action: <Button type="primary" onClick={onKnowledgeClick} disabled={!isAuthenticated}>
            {messages.home.createKnowledgeBase}
          </Button>
        },
        {
          title: messages.home.stepsUploadFiles,
          description: messages.home.stepsUploadFilesDescription,
          action: <Button type="primary" onClick={onFileClick} disabled={!isAuthenticated}>
            {messages.home.uploadFiles}
          </Button>
        },
        {
          title: messages.home.stepsCreateAiAgents,
          description: messages.home.stepsCreateAiAgentsDescription,
          action: <Button type="primary" onClick={onAgentClick} disabled={!isAuthenticated}>
            {messages.home.createAgent}
          </Button>
        }
      ]}
      renderItem={(item) => (
        <List.Item actions={item.action ? [item.action] : undefined}>
          <List.Item.Meta
            title={<Text strong>{item.title}</Text>}
            description={item.description}
          />
        </List.Item>
      )}
    />
  );
}
