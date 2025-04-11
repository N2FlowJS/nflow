import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Row,
  Space,
  Spin,
  Tabs,
  Typography,
  Tag,
  Badge,
  Timeline,
  Table,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CodeOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  FileOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SyncOutlined,
  UserOutlined,
} from "@ant-design/icons";
import MainLayout from "../../../../components/layout/MainLayout";
import { useAuth } from "../../../../context/AuthContext";
import { format } from "date-fns";
import {
  getParsingTaskStatus,
  parseFile,
  deleteParsingTask,
  fetchFileById,
} from "../../../../services/fileService";
import FileContentViewer from "../../../../components/files/FileContentViewer";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export default function TaskDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [task, setTask] = useState<any>(null);
  const [fileDetails, setFileDetails] = useState<any>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (id && typeof id === "string") {
      fetchTaskDetails(id);
    }
  }, [id, isAuthenticated, authLoading, router]);

  const fetchTaskDetails = async (taskId: string) => {
    try {
      setLoading(true);
      const taskData = await getParsingTaskStatus(taskId);
      
      setTask(taskData);

      if (taskData?.fileId) {
        const fileData = await fetchFileById(taskData.fileId);
        console.log(fileData);

        setFileDetails(fileData);

        // If task is completed, fetch file content
        if (taskData.status === "completed" && fileData.content) {
          setFileContent(fileData.content);
        }
      }

      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch task details");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!task?.file?.id) return;

    try {
      await parseFile(task.file.id);
      router.push("/admin/tasks"); // Go back to tasks list
    } catch (err: any) {
      setError(err.message || "Failed to retry parsing");
    }
  };

  const handleDelete = async () => {
    if (!task?.id) return;

    try {
      await deleteParsingTask(task.id);
      router.push("/admin/tasks"); // Go back to tasks list
    } catch (err: any) {
      setError(err.message || "Failed to delete task");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy HH:mm:ss");
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge status="default" text="Unknown" />;

    switch (status) {
      case "pending":
        return <Badge status="warning" text="Pending" />;
      case "processing":
        return <Badge status="processing" text="Processing" />;
      case "completed":
        return <Badge status="success" text="Completed" />;
      case "failed":
        return <Badge status="error" text="Failed" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  if (authLoading) {
    return (
      <MainLayout title="Loading...">Checking authentication...</MainLayout>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout title="Task Details">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Card>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Row align="middle" gutter={16}>
              <Col>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.push("/admin/tasks")}
                >
                  Back to Tasks
                </Button>
              </Col>
              <Col flex="auto">
                <Title level={4} style={{ margin: 0 }}>
                  Task Details{" "}
                  {task?.id && (
                    <Text type="secondary" copyable>
                      {task.id}
                    </Text>
                  )}
                </Title>
              </Col>
              <Col>
                <Space>
                  {task?.status === "failed" && (
                    <Button
                      type="primary"
                      icon={<ReloadOutlined />}
                      onClick={handleRetry}
                    >
                      Retry Parsing
                    </Button>
                  )}
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                  >
                    Delete Task
                  </Button>
                </Space>
              </Col>
            </Row>

            {error && (
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
                closable
              />
            )}

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>Loading task details...</div>
              </div>
            ) : (
              <>
                <Divider orientation="left">Task Information</Divider>
                <Descriptions
                  bordered
                  column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
                >
                  <Descriptions.Item label="Status">
                    {getStatusBadge(task?.status)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Created At">
                    {formatDate(task?.createdAt)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Updated At">
                    {formatDate(task?.updatedAt)}
                  </Descriptions.Item>
                  {task?.completedAt && (
                    <Descriptions.Item label="Completed At">
                      {formatDate(task?.completedAt)}
                    </Descriptions.Item>
                  )}
                  {task?.file && (
                    <Descriptions.Item label="File" span={2}>
                      <Space>
                        <FileOutlined />
                        <Text strong>{task.file.originalName}</Text>
                        <Text type="secondary" copyable>
                          {task.file.id}
                        </Text>
                      </Space>
                    </Descriptions.Item>
                  )}
                  {task?.errorMessage && (
                    <Descriptions.Item label="Error Message" span={3}>
                      <Alert message={task.errorMessage} type="error" />
                    </Descriptions.Item>
                  )}
                  {task?.message && (
                    <Descriptions.Item label="Task Message" span={3}>
                      <Alert
                        message={
                          task.status === "failed" ? "Error" : "Information"
                        }
                        description={task.message}
                        type={task.status === "failed" ? "error" : "info"}
                      />
                    </Descriptions.Item>
                  )}
                </Descriptions>

                <Divider orientation="left">File Details</Divider>
                {fileDetails ? (
                  <Descriptions
                    bordered
                    column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
                  >
                    <Descriptions.Item label="File Name">
                      {fileDetails.originalName}
                    </Descriptions.Item>
                    <Descriptions.Item label="MIME Type">
                      {fileDetails.mimetype}
                    </Descriptions.Item>
                    <Descriptions.Item label="Size">
                      {(fileDetails.size / 1024).toFixed(2)} KB
                    </Descriptions.Item>
                    <Descriptions.Item label="Created At">
                      {formatDate(fileDetails.createdAt)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Parsing Status">
                      {getStatusBadge(fileDetails.parsingStatus)}
                    </Descriptions.Item>
                    <Descriptions.Item label="File Path">
                      {fileDetails.path}
                    </Descriptions.Item>
                    {fileDetails.knowledge && (
                      <Descriptions.Item label="Knowledge" span={3}>
                        <Space>
                          <DatabaseOutlined />
                          <a href={`/knowledge/${fileDetails.knowledge.id}`}>
                            {fileDetails.knowledge.name}
                          </a>
                          <Text type="secondary">
                            {fileDetails.knowledge.description.slice(0, 100)}...
                          </Text>
                        </Space>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                ) : (
                  <Alert message="File details not available" type="warning" />
                )}

                {task?.status === "completed" && fileContent && (
                  <>
                    <Divider orientation="left">File Content</Divider>
                    <Card
                      title="File Content Preview"
                      extra={
                        <Button
                          type="link"
                          onClick={() =>
                            window.open(`/files/${task?.fileId}`, "_blank")
                          }
                        >
                          View in File Viewer
                        </Button>
                      }
                      style={{ marginBottom: "24px" }}
                    >
                      <FileContentViewer content={fileContent} />
                    </Card>
                  </>
                )}

                <Divider orientation="left">Task Timeline</Divider>
                <Timeline mode="left">
                  <Timeline.Item
                    dot={<ClockCircleOutlined style={{ fontSize: "16px" }} />}
                    color="blue"
                  >
                    Task Created{" "}
                    <Text type="secondary">{formatDate(task?.createdAt)}</Text>
                  </Timeline.Item>

                  {task?.status === "processing" && (
                    <Timeline.Item
                      dot={<SyncOutlined spin style={{ fontSize: "16px" }} />}
                      color="blue"
                    >
                      Processing Started{" "}
                      <Text type="secondary">
                        {formatDate(task?.updatedAt)}
                      </Text>
                    </Timeline.Item>
                  )}

                  {task?.status === "completed" && (
                    <Timeline.Item
                      dot={<CheckCircleOutlined style={{ fontSize: "16px" }} />}
                      color="green"
                    >
                      Completed{" "}
                      <Text type="secondary">
                        {formatDate(task?.completedAt)}
                      </Text>
                    </Timeline.Item>
                  )}

                  {task?.status === "failed" && (
                    <Timeline.Item
                      dot={<CloseCircleOutlined style={{ fontSize: "16px" }} />}
                      color="red"
                    >
                      Failed{" "}
                      <Text type="secondary">
                        {formatDate(task?.completedAt)}
                      </Text>
                    </Timeline.Item>
                  )}
                </Timeline>
              </>
            )}
          </Space>
        </Card>
      </div>
    </MainLayout>
  );
}
