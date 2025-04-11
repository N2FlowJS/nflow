import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Space,
  Typography,
  Avatar,
  Tag,
  Tooltip,
  Modal,
  message,
  Empty,
  Spin,
  Badge,
  Progress,
  Alert,
} from "antd";
import {
  UploadOutlined,
  EyeOutlined,
  SettingOutlined,
  DeleteOutlined,
  FileOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  FilterOutlined,
  SelectOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { Knowledge } from "../../types/knowledge";
import { parseFile, deleteFile, fetchFilesByKnowledgeId } from "../../services/fileService";
import { formatFileSize, getTypeFile } from "../../utils/formatters";

const { Title, Text } = Typography;

interface KnowledgeFileListProps {
  knowledge: Knowledge;
  isAuthenticated: boolean;
  handleOpenUploadModal: () => void;
  openFileConfigModal: (file: any) => void;
}

export default function KnowledgeFileList({
  knowledge,
  isAuthenticated,
  handleOpenUploadModal,
  openFileConfigModal,
}: KnowledgeFileListProps) {
  const router = useRouter();
  const [parsingFiles, setParsingFiles] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [batchActionLoading, setBatchActionLoading] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const fetchFiles = async () => {
    if (!knowledge?.id) return;

    setLoading(true);
    try {
      const filesData = await fetchFilesByKnowledgeId(knowledge.id);
      setFiles(filesData || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      message.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (knowledge?.id) {
      fetchFiles();

      console.log(`[SSE] Setting up SSE connection for knowledge ID ${knowledge.id}`);

      // Set up SSE connection for real-time updates with knowledge ID filter
      const sseUrl = `/api/events/fileParsingEvents?knowledgeId=${knowledge.id}`;
      console.log(`[SSE] Connecting to: ${sseUrl}`);

      const sse = new EventSource(sseUrl);

      sse.onopen = () => {
        console.log(`[SSE] Connection opened for knowledge ID ${knowledge.id}`);
      };
      sse.onmessage = (event) => {
        console.log(`[SSE] Raw event received:`, event.data);

        try {
          const data = JSON.parse(event.data);
          console.log(`[SSE] Parsed event:`, data);

          // Handle file status updates
          if (data.type === 'status-change') {
            console.log(`[SSE] File ${data.fileId} status changed to ${data.status}`);

            // Update the specific file in our state
            setFiles(prevFiles => {
              const updatedFiles = prevFiles.map(file =>
                file.id === data.fileId
                  ? { ...file, parsingStatus: data.status }
                  : file
              );
              console.log(`[SSE] Updated file state:`,
                updatedFiles.find(f => f.id === data.fileId));
              return updatedFiles;
            });

            // Reset parsing indicator for this file
            setParsingFiles(prev => {
              const newState = { ...prev, [data.fileId]: false };
              console.log(`[SSE] Updated parsing indicators:`, newState);
              return newState;
            });

            // Show notification based on status
            if (data.status === 'completed') {
              message.success(`File "${data.fileName}" parsed successfully`);
            } else if (data.status === 'failed') {
              message.error(`File "${data.fileName}" parsing failed${data.errorMessage ? `: ${data.errorMessage}` : ''}`);
            }
          } else if (data.type === 'connected') {
            console.log('[SSE] Successfully connected to file parsing events');
          } else if (data.type === 'ping') {
            console.log('[SSE] Received ping');
          }
        } catch (error) {
          console.error("[SSE] Error processing SSE message:", error);
        }
      };

      sse.onerror = (error) => {
        console.error("[SSE] Connection error:", error);
        // Try to reconnect after a short delay
        setTimeout(() => {
          console.log("[SSE] Attempting to reconnect...");
          sse.close();
          const newSSE = new EventSource(sseUrl);
          setEventSource(newSSE);
        }, 3000);
      };

      setEventSource(sse);

      // Clean up function
      return () => {
        console.log(`[SSE] Closing connection for knowledge ID ${knowledge.id}`);
        if (sse) {
          sse.close();
        }
      };
    }
  }, [knowledge?.id]);

  const handleParseFile = async (fileId: string) => {
    if (!isAuthenticated) {
      message.error("You must be logged in to parse files");
      return;
    }

    try {
      setParsingFiles((prev) => ({ ...prev, [fileId]: true }));

      const result = await parseFile(fileId);

      if (result.success) {
        message.success("File parsing task created successfully");
        // Refresh files after a brief delay
        setTimeout(() => {
          fetchFiles();
        }, 1000);
      } else {
        message.error(result.message || "Failed to create parsing task");
      }
    } catch (error) {
      console.error("Parse file error:", error);
      message.error("An error occurred while setting up file parsing");
    } finally {
      setParsingFiles((prev) => ({ ...prev, [fileId]: false }));
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!knowledge?.id) return;

    try {
      await deleteFile(knowledge.id, fileId);
      message.success("File deleted successfully");
      fetchFiles();
    } catch (error) {
      console.error("Delete file error:", error);
      message.error("Failed to delete file");
    }
  };

  const handleBatchParseFiles = async () => {
    if (!isAuthenticated) {
      message.error("You must be logged in to parse files");
      return;
    }

    try {
      setBatchActionLoading(true);
      // Start showing parsing status for all selected files
      const updatedParsingFiles = { ...parsingFiles };
      selectedFileIds.forEach(fileId => {
        updatedParsingFiles[fileId] = true;
      });
      setParsingFiles(updatedParsingFiles);

      // Parse each file sequentially
      let completed = 0;
      for (const fileId of selectedFileIds) {
        await parseFile(fileId);
        completed++;
        // Update progress message
        message.info({
          content: `Processing file ${completed} of ${selectedFileIds.length}`,
          key: 'batch-progress',
          duration: 1
        });
      }

      message.success(`${selectedFileIds.length} files queued for parsing`);
      setSelectedFileIds([]);

      // Refresh files after a brief delay
      setTimeout(() => {
        fetchFiles();
      }, 1000);
    } catch (error) {
      console.error("Batch parse files error:", error);
      message.error("An error occurred while parsing files");
    } finally {
      setBatchActionLoading(false);
      // Clear parsing status
      const clearedParsingFiles = { ...parsingFiles };
      selectedFileIds.forEach(fileId => {
        clearedParsingFiles[fileId] = false;
      });
      setParsingFiles(clearedParsingFiles);
    }
  };

  const handleBatchDeleteFiles = () => {
    Modal.confirm({
      title: "Delete Files",
      content: (
        <div>
          <p>Are you sure you want to delete {selectedFileIds.length} files?</p>
          <p style={{ color: '#ff4d4f' }}><b>This action cannot be undone.</b></p>
        </div>
      ),
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        if (!knowledge?.id) return;

        try {
          setBatchActionLoading(true);
          // Delete each file sequentially
          let completed = 0;
          for (const fileId of selectedFileIds) {
            await deleteFile(knowledge.id, fileId);
            completed++;
            // Update progress message
            if (selectedFileIds.length > 3) {
              message.info({
                content: `Deleted ${completed} of ${selectedFileIds.length} files`,
                key: 'batch-delete-progress',
                duration: 1
              });
            }
          }

          message.success(`${selectedFileIds.length} files deleted successfully`);
          setSelectedFileIds([]);
          fetchFiles();
        } catch (error) {
          console.error("Batch delete files error:", error);
          message.error("Failed to delete some files");
        } finally {
          setBatchActionLoading(false);
        }
      }
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy HH:mm:ss");
  };

  // Get status icon for file parsing status
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "pending":
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
      case "processing":
        return <SyncOutlined spin style={{ color: "#1890ff" }} />;
      case "failed":
        return <CloseCircleOutlined style={{ color: "#f5222d" }} />;
      default:
        return <FileOutlined />;
    }
  };

  // Row selection configuration with clearer selection options
  const rowSelection = {
    selectedRowKeys: selectedFileIds,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedFileIds(selectedRowKeys as string[]);
    },
    selections: [
      {
        key: 'all-data',
        text: 'Select All Files',
        onSelect: () => {
          const allIds = files.map(file => file.id);
          setSelectedFileIds(allIds);
        },
      },
      {
        key: 'not-parsed',
        text: 'Select Not Parsed',
        onSelect: () => {
          const notParsedIds = files
            .filter(file => !file.parsingStatus || file.parsingStatus === 'failed')
            .map(file => file.id);
          setSelectedFileIds(notParsedIds);
        },
      },
      {
        key: 'parsed',
        text: 'Select Parsed',
        onSelect: () => {
          const parsedIds = files
            .filter(file => file.parsingStatus === 'completed')
            .map(file => file.id);
          setSelectedFileIds(parsedIds);
        },
      },
      {
        key: 'invert',
        text: 'Invert Selection',
        onSelect: () => {
          const allIds = files.map(file => file.id);
          const invertedSelection = allIds.filter(id => !selectedFileIds.includes(id));
          setSelectedFileIds(invertedSelection);
        },
      },
    ],
  };

  const renderBatchActions = () => {
    if (selectedFileIds.length === 0) {
      return null;
    }

    return (
      <Alert
        type="info"
        showIcon
        message={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space>
              <Badge count={selectedFileIds.length} overflowCount={999} style={{ backgroundColor: '#1677ff' }} />
              <span><b>{selectedFileIds.length}</b> files selected</span>
            </Space>
            <Space>
              <Tooltip title="Process all selected files">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleBatchParseFiles}
                  loading={batchActionLoading}
                  disabled={batchActionLoading}
                >
                  Parse Selected
                </Button>
              </Tooltip>
              <Tooltip title="Delete all selected files">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleBatchDeleteFiles}
                  loading={batchActionLoading}
                  disabled={batchActionLoading}
                >
                  Delete Selected
                </Button>
              </Tooltip>
              <Tooltip title="Clear selection">
                <Button
                  icon={<ClearOutlined />}
                  onClick={() => setSelectedFileIds([])}
                  disabled={batchActionLoading}
                >
                  Clear
                </Button>
              </Tooltip>
            </Space>
          </div>
        }
        style={{ marginBottom: 16 }}
      />
    );
  };

  // Add status filtering options
  const statusFilters = [
    { text: 'Completed', value: 'completed' },
    { text: 'Processing', value: 'processing' },
    { text: 'Pending', value: 'pending' },
    { text: 'Failed', value: 'failed' },
    { text: 'Not Parsed', value: 'not_parsed' },
  ];

  // Enhanced columns with filtering
  const columns = [
    {
      title: "File",
      dataIndex: "originalName",
      key: "originalName",
      render: (text: string, record: any) => (
        <Space>
          <Avatar
            icon={getStatusIcon(record.parsingStatus)}
            style={{
              backgroundColor:
                record.parsingStatus === "completed"
                  ? "#f6ffed"
                  : record.parsingStatus === "failed"
                    ? "#fff2f0"
                    : "#f0f5ff",
              color:
                record.parsingStatus === "completed"
                  ? "#52c41a"
                  : record.parsingStatus === "failed"
                    ? "#f5222d"
                    : "#1890ff",
            }}
          />
          <div>
            <div>
              <Text strong>{text}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatFileSize(record.size)} • {getTypeFile(record.mimetype)}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "parsingStatus",
      key: "parsingStatus",
      width: 120,
      filters: statusFilters,
      onFilter: (value: any, record: any) => {
        // Handle null/undefined case separately
        if (value === 'not_parsed') {
          return !record.parsingStatus;
        }
        return record.parsingStatus === value;
      },
      render: (status: string) => (
        <Tag
          color={
            status === "completed"
              ? "success"
              : status === "processing"
                ? "processing"
                : status === "failed"
                  ? "error"
                  : "default"
          }
        >
          {status || "Not parsed"}
        </Tag>
      ),
    },
    {
      title: "Parse",
      key: "parse",
      width: 100,
      render: (_: any, record: any) => {
        const isParsing =
          parsingFiles[record.id] || record.parsingStatus === "processing";
        const isParsed =
          record.parsingStatus === "completed" ||
          record.parsingStatus === "failed";

        return (
          <Button
            size="large"
            icon={
              isParsed ? (
                <SyncOutlined />
              ) : (
                <PlayCircleOutlined color="#1677ff" />
              )
            }
            loading={parsingFiles[record.id]}
            onClick={() => handleParseFile(record.id)}
            disabled={isParsing && !parsingFiles[record.id]}
          />
        );
      },
    },
    {
      title: "Uploaded",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      render: (date: string) => (
        <Text type="secondary">{formatDate(date)}</Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title={`View details ${record.originalName}`}>
            <Button
              type="text"

              icon={<EyeOutlined />}
              onClick={() => router.push(`/files/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Configure Chunking">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => openFileConfigModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete File">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() =>
                Modal.confirm({
                  title: "Delete File",
                  content:
                    "Are you sure you want to delete this file? This action cannot be undone.",
                  okText: "Delete",
                  okType: "danger",
                  onOk: () => handleDeleteFile(record.id),
                })
              }
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={<Title level={4}>Files</Title>}
      extra={
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={handleOpenUploadModal}
          disabled={!isAuthenticated}
        >
          Upload Files
        </Button>
      }
      style={{ marginBottom: 24 }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      ) : files && files.length > 0 ? (
        <>
          {renderBatchActions()}
          {batchActionLoading && (
            <Progress
              percent={Math.round((Object.values(parsingFiles).filter(v => v).length / selectedFileIds.length) * 100)}
              status="active"
              style={{ marginBottom: 16 }}
            />
          )}
          <Table
            rowSelection={rowSelection}
            dataSource={files}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
            }}
          />
        </>
      ) : (
        <Empty
          description="No files have been uploaded yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button
            type="primary"
            onClick={handleOpenUploadModal}
            disabled={!isAuthenticated}
          >
            Upload Now
          </Button>
        </Empty>
      )}
    </Card>
  );
}
