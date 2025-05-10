import {
  CheckCircleOutlined,
  ClearOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileOutlined,
  PlayCircleOutlined,
  SelectOutlined,
  SettingOutlined,
  SyncOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Empty,
  Grid,
  Input,
  List,
  message,
  Modal,
  Pagination,
  Popconfirm,
  Progress,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useFetchFiles } from '../../hooks/useFetchFiles';
import { useLocale } from '../../locale';
import { IFile } from '../../models/IFile';
import { IKnowledge } from '../../models/IKnowledge';
import { deleteFile, parseFile } from '../../services/fileService';
import { formatFileSize, getTypeFile } from '../../utils/client/formatters';

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface KnowledgeFileListProps {
  knowledge: IKnowledge;
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
  const [files, setFiles] = useState<IFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<IFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [batchActionLoading, setBatchActionLoading] = useState(false);
  const [, setEventSource] = useState<EventSource | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const screens = useBreakpoint();
  const { t } = useLocale('');

  const { fetchFiles, loading: fetchFilesLoading, files: fetchedFiles } = useFetchFiles(knowledge?.id, t);

  useEffect(() => {
    if (fetchedFiles) {
      setFiles(fetchedFiles);
    }
  }, [fetchedFiles]);

  useEffect(() => {
    setLoading(fetchFilesLoading);
  }, [fetchFilesLoading]);

  // Filter files based on search text and status filter
  useEffect(() => {
    let result = [...files];

    // Apply text search filter
    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      result = result.filter((file) => file.originalName.toLowerCase().includes(lowerCaseSearch));
    }

    // Apply status filter
    if (statusFilter) {
      if (statusFilter === 'not_parsed') {
        result = result.filter((file) => !file.parsingStatus);
      } else {
        result = result.filter((file) => file.parsingStatus === statusFilter);
      }
    }

    setFilteredFiles(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [files, searchText, statusFilter]);

  useEffect(() => {
    if (knowledge?.id) {
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
            setFiles((prevFiles) => {
              const updatedFiles = prevFiles.map((file) =>
                file.id === data.fileId ? { ...file, parsingStatus: data.status } : file
              );
              console.log(
                `[SSE] Updated file state:`,
                updatedFiles.find((f) => f.id === data.fileId)
              );
              return updatedFiles;
            });

            // Reset parsing indicator for this file
            setParsingFiles((prev) => {
              const newState = { ...prev, [data.fileId]: false };
              console.log(`[SSE] Updated parsing indicators:`, newState);
              return newState;
            });

            // Show notification based on status
            if (data.status === 'completed') {
              message.success(t('tasksMonitor.completed') || `File "${data.fileName}" parsed successfully`);
            } else if (data.status === 'failed') {
              message.error(
                (t('tasksMonitor.failed') || `File "${data.fileName}" parsing failed`) +
                  (data.errorMessage ? `: ${data.errorMessage}` : '')
              );
            }
          } else if (data.type === 'connected') {
            console.log('[SSE] Successfully connected to file parsing events');
          } else if (data.type === 'ping') {
            console.log('[SSE] Received ping');
          }
        } catch (error: unknown) {
          console.error('[SSE] Error processing SSE message:', error);
        }
      };

      sse.onerror = (error: unknown) => {
        console.error('[SSE] Connection error:', error);
        // Try to reconnect after a short delay
        setTimeout(() => {
          console.log('[SSE] Attempting to reconnect...');
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
  }, [knowledge?.id, t]);

  React.useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // ... existing code ...

  const handleParseFile = async (fileId: string) => {
    if (!isAuthenticated) {
      message.error(t('knowledgeList.loginRequired') || 'You must be logged in to parse files');
      return;
    }

    try {
      setParsingFiles((prev) => ({ ...prev, [fileId]: true }));

      const result = await parseFile(fileId);

      if (result.success) {
        message.success(t('tasksMonitor.retryParsing') || 'File parsing task created successfully');
        // Refresh files after a brief delay
        setTimeout(() => {
          fetchFiles();
        }, 1000);
      } else {
        message.error(result.message || t('tasksMonitor.error') || 'Failed to create parsing task');
      }
    } catch (error: unknown) {
      console.error('Parse file error:', error);
      message.error(t('tasksMonitor.error') || 'An error occurred while setting up file parsing');
    } finally {
      setParsingFiles((prev) => ({ ...prev, [fileId]: false }));
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!knowledge?.id) return;

    try {
      await deleteFile(knowledge.id, fileId);
      message.success(t('tasksMonitor.deleteTask') || 'File deleted successfully');
      fetchFiles();
    } catch (error: unknown) {
      console.error('Delete file error:', error);
      message.error(t('tasksMonitor.error') || 'Failed to delete file');
    }
  };

  const handleBatchParseFiles = async () => {
    if (!isAuthenticated) {
      message.error(t('knowledgeList.loginRequired') || 'You must be logged in to parse files');
      return;
    }

    try {
      setBatchActionLoading(true);
      // Start showing parsing status for all selected files
      const updatedParsingFiles = { ...parsingFiles };
      selectedFileIds.forEach((fileId) => {
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
          content: t('dashboard.processingProgress')
            ? `${t('dashboard.processingProgress')} ${completed} of ${selectedFileIds.length}`
            : `Processing file ${completed} of ${selectedFileIds.length}`,
          key: 'batch-progress',
          duration: 1,
        });
      }

      message.success(t('dashboard.fileAnalysis') || `${selectedFileIds.length} files queued for parsing`);
      setSelectedFileIds([]);

      // Refresh files after a brief delay
      setTimeout(() => {
        fetchFiles();
      }, 1000);
    } catch (error: unknown) {
      console.error('Batch parse files error:', error);
      message.error(t('tasksMonitor.error') || 'An error occurred while parsing files');
    } finally {
      setBatchActionLoading(false);
      // Clear parsing status
      const clearedParsingFiles = { ...parsingFiles };
      selectedFileIds.forEach((fileId) => {
        clearedParsingFiles[fileId] = false;
      });
      setParsingFiles(clearedParsingFiles);
    }
  };

  const handleBatchDeleteFiles = () => {
    Modal.confirm({
      title: t('tasksMonitor.deleteTask') || 'Delete Files',
      content: (
        <div>
          <p>
            {t('knowledgeList.deleteConfirmation')
              ? `${t('knowledgeList.deleteConfirmation').replace('this item', `${selectedFileIds.length} files`)}`
              : `Are you sure you want to delete ${selectedFileIds.length} files?`}
          </p>
          <p style={{ color: '#ff4d4f' }}>
            <b>{t('tasksMonitor.error') || 'This action cannot be undone.'}</b>
          </p>
        </div>
      ),
      okText: t('knowledgeList.yes') || 'Delete',
      okType: 'danger',
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
                content: t('dashboard.processingProgress')
                  ? `${t('dashboard.processingProgress')} ${completed} of ${selectedFileIds.length}`
                  : `Deleted ${completed} of ${selectedFileIds.length} files`,
                key: 'batch-delete-progress',
                duration: 1,
              });
            }
          }

          message.success(t('tasksMonitor.deleteTask') || `${selectedFileIds.length} files deleted successfully`);
          setSelectedFileIds([]);
          fetchFiles();
        } catch (error: unknown) {
          console.error('Batch delete files error:', error);
          message.error(t('tasksMonitor.error') || 'Failed to delete some files');
        } finally {
          setBatchActionLoading(false);
        }
      },
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
  };

  // Get status icon for file parsing status
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'pending':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'processing':
        return <SyncOutlined spin style={{ color: '#1890ff' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      default:
        return <FileOutlined />;
    }
  };

  // Toggle selection of a file
  const toggleFileSelection = (fileId: string) => {
    setSelectedFileIds((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]));
  };

  // Select all visible files
  const selectAllFiles = () => {
    const visibleFileIds = getPaginatedFiles().map((file) => file.id);
    setSelectedFileIds(visibleFileIds);
  };

  // Select no files
  const deselectAllFiles = () => {
    setSelectedFileIds([]);
  };

  // Select files based on status
  const selectFilesByStatus = (status: string) => {
    let selectedIds;
    if (status === 'not_parsed') {
      selectedIds = files
        .filter((file) => !file.parsingStatus || file.parsingStatus === 'failed')
        .map((file) => file.id);
    } else if (status === 'completed') {
      selectedIds = files.filter((file) => file.parsingStatus === 'completed').map((file) => file.id);
    } else {
      // Invert current selection
      const allIds = files.map((file) => file.id);
      selectedIds = allIds.filter((id) => !selectedFileIds.includes(id));
    }
    setSelectedFileIds(selectedIds);
  };

  const renderBatchActions = () => {
    if (selectedFileIds.length === 0) {
      return null;
    }

    const batchActionContent = (
      <Space direction={screens.sm ? 'horizontal' : 'vertical'} style={{ width: '100%' }}>
        <Tooltip title={t('tasksMonitor.retryParsing') || 'Process all selected files'}>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleBatchParseFiles}
            loading={batchActionLoading}
            disabled={batchActionLoading}
            size={screens.sm ? 'middle' : 'small'}>
            {t('tasksMonitor.retryParsing') || 'Parse'}
          </Button>
        </Tooltip>
        <Tooltip title={t('tasksMonitor.deleteTask') || 'Delete all selected files'}>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleBatchDeleteFiles}
            loading={batchActionLoading}
            disabled={batchActionLoading}
            size={screens.sm ? 'middle' : 'small'}>
            {t('tasksMonitor.deleteTask') || 'Delete'}
          </Button>
        </Tooltip>
        <Tooltip title={t('dashboard.refreshData') || 'Clear selection'}>
          <Button
            icon={<ClearOutlined />}
            onClick={() => setSelectedFileIds([])}
            disabled={batchActionLoading}
            size={screens.sm ? 'middle' : 'small'}>
            {t('dashboard.refreshData') || 'Clear'}
          </Button>
        </Tooltip>
      </Space>
    );

    return (
      <Alert
        type="info"
        showIcon
        message={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexDirection: screens.sm ? 'row' : 'column',
              gap: screens.sm ? 0 : '10px',
            }}>
            <Space>
              <Badge count={selectedFileIds.length} overflowCount={999} style={{ backgroundColor: '#1677ff' }} />
              <span>
                <b>{selectedFileIds.length}</b> {t('dashboard.files') || 'files'} selected
              </span>
            </Space>
            {batchActionContent}
          </div>
        }
        style={{ marginBottom: 16 }}
      />
    );
  };

  // Status filter options
  const statusFilters = [
    { text: t('tasksMonitor.completed') || 'Completed', value: 'completed' },
    { text: t('tasksMonitor.processing') || 'Processing', value: 'processing' },
    { text: t('tasksMonitor.pending') || 'Pending', value: 'pending' },
    { text: t('tasksMonitor.failed') || 'Failed', value: 'failed' },
    { text: t('dashboard.notProcessed') || 'Not Parsed', value: 'not_parsed' },
  ];

  // Render the file selection toolbar
  const renderSelectionToolbar = () => (
    <Space wrap style={{ marginBottom: 16 }}>
      <Button onClick={selectAllFiles} icon={<SelectOutlined />} size={screens.sm ? 'middle' : 'small'}>
        {t('dashboard.overview') || 'Select All'}
      </Button>
      <Button
        onClick={() => selectFilesByStatus('not_parsed')}
        icon={<CloseCircleOutlined />}
        size={screens.sm ? 'middle' : 'small'}>
        {t('dashboard.notProcessed') || 'Not Parsed'}
      </Button>
      <Button
        onClick={() => selectFilesByStatus('completed')}
        icon={<CheckCircleOutlined />}
        size={screens.sm ? 'middle' : 'small'}>
        {t('tasksMonitor.completed') || 'Parsed'}
      </Button>
      <Button
        onClick={() => selectFilesByStatus('invert')}
        icon={<SyncOutlined />}
        size={screens.sm ? 'middle' : 'small'}>
        {t('dashboard.refreshData') || 'Invert'}
      </Button>
      <Button onClick={deselectAllFiles} icon={<ClearOutlined />} size={screens.sm ? 'middle' : 'small'}>
        {t('dashboard.refreshData') || 'Clear'}
      </Button>
    </Space>
  );

  // Render the filter toolbar
  const renderFilterToolbar = () => (
    <Space wrap style={{ marginBottom: 16 }} align="start">
      <Search
        placeholder={t('knowledgeList.search') || 'Search files...'}
        allowClear
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: screens.sm ? 200 : '100%' }}
        size={screens.sm ? 'middle' : 'small'}
      />
      <Select
        placeholder={t('tasksMonitor.status') || 'Filter by status'}
        allowClear
        style={{ width: screens.sm ? 150 : '100%' }}
        onChange={(value) => setStatusFilter(value)}
        size={screens.sm ? 'middle' : 'small'}>
        {statusFilters.map((filter) => (
          <Option key={filter.value} value={filter.value}>
            {filter.text}
          </Option>
        ))}
      </Select>
    </Space>
  );

  // Get paginated files for the current page
  const getPaginatedFiles = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredFiles.slice(startIndex, endIndex);
  };

  // Render a file card that works for both mobile and desktop
  const renderFileCard = (file: any) => (
    <List.Item key={file.id}>
      <Card size="small" bordered className="file-card" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Checkbox checked={selectedFileIds.includes(file.id)} onChange={() => toggleFileSelection(file.id)} />
          <Avatar
            icon={getStatusIcon(file.parsingStatus)}
            style={{
              backgroundColor:
                file.parsingStatus === 'completed'
                  ? '#f6ffed'
                  : file.parsingStatus === 'failed'
                  ? '#fff2f0'
                  : '#f0f5ff',
              color:
                file.parsingStatus === 'completed'
                  ? '#52c41a'
                  : file.parsingStatus === 'failed'
                  ? '#f5222d'
                  : '#1890ff',
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <Text strong style={{ wordBreak: 'break-word' }}>
                {file.originalName}
              </Text>
              <Tag
                color={
                  file.parsingStatus === 'completed'
                    ? 'success'
                    : file.parsingStatus === 'processing'
                    ? 'processing'
                    : file.parsingStatus === 'failed'
                    ? 'error'
                    : 'default'
                }>
                {file.parsingStatus || t('dashboard.notProcessed') || 'Not parsed'}
              </Tag>
            </div>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, flexWrap: 'wrap', gap: '8px' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatFileSize(file.size)} • {getTypeFile(file.mimetype)} • {formatDate(file.createdAt)}
              </Text>
              <Space>
                <Tooltip
                  title={
                    file.parsingStatus === 'completed' ? t('tasksMonitor.retryParsing') : t('tasksMonitor.processing')
                  }>
                  <Button
                    type="text"
                    size="small"
                    icon={file.parsingStatus === 'completed' ? <SyncOutlined /> : <PlayCircleOutlined />}
                    loading={parsingFiles[file.id]}
                    onClick={() => handleParseFile(file.id)}
                    disabled={file.parsingStatus === 'processing' && !parsingFiles[file.id]}
                  />
                </Tooltip>
                <Tooltip title={t('home.view')}>
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => router.push(`/files/${file.id}`)}
                  />
                </Tooltip>
                <Tooltip title={t('knowledgeDetail.config')}>
                  <Button
                    type="text"
                    size="small"
                    icon={<SettingOutlined />}
                    onClick={() => openFileConfigModal(file)}
                  />
                </Tooltip>
                <Popconfirm
                  title={t('knowledgeList.deleteConfirmation') || 'Are you sure you want to delete this file?'}
                  onConfirm={() => handleDeleteFile(file.id)}
                  okText={t('knowledgeList.yes') || 'Delete'}
                  cancelText={t('knowledgeList.no') || 'Cancel'}>
                  <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            </div>
          </div>
        </div>
      </Card>
    </List.Item>
  );

  return (
    <Card
      title={<Title level={4}>{t('dashboard.files') || 'Files'}</Title>}
      extra={
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={handleOpenUploadModal}
          disabled={!isAuthenticated}
          size={screens.sm ? 'middle' : 'small'}>
          {screens.sm ? t('home.uploadFiles') || 'Upload Files' : t('home.uploadFiles') || 'Upload'}
        </Button>
      }
      style={{ marginBottom: 24 }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      ) : files && files.length > 0 ? (
        <>
          {renderBatchActions()}
          {batchActionLoading && (
            <Progress
              percent={Math.round((Object.values(parsingFiles).filter((v) => v).length / selectedFileIds.length) * 100)}
              status="active"
              style={{ marginBottom: 16 }}
            />
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: screens.md ? 'row' : 'column',
              justifyContent: 'space-between',
              alignItems: screens.md ? 'center' : 'flex-start',
              gap: '16px',
              marginBottom: '16px',
            }}>
            {renderFilterToolbar()}
            {renderSelectionToolbar()}
          </div>

          <List
            dataSource={getPaginatedFiles()}
            renderItem={renderFileCard}
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 1,
              lg: 1,
              xl: 1,
              xxl: 1,
            }}
          />

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredFiles.length}
              onChange={(page) => setCurrentPage(page)}
              onShowSizeChange={(_, size) => {
                setCurrentPage(1);
                setPageSize(size);
              }}
              showSizeChanger
              showTotal={(total) => `${total} ${t('dashboard.files') || 'files'}`}
              size={screens.sm ? 'default' : 'small'}
            />
          </div>
        </>
      ) : (
        <Empty
          description={t('dashboard.notProcessed') || 'No files have been uploaded yet'}
          image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <Button
            type="primary"
            onClick={handleOpenUploadModal}
            disabled={!isAuthenticated}
            size={screens.sm ? 'middle' : 'small'}>
            {t('home.uploadFiles') || 'Upload Now'}
          </Button>
        </Empty>
      )}
    </Card>
  );
}
