import React, { useEffect, useState } from "react";
import {
  Button,
  Space,
  Typography,
  Card,
  Spin,
  Descriptions,
  Image,
  Tag,
  Breadcrumb,
  Divider,
  Tabs,  // Using Tabs instead of Segmented for better look
  List,
  Empty,
  Badge,
  Alert,
  Tooltip,
  Row,
  Col,
  message,
  Popconfirm,
  Avatar,  // Added for better visual styling
  Skeleton,  // Added for better loading states
} from "antd";
import {
  DownloadOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  FileImageOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileUnknownOutlined,
  FileZipOutlined,
  CopyOutlined,
  InfoCircleOutlined,  // Added for information icons
  FileOutlined,  // For file content tab
  PartitionOutlined,  // For chunks tab
} from "@ant-design/icons";
import { useRouter } from "next/router";
import MainLayout from "../../components/layout/MainLayout";
import { useAuth } from "../../context/AuthContext";
import {
  fetchFileById,
  deleteFile,
  getFileDownloadUrl,
  getFileContent,
} from "../../services/fileService";
import Link from "next/link";
import FileContentViewer from "../../components/files/FileContentViewer";
import FileChunks from "../../components/files/FileChunks";
import { getTypeFile } from "../../utils/client/formatters";

const { Title, Text, Paragraph } = Typography;

interface File {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  createdAt: string;
  knowledgeId: string;
  parsingStatus?: string;
  knowledge?: {
    id: string;
    name: string;
  };
}

