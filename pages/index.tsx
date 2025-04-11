import {
  DatabaseOutlined,
  FileOutlined,
  LoginOutlined,
  RobotOutlined,
  UserAddOutlined,
  UserOutlined,
  ArrowRightOutlined,
  AppstoreOutlined,
  CloudOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Row,
  Space,
  Typography,
  Statistic,
  List,
  Tag,
} from "antd";
import { useRouter } from "next/router";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../locale";
import { useTheme } from "../theme";
import { useState, useEffect } from "react";
import { fetchAllFiles } from "../services/fileService";
import { fetchAllKnowledge } from "../services/knowledgeService";
import { getAgentCount } from "../services/agentService";

const { Title, Text, Paragraph } = Typography;

export default function Home() {
  const { locale } = useLocale();
  const { theme } = useTheme();
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<any[]>([]);
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [agentCount, setAgentCount] = useState<number>(0);
  const [statsLoading, setStatsLoading] = useState(true);

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
      title: "Knowledge Base",
      icon: <DatabaseOutlined style={{ fontSize: 24, color: "#1677ff" }} />,
      description: "Create and manage your knowledge repositories",
      action: () => router.push("/knowledge"),
    },
    {
      title: "File Management",
      icon: <FileOutlined style={{ fontSize: 24, color: "#52c41a" }} />,
      description: "Upload, organize, and process various file formats",
      action: () => router.push("/files"),
    },
    {
      title: "AI Agents",
      icon: <RobotOutlined style={{ fontSize: 24, color: "#722ed1" }} />,
      description: "Build and configure custom AI agents for your tasks",
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
                    Welcome to N-Flow
                  </Title>
                  <Paragraph style={{ fontSize: 18, marginBottom: 24 }}>
                    Your comprehensive platform for knowledge management and AI agents.
                    Organize files, build smart systems, and leverage AI to boost your productivity.
                  </Paragraph>

                  {!isAuthenticated ? (
                    <Space size="middle">
                      <Button 
                        type="primary" 
                        size="large" 
                        icon={<LoginOutlined />} 
                        onClick={() => router.push("/auth/login")}
                      >
                        Sign In
                      </Button>
                      <Button 
                        size="large" 
                        icon={<UserAddOutlined />}
                        onClick={() => router.push("/auth/register")}
                      >
                        Create Account
                      </Button>
                    </Space>
                  ) : (
                    <Button 
                      type="primary" 
                      size="large" 
                      icon={<AppstoreOutlined />}
                      onClick={() => router.push("/dashboard")}
                    >
                      Go to Dashboard
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
                        <Title level={3} style={{ marginBottom: 4 }}>{user?.name}</Title>
                        <Text>{user?.email}</Text>
                        <div style={{ marginTop: 8 }}>
                          <Tag color="blue">{user?.permission}</Tag>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <CloudOutlined style={{ fontSize: 64, color: "#1677ff", marginBottom: 16 }} />
                      <Title level={4}>Cloud-Based Platform</Title>
                      <Paragraph>
                        Access your data from anywhere, anytime. 
                        Create an account to get started.
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
                      title="Knowledge Bases"
                      value={knowledge.length}
                      prefix={<DatabaseOutlined />}
                      valueStyle={{ color: "#1677ff" }}
                    />
                    <div style={{ marginTop: 16 }}>
                      <Button type="link" onClick={() => router.push("/knowledge")}>
                        View All <ArrowRightOutlined />
                      </Button>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card hoverable loading={statsLoading}>
                    <Statistic
                      title="Files"
                      value={files.length}
                      prefix={<FileOutlined />}
                      valueStyle={{ color: "#52c41a" }}
                    />
                    <div style={{ marginTop: 16 }}>
                      <Button type="link" onClick={() => router.push("/files")}>
                        View All <ArrowRightOutlined />
                      </Button>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card hoverable loading={statsLoading}>
                    <Statistic
                      title="AI Agents"
                      value={agentCount}
                      prefix={<RobotOutlined />}
                      valueStyle={{ color: "#722ed1" }}
                    />
                    <div style={{ marginTop: 16 }}>
                      <Button type="link" onClick={() => router.push("/agent")}>
                        View All <ArrowRightOutlined />
                      </Button>
                    </div>
                  </Card>
                </Col>
              </Row>
            )}

            {/* Features Section */}
            <div style={{ marginBottom: 48 }}>
              <Title level={2} style={{ marginBottom: 24, textAlign: "center" }}>
                Platform Features
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
                          Explore <ArrowRightOutlined />
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
                  Recent Files
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
                            View
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
                <Title level={3}>Get Started with N-Flow</Title>
                <Paragraph style={{ fontSize: 16, marginBottom: 24 }}>
                  Follow these steps to start managing your knowledge and AI agents
                </Paragraph>
                <Steps
                  isAuthenticated={isAuthenticated}
                  onLoginClick={() => router.push("/auth/login")}
                  onRegisterClick={() => router.push("/auth/register")}
                  onKnowledgeClick={() => router.push("/knowledge")}
                  onFileClick={() => router.push("/files")}
                  onAgentClick={() => router.push("/agent")}
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
}

function Steps({ 
  isAuthenticated, 
  onLoginClick, 
  onRegisterClick, 
  onKnowledgeClick, 
  onFileClick, 
  onAgentClick 
}: StepsProps) {
  return (
    <List
      bordered
      dataSource={[
        {
          title: isAuthenticated ? "✅ Login" : "Step 1: Create an Account or Login",
          description: isAuthenticated 
            ? "You are logged in" 
            : "Create your account to get started with all features",
          action: isAuthenticated ? null : (
            <Space>
              <Button type="primary" onClick={onLoginClick}>Login</Button>
              <Button onClick={onRegisterClick}>Register</Button>
            </Space>
          )
        },
        {
          title: "Step 2: Create a Knowledge Base",
          description: "Create your first knowledge repository to organize your information",
          action: <Button type="primary" onClick={onKnowledgeClick} disabled={!isAuthenticated}>
            Create Knowledge Base
          </Button>
        },
        {
          title: "Step 3: Upload and Process Files",
          description: "Upload documents, spreadsheets, and text files for processing",
          action: <Button type="primary" onClick={onFileClick} disabled={!isAuthenticated}>
            Upload Files
          </Button>
        },
        {
          title: "Step 4: Create AI Agents",
          description: "Build AI agents that leverage your knowledge base",
          action: <Button type="primary" onClick={onAgentClick} disabled={!isAuthenticated}>
            Create Agent
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
