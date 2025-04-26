import {
  CheckCircleOutlined,
  ClearOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileOutlined,
  MoreOutlined,
  PlayCircleOutlined,
  SelectOutlined,
  SettingOutlined,
  SyncOutlined,
  UploadOutlined
} from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Dropdown,
  Empty,
  Grid,
  Modal,
  Progress,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  message
} from "antd";
import { format } from "date-fns";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Knowledge } from "../../models/knowledge";
import { deleteFile, fetchFilesByKnowledgeId, parseFile } from "../../services/fileService";
import { formatFileSize, getTypeFile } from "../../utils/client/formatters";
import { useLocale } from "../../locale";

const { useBreakpoint } = Grid;
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
  const [, setEventSource] = useState<EventSource | null>(null);
  const screens = useBreakpoint();
  const { t } = useLocale('');

  const fetchFiles = React.useCallback(async () => {
    if (!knowledge?.id) return;

    setLoading(true);
    try {
      const filesData = await fetchFilesByKnowledgeId(knowledge.id);
      setFiles(filesData || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      message.error(t('knowledgeDetail.fetchKnowledgeFailed') || "Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [knowledge.id, t]);

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
              message.success(t('tasksMonitor.completed') || `File "${data.fileName}" parsed successfully`);
            } else if (data.status === 'failed') {
              message.error((t('tasksMonitor.failed') || `File "${data.fileName}" parsing failed`) + (data.errorMessage ? `: ${data.errorMessage}` : ''));
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
    return undefined; // Ensure all code paths return a value
  }, [knowledge?.id, fetchFiles, t]);

  const handleParseFile = async (fileId: string) => {
    if (!isAuthenticated) {
      message.error(t('knowledgeList.loginRequired') || "You must be logged in to parse files");
      return;
    }

    try {
      setParsingFiles((prev) => ({ ...prev, [fileId]: true }));

      const result = await parseFile(fileId);

      if (result.success) {
        message.success(t('tasksMonitor.retryParsing') || "File parsing task created successfully");
        // Refresh files after a brief delay
        setTimeout(() => {
          fetchFiles();
        }, 1000);
      } else {
        message.error(result.message || t('tasksMonitor.error') || "Failed to create parsing task");
      }
    } catch (error) {
      console.error("Parse file error:", error);
      message.error(t('tasksMonitor.error') || "An error occurred while setting up file parsing");
    } finally {
      setParsingFiles((prev) => ({ ...prev, [fileId]: false }));
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!knowledge?.id) return;

    try {
      await deleteFile(knowledge.id, fileId);
      message.success(t('tasksMonitor.deleteTask') || "File deleted successfully");
      fetchFiles();
    } catch (error) {
      console.error("Delete file error:", error);
      message.error(t('tasksMonitor.error') || "Failed to delete file");
    }
  };

  const handleBatchParseFiles = async () => {
    if (!isAuthenticated) {
      message.error(t('knowledgeList.loginRequired') || "You must be logged in to parse files");
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
          content: t('dashboard.processingProgress') ? `${t('dashboard.processingProgress')} ${completed} of ${selectedFileIds.length}` : `Processing file ${completed} of ${selectedFileIds.length}`,
          key: 'batch-progress',
          duration: 1
        });
      }

      message.success(t('dashboard.fileAnalysis') || `${selectedFileIds.length} files queued for parsing`);
      setSelectedFileIds([]);

      // Refresh files after a brief delay
      setTimeout(() => {
        fetchFiles();
      }, 1000);
    } catch (error) {
      console.error("Batch parse files error:", error);
      message.error(t('tasksMonitor.error') || "An error occurred while parsing files");
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
      title: t('tasksMonitor.deleteTask') || "Delete Files",
      content: (
        <div>
          <p>{t('knowledgeList.deleteConfirmation') ? `${t('knowledgeList.deleteConfirmation').replace('this item', `${selectedFileIds.length} files`)}` : `Are you sure you want to delete ${selectedFileIds.length} files?`}</p>
          <p style={{ color: '#ff4d4f' }}><b>{t('tasksMonitor.error') || "This action cannot be undone."}</b></p>
        </div>
      ),
      okText: t('knowledgeList.yes') || "Delete",
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
                content: t('dashboard.processingProgress') ? `${t('dashboard.processingProgress')} ${completed} of ${selectedFileIds.length}` : `Deleted ${completed} of ${selectedFileIds.length} files`,
                key: 'batch-delete-progress',
                duration: 1
              });
            }
          }

          message.success(t('tasksMonitor.deleteTask') || `${selectedFileIds.length} files deleted successfully`);
          setSelectedFileIds([]);
          fetchFiles();
        } catch (error) {
          console.error("Batch delete files error:", error);
          message.error(t('tasksMonitor.error') || "Failed to delete some files");
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

  // Row selection configuration with icons instead of text
  const rowSelection = {
    selectedRowKeys: selectedFileIds,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedFileIds(selectedRowKeys as string[]);
    },
    selections: [
      {
        key: 'all-data',
        text: (
          <Tooltip title={t('dashboard.overview') || "Select All Files"}>
            <SelectOutlined /> {t('dashboard.overview') || "Select All"}
          </Tooltip>
        ),
        onSelect: () => {
          const allIds = files.map(file => file.id);
          setSelectedFileIds(allIds);
        },
      },
      {
        key: 'not-parsed',
        text: (
          <Tooltip title={t('dashboard.notProcessed') || "Select Not Parsed Files"}>
            <CloseCircleOutlined /> {t('dashboard.notProcessed') || "Not Parsed"}
          </Tooltip>
        ),
        onSelect: () => {
          const notParsedIds = files
            .filter(file => !file.parsingStatus || file.parsingStatus === 'failed')
            .map(file => file.id);
          setSelectedFileIds(notParsedIds);
        },
      },
      {
        key: 'parsed',
        text: (
          <Tooltip title={t('tasksMonitor.completed') || "Select Parsed Files"}>
            <CheckCircleOutlined /> {t('tasksMonitor.completed') || "Parsed"}
          </Tooltip>
        ),
        onSelect: () => {
          const parsedIds = files
            .filter(file => file.parsingStatus === 'completed')
            .map(file => file.id);
          setSelectedFileIds(parsedIds);
        },
      },
      {
        key: 'invert',
        text: (
          <Tooltip title={t('dashboard.refreshData') || "Invert Current Selection"}>
            <SyncOutlined /> {t('dashboard.refreshData') || "Invert"}
          </Tooltip>
        ),
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

    const batchActionContent = (
      <Space direction={screens.sm ? "horizontal" : "vertical"} style={{ width: '100%' }}>
        <Tooltip title={t('tasksMonitor.retryParsing') || "Process all selected files"}>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleBatchParseFiles}
            loading={batchActionLoading}
            disabled={batchActionLoading}
            size={screens.sm ? "middle" : "small"}
          >
            {t('tasksMonitor.retryParsing') || "Parse"}
          </Button>
        </Tooltip>
        <Tooltip title={t('tasksMonitor.deleteTask') || "Delete all selected files"}>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleBatchDeleteFiles}
            loading={batchActionLoading}
            disabled={batchActionLoading}
            size={screens.sm ? "middle" : "small"}
          >
            {t('tasksMonitor.deleteTask') || "Delete"}
          </Button>
        </Tooltip>
        <Tooltip title={t('dashboard.refreshData') || "Clear selection"}>
          <Button
            icon={<ClearOutlined />}
            onClick={() => setSelectedFileIds([])}
            disabled={batchActionLoading}
            size={screens.sm ? "middle" : "small"}
          >
            {t('dashboard.refreshData') || "Clear"}
          </Button>
        </Tooltip>
      </Space>
    );

    return (
      <Alert
        type="info"
        showIcon
        message={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: screens.sm ? 'row' : 'column',
            gap: screens.sm ? 0 : '10px'
          }}>
            <Space>
              <Badge count={selectedFileIds.length} overflowCount={999} style={{ backgroundColor: '#1677ff' }} />
              <span><b>{selectedFileIds.length}</b> {t('dashboard.files') || "files"} selected</span>
            </Space>
            {batchActionContent}
          </div>
        }
        style={{ marginBottom: 16 }}
      />
    );
  };

  // Add status filtering options
  const statusFilters = [
    { text: t('tasksMonitor.completed') || 'Completed', value: 'completed' },
    { text: t('tasksMonitor.processing') || 'Processing', value: 'processing' },
    { text: t('tasksMonitor.pending') || 'Pending', value: 'pending' },
    { text: t('tasksMonitor.failed') || 'Failed', value: 'failed' },
    { text: t('dashboard.notProcessed') || 'Not Parsed', value: 'not_parsed' },
  ];

  // Enhanced columns with filtering
  const createColumns = () => {
    const fileColumn = {
      title: t('dashboard.file') || "File",
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
              <Text strong style={{ wordBreak: 'break-word' }}>{text}</Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatFileSize(record.size)} • {getTypeFile(record.mimetype)}
              </Text>
            </div>
          </div>
        </Space>
      ),
    };

    const statusColumn = {
      title: t('tasksMonitor.status') || "Status",
      dataIndex: "parsingStatus",
      key: "parsingStatus",
      width: 120,
      responsive: ['md'],
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
          {status || t('dashboard.notProcessed') || "Not parsed"}
        </Tag>
      ),
    };

    const parseColumn = {
      title: t('tasksMonitor.retryParsing') || "Parse",
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
            size={screens.sm ? "large" : "middle"}
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
    };

    const uploadedColumn = {
      title: t('dashboard.updated') || "Uploaded",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      responsive: ['lg'],
      render: (date: string) => (
        <Text type="secondary">{formatDate(date)}</Text>
      ),
    };

    const actionsColumn = {
      title: t('knowledgeList.actions') || "Actions",
      key: "actions",
      width: screens.sm ? 160 : 90,
      render: (_: any, record: any) => {
        const actions = [
          {
            key: 'view',
            label: t('home.view') || 'View Details',
            icon: <EyeOutlined />,
            onClick: () => router.push(`/files/${record.id}`),
          },
          {
            key: 'configure',
            label: t('knowledgeDetail.config') || 'Configure Chunking',
            icon: <SettingOutlined />,
            onClick: () => openFileConfigModal(record),
          },
          {
            key: 'delete',
            label: t('tasksMonitor.deleteTask') || 'Delete File',
            icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
            onClick: () => Modal.confirm({
              title: t('tasksMonitor.deleteTask') || "Delete File",
              content: t('knowledgeList.deleteConfirmation') ? t('knowledgeList.deleteConfirmation').replace('this item', 'this file') : "Are you sure you want to delete this file? This action cannot be undone.",
              okText: t('knowledgeList.yes') || "Delete",
              okType: "danger",
              onOk: () => handleDeleteFile(record.id),
            }),
          },
        ];

        if (screens.sm) {
          return (
            <Space>
              <Tooltip title={`${t('home.view') || "View details"} ${record.originalName}`}>
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => router.push(`/files/${record.id}`)}
                />
              </Tooltip>
              <Tooltip title={t('knowledgeDetail.config') || "Configure Chunking"}>
                <Button
                  type="text"
                  icon={<SettingOutlined />}
                  onClick={() => openFileConfigModal(record)}
                />
              </Tooltip>
              <Tooltip title={t('tasksMonitor.deleteTask') || "Delete File"}>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    Modal.confirm({
                      title: t('tasksMonitor.deleteTask') || "Delete File",
                      content: t('knowledgeList.deleteConfirmation') ? t('knowledgeList.deleteConfirmation').replace('this item', 'this file') : "Are you sure you want to delete this file? This action cannot be undone.",
                      okText: t('knowledgeList.yes') || "Delete",
                      okType: "danger",
                      onOk: () => handleDeleteFile(record.id),
                    })
                  }
                />
              </Tooltip>
            </Space>
          );
        } else {
          // On mobile, use dropdown menu for actions
          return (
            <Dropdown
              menu={{
                items: actions.map(action => ({
                  key: action.key,
                  label: action.label,
                  icon: action.icon,
                  onClick: action.onClick,
                }))
              }}
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          );
        }
      },
    };

    return [
      fileColumn,
      statusColumn,
      parseColumn,
      uploadedColumn,
      actionsColumn,
    ];
  };

  return (
    <Card
      title={<Title level={4}>{t('dashboard.files') || "Files"}</Title>}
      extra={
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={handleOpenUploadModal}
          disabled={!isAuthenticated}
          size={screens.sm ? "middle" : "small"}
        >
          {screens.sm ? t('home.uploadFiles') || "Upload Files" : t('home.uploadFiles') || "Upload"}
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
          <div style={{ overflowX: 'auto' }}>
            <Table
              rowSelection={rowSelection}
              dataSource={files}
              columns={createColumns()}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: screens.md,
                pageSizeOptions: ["10", "20", "50"],
                size: screens.sm ? "default" : "small",
              }}
              size={screens.sm ? "middle" : "small"}
              scroll={{ x: 'max-content' }}
            />
          </div>
        </>
      ) : (
        <Empty
          description={t('dashboard.notProcessed') || "No files have been uploaded yet"}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button
            type="primary"
            onClick={handleOpenUploadModal}
            disabled={!isAuthenticated}
            size={screens.sm ? "middle" : "small"}
          >
            {t('home.uploadFiles') || "Upload Now"}
          </Button>
        </Empty>
      )}
    </Card>
  );
}