export default function FileDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const [contentFormat, setContentFormat] = useState<
    "raw" | "markdown" | "html"
  >("raw");
  const [activeTabKey, setActiveTabKey] = useState("content"); // For the right panel tabs
  const isImage = file?.mimetype.startsWith("image/");
  const isPdf = file?.mimetype.includes("pdf");
  const fileUrl = file ? `/files/${file.knowledgeId}/${file.filename}` : "";

  useEffect(() => {
    if (id && typeof id === "string") {
      loadFile(id);
    }
  }, [id]);

  useEffect(() => {
    // Load content if file exists, is not image/pdf, and content hasn't been loaded
    if (file && file.id && !isImage && !isPdf && !fileContent && !contentLoading) {
      loadFileContent(file.id);
    }
  }, [file, isImage, isPdf, fileContent, contentLoading]); // Updated dependencies

  const loadFile = async (fileId: string) => {
    setLoading(true);
    try {
      const data = await fetchFileById(fileId);
      setFile(data);
    } catch (error) {
      console.error("Error loading file:", error);
      message.error("Failed to load file details");
    } finally {
      setLoading(false);
    }
  };

  const loadFileContent = async (fileId: string) => {
    setContentLoading(true);
    try {
      const data = await getFileContent(fileId);
      setFileContent(data.content);
    } catch (error) {
      console.error("Error loading file content:", error);
      setFileContent(null);
    } finally {
      setContentLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!file) return;

    try {
      const success = await deleteFile(file.knowledgeId, file.id);
      if (success) {
        message.success("File deleted successfully");
        router.push("/files");
      } else {
        message.error("Failed to delete file");
      }
    } catch (error) {
      console.error("Delete error:", error);
      message.error("An error occurred while deleting the file");
    }
  };

  const handleDownload = () => {
    if (!file) return;
    window.open(getFileDownloadUrl(file.knowledgeId, file.id), "_blank");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith("image/"))
      return <FileImageOutlined style={{ fontSize: 24 }} />;
    if (mimetype.includes("pdf"))
      return <FilePdfOutlined style={{ fontSize: 24 }} />;
    if (mimetype.includes("excel") || mimetype.includes("spreadsheet"))
      return <FileExcelOutlined style={{ fontSize: 24 }} />;
    if (mimetype.includes("zip") || mimetype.includes("compressed"))
      return <FileZipOutlined style={{ fontSize: 24 }} />;
    if (mimetype.includes("text") || mimetype.includes("document"))
      return <FileTextOutlined style={{ fontSize: 24 }} />;
    return <FileUnknownOutlined style={{ fontSize: 24 }} />;
  };


  if (loading) {
    return (
      <MainLayout title="Loading File">
        <div style={{ padding: "24px", textAlign: "center" }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!file && !loading) {
    return (
      <MainLayout title="File Not Found">
        <div style={{ padding: "24px" }}>
          <Title level={4}>File not found</Title>
          <Button type="primary" onClick={() => router.push("/files")}>
            Back to Files
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={file?.originalName || "File Detail"}>
      <div style={{ padding: "16px 24px" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Enhanced Breadcrumb with File Icon */}
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/files">
                <Space size={4}>
                  <FileOutlined />
                  <span>Files</span>
                </Space>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Space size={4}>
                <span style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file?.originalName || "File Detail"}
                </span>
              </Space>
            </Breadcrumb.Item>
          </Breadcrumb>

          {/* Improved Header Section with shadow and better styling */}
          <Card style={{ borderRadius: '8px', }}>
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
              <Col flex="auto">
                <Space align="center" size="middle">
                  <Avatar
                    shape="square"
                    size={48}
                    icon={getFileIcon(file?.mimetype || "")}
                    style={{
                      backgroundColor: file?.mimetype.startsWith("image/") ? '#1677ff' :
                        file?.mimetype.includes("pdf") ? '#ff4d4f' :
                          file?.mimetype.includes("excel") ? '#52c41a' : '#faad14',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  />
                  <div>
                    <Title level={3} style={{ marginBottom: 0, wordBreak: 'break-word' }}>
                      {file?.originalName}
                    </Title>
                    <Space size={16}>
                      <Text type="secondary">{formatFileSize(file?.size || 0)}</Text>
                      <Tag color={file?.parsingStatus === 'completed' ? 'success' : file?.parsingStatus === 'failed' ? 'error' : 'processing'}>
                        {file?.parsingStatus || 'N/A'}
                      </Tag>
                    </Space>
                  </div>
                </Space>
              </Col>
              <Col>
                <Space wrap style={{ justifyContent: 'flex-end' }}>
                  <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.push("/files")}
                  >
                    Back
                  </Button>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                  >
                    Download
                  </Button>
                  {isAuthenticated && (
                    <Popconfirm
                      title="Delete this file?"
                      description="Are you sure you want to delete this file?"
                      onConfirm={handleDelete}
                      okText="Yes, Delete"
                      cancelText="No"
                      placement="leftTop"
                    >
                      <Button danger icon={<DeleteOutlined />}>
                        Delete
                      </Button>
                    </Popconfirm>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Two-column layout with better styling */}
          <Row gutter={[24, 24]}>
            {/* Left Column: File Information */}
            <Col xs={24} md={8}>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <InfoCircleOutlined />
                    <span>File Information</span>
                  </div>
                }
                style={{ height: '100%', borderRadius: '8px' }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {/* Basic Info Group */}
                  <div>
                    <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 12, fontSize: '16px' }}>
                      Basic Information
                    </Typography.Title>
                    <div style={{ padding: '0 8px' }}>
                      <div style={{ marginBottom: 12, display: 'flex', borderBottom: '1px dashed #f0f0f0', paddingBottom: '8px' }}>
                        <Typography.Text type="secondary" style={{ width: '120px', flexShrink: 0 }}>Name:</Typography.Text>
                        <Typography.Text style={{ flex: 1 }} ellipsis={{ tooltip: file?.originalName }}>{file?.originalName}</Typography.Text>
                      </div>
                      <div style={{ marginBottom: 12, display: 'flex', borderBottom: '1px dashed #f0f0f0', paddingBottom: '8px' }}>
                        <Typography.Text type="secondary" style={{ width: '120px', flexShrink: 0 }}>Type:</Typography.Text>
                        <div>
                          <Tag color="blue">{getTypeFile(file?.mimetype)}</Tag>
                        </div>
                      </div>
                      <div style={{ marginBottom: 12, display: 'flex', borderBottom: '1px dashed #f0f0f0', paddingBottom: '8px' }}>
                        <Typography.Text type="secondary" style={{ width: '120px', flexShrink: 0 }}>Size:</Typography.Text>
                        <Typography.Text>{formatFileSize(file?.size || 0)}</Typography.Text>
                      </div>
                      <div style={{ marginBottom: 12, display: 'flex', borderBottom: '1px dashed #f0f0f0', paddingBottom: '8px' }}>
                        <Typography.Text type="secondary" style={{ width: '120px', flexShrink: 0 }}>Uploaded:</Typography.Text>
                        <Typography.Text>
                          {new Date(file?.createdAt || "").toLocaleString()}
                        </Typography.Text>
                      </div>
                      <div style={{ marginBottom: 12, display: 'flex', borderBottom: '1px dashed #f0f0f0', paddingBottom: '8px' }}>
                        <Typography.Text type="secondary" style={{ width: '120px', flexShrink: 0 }}>Knowledge:</Typography.Text>
                        <Link href={`/knowledge/${file?.knowledgeId}`} style={{ color: '#1677ff' }}>
                          {file?.knowledge?.name || file?.knowledgeId}
                        </Link>
                      </div>
                      <div style={{ marginBottom: 12, display: 'flex' }}>
                        <Typography.Text type="secondary" style={{ width: '120px', flexShrink: 0 }}>Status:</Typography.Text>
                        <Tag color={file?.parsingStatus === 'completed' ? 'success' : file?.parsingStatus === 'failed' ? 'error' : 'processing'}>
                          {file?.parsingStatus || 'N/A'}
                        </Tag>
                      </div>
                    </div>
                  </div>

                  <Divider style={{ margin: '12px 0' }} />

                  {/* System Info Group */}
                  <div>
                    <Typography.Title level={5} style={{ marginBottom: 12, fontSize: '16px' }}>
                      System Information
                    </Typography.Title>
                    <div style={{ padding: '0 8px' }}>
                      <div style={{ marginBottom: 12 }}>
                        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Internal Filename:</Typography.Text>
                        <div style={{
                          background: '#f5f5f5',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          wordBreak: 'break-all',
                          fontSize: '13px',
                          position: 'relative'
                        }}>
                          {file?.filename}
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => {
                              navigator.clipboard.writeText(file?.filename || '');
                              message.success('Filename copied');
                            }}
                            style={{ position: 'absolute', right: 0, top: 0 }}
                            className="copy-button"
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: 0 }}>
                        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Storage Path:</Typography.Text>
                        <div style={{
                          background: '#f5f5f5',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          wordBreak: 'break-all',
                          fontSize: '13px',
                          position: 'relative'
                        }}>
                          {file?.path}
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => {
                              navigator.clipboard.writeText(file?.path || '');
                              message.success('Path copied');
                            }}
                            style={{ position: 'absolute', right: 0, top: 0 }}
                            className="copy-button"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>

            {/* Right Column: Preview/Content/Chunks with enhanced UI */}
            <Col xs={24} md={16}>
              {isImage ? (
                <Card
                  title={<Space><FileImageOutlined /> Image Preview</Space>}
                  style={{ borderRadius: '8px', }}
                >
                  <div style={{ textAlign: "center" }}>
                    <Image
                      src={fileUrl}
                      alt={file?.originalName}
                      style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: '4px' }}
                    />
                  </div>
                </Card>
              ) : isPdf ? (
                <Card
                  title={<Space><FilePdfOutlined /> PDF Preview</Space>}
                  style={{ borderRadius: '8px', }}
                >
                  <div style={{ height: "80vh", width: "100%" }}>
                    <iframe
                      src={fileUrl}
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "1px solid #f0f0f0",
                        borderRadius: '4px'
                      }}
                      title={file?.originalName}
                    />
                  </div>
                </Card>
              ) : (
                <Card
                  style={{ borderRadius: '8px', }}
                >
                  <Tabs
                    activeKey={activeTabKey}
                    onChange={setActiveTabKey}
                    items={[
                      {
                        key: "content",
                        label: (
                          <span>
                            <FileOutlined /> File Content
                          </span>
                        ),
                        children: (
                          <div style={{ padding: '16px 24px' }}>
                            {contentLoading ? (
                              <div style={{ padding: "40px 0" }}>
                                <Skeleton active paragraph={{ rows: 10 }} />
                              </div>
                            ) : fileContent ? (
                              <div className="file-content-viewer">
                                <FileContentViewer content={fileContent} />
                              </div>
                            ) : (
                              <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                  <span>
                                    Preview not available or content is empty.
                                    <br />
                                    Try downloading the file.
                                  </span>
                                }
                              >
                                <Button
                                  type="primary"
                                  icon={<DownloadOutlined />}
                                  onClick={handleDownload}
                                >
                                  Download File
                                </Button>
                              </Empty>
                            )}
                          </div>
                        )
                      },
                      {
                        key: "chunks",
                        label: (
                          <span>
                            <PartitionOutlined /> File Chunks
                            <Badge count={file?.id ? "..." : 0} style={{ marginLeft: 8 }} />
                          </span>
                        ),
                        children: file?.id ? (
                          <FileChunks fileId={file.id} />
                        ) : (
                          <Empty description="File ID not available" />
                        )
                      }
                    ]}
                    centered
                    type="card"
                    size="large"
                  />
                </Card>
              )}
            </Col>
          </Row>
        </Space >
      </div >
    </MainLayout >
  );
}
