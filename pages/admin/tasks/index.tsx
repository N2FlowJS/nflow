import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  EyeOutlined,
  ReloadOutlined,
  RobotOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import MainLayout from '@components/layout/MainLayout';
import { useAuth } from '@context/AuthContext';
import { deleteParsingTask, parseFile } from '@services/fileService';
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Col,
  Descriptions,
  Grid,
  Modal,
  Progress,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Typography
} from 'antd';
import { format, formatDistance } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useLocale } from '@locale/index';
import useWorkerStatus from '@hooks/useWorkerStatus';

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

export default function TasksMonitorPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [taskDetail, setTaskDetail] = useState<any>(null);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const screens = useBreakpoint();
  const { messages } = useLocale();

  const { data, loading: dataLoading, error, fetchData } = useWorkerStatus();

  // Fetch data initially and set up polling
  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, authLoading, router]);

  // View task details
  const handleViewTask = (task: any) => {
    setTaskDetail(task);
    setTaskModalVisible(true);
  };

  // Manual refresh
  const handleRefresh = () => {
    fetchData();
  };

  // Delete a task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteParsingTask(taskId);
      fetchData();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Retry a failed task
  const handleRetryTask = async (fileId: string) => {
    try {
      await parseFile(fileId);
      fetchData();
    } catch (err) {
      console.error('Failed to retry parsing:', err);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy HH:mm:ss');
  };

  // Get time ago for display
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistance(date, new Date(), { addSuffix: true });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge status="warning" text={messages.tasksMonitor.pending} />;
      case 'processing':
        return <Badge status="processing" text={messages.tasksMonitor.processing} />;
      case 'completed':
        return <Badge status="success" text={messages.tasksMonitor.completed} />;
      case 'failed':
        return <Badge status="error" text={messages.tasksMonitor.failed} />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  // Define table columns
  const columns = [
    // {
    //   title: 'ID',
    //   dataIndex: 'id',
    //   key: 'id',
    //   render: (text: string) => <Text copyable ellipsis style={{ maxWidth: 150 }}>{text}</Text>,
    // },
    {
      title: 'File',
      dataIndex: 'file',
      key: 'file',
      render: (file: any) => <Text ellipsis style={{ maxWidth: 200 }}>{file.originalName}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => <Text>{getTimeAgo(date)}</Text>,
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => <Text>{getTimeAgo(date)}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => {
        // Check if record exists and has required properties
        if (!record || !record.id) {
          return <Text type="danger">Invalid task data</Text>;
        }

        return (
          <Space>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewTask(record)}
            />
            <Button
              type="text"
              icon={<DashboardOutlined />}
              onClick={() => router.push(`/admin/tasks/${record.id}`)}
            />
            {record.status === 'failed' && record.file && record.file.id && (
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => handleRetryTask(record.file.id)}
              />
            )}
            <Button
              type="text"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleDeleteTask(record.id)}
            />
          </Space>
        );
      },
    },
  ];

  if (authLoading) {
    return <MainLayout title="Loading...">Loading authentication info...</MainLayout>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  const isMobile = !screens.sm;

  return (
    <MainLayout title={messages.tasksMonitor.systemMonitoring}>
      <Row gutter={[isMobile ? 8 : 16, isMobile ? 12 : 24]} style={{ marginBottom: isMobile ? 12 : 24 }}>
        <Col span={24}>
          <Breadcrumb style={{ marginBottom: isMobile ? 8 : 16 }}>
            <Breadcrumb.Item>
              <Link href="/admin">{messages.tasksMonitor.adminMonitoring}</Link>
            </Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Card>
            <Row gutter={[16, 16]} align="middle">
              <Col>
                <Title level={3}>{messages.tasksMonitor.systemStatusMonitor}</Title>
              </Col>
              <Col flex="auto" />
              <Col>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={dataLoading}
                >
                  {messages.tasksMonitor.refresh}
                </Button>
              </Col>
            </Row>
          </Card>

          {error && (
            <Alert
              message={messages.tasksMonitor.errorLoadingData}
              description={error}
              type="error"
              showIcon
              closable
            />
          )}

          {data && (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title={messages.tasksMonitor.databaseStatus}
                    value="Connected"
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<DatabaseOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title={messages.tasksMonitor.workerStatus}
                    value={data.workerConfig.enabled ? messages.tasksMonitor.enabled : messages.tasksMonitor.disabled}
                    valueStyle={{ color: data.workerConfig.enabled ? '#3f8600' : '#cf1322' }}
                    prefix={<RobotOutlined />}
                  />
                  <Text type="secondary">{messages.tasksMonitor.workers}: {data.workerConfig.maxWorkers}</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title={messages.tasksMonitor.activeTasks}
                    value={data.taskStats.processing}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<SyncOutlined spin={data.taskStats.processing > 0} />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title={messages.tasksMonitor.pendingTasks}
                    value={data.taskStats.pending}
                    valueStyle={{ color: data.taskStats.pending > 0 ? '#faad14' : '#8c8c8c' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {data && (
            <Card title={messages.tasksMonitor.processingSummary}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Progress
                    percent={Math.round(
                      (data.taskStats.completed /
                        (data.taskStats.completed + data.taskStats.failed + data.taskStats.pending + data.taskStats.processing)) * 100 || 0
                    )}
                    success={{
                      percent: Math.round(
                        (data.taskStats.completed /
                          (data.taskStats.completed + data.taskStats.failed + data.taskStats.pending + data.taskStats.processing)) * 100 || 0
                      )
                    }}
                    status={data.taskStats.failed > 0 ? 'exception' : 'normal'}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title={messages.tasksMonitor.completedTasks}
                    value={data.taskStats.completed}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title={messages.tasksMonitor.failedTasks}
                    value={data.taskStats.failed}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title={messages.tasksMonitor.processingTasks}
                    value={data.taskStats.processing}
                    prefix={<SyncOutlined spin={data.taskStats.processing > 0} />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title={messages.tasksMonitor.pendingTasks}
                    value={data.taskStats.pending}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
              </Row>
            </Card>
          )}

          {data && (
            <Card title={messages.tasksMonitor.recentTasks}>
              <Table
                dataSource={data.recentTasks}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                loading={dataLoading}
              />
            </Card>
          )}
        </Space>

        {/* Task Detail Modal */}
        <Modal
          title={messages.tasksMonitor.taskDetails}
          open={taskModalVisible}
          onCancel={() => setTaskModalVisible(false)}
          footer={[
            taskDetail && (  // Only show this button if taskDetail exists
              <Button
                key="view"
                type="primary"
                onClick={() => {
                  setTaskModalVisible(false);
                  router.push(`/admin/tasks/${taskDetail.id}`);
                }}
              >
                {messages.tasksMonitor.viewCompleteDetails}
              </Button>
            ),
            <Button key="close" onClick={() => setTaskModalVisible(false)}>
              {messages.tasksMonitor.close}
            </Button>
          ]}
          width={700}
        >
          {taskDetail ? (
            <Descriptions bordered column={1}>
              <Descriptions.Item label={messages.tasksMonitor.taskId}>{taskDetail.id}</Descriptions.Item>
              <Descriptions.Item label={messages.tasksMonitor.status}>{getStatusBadge(taskDetail.status)}</Descriptions.Item>

              {/* Add null checking for nested objects */}
              {taskDetail.file && (
                <>
                  <Descriptions.Item label={messages.tasksMonitor.fileName}>{taskDetail.file.originalName}</Descriptions.Item>
                  <Descriptions.Item label={messages.tasksMonitor.fileId}>{taskDetail.file.id}</Descriptions.Item>
                </>
              )}

              <Descriptions.Item label={messages.tasksMonitor.createdAt}>{formatDate(taskDetail.createdAt)}</Descriptions.Item>
              <Descriptions.Item label={messages.tasksMonitor.updatedAt}>{formatDate(taskDetail.updatedAt)}</Descriptions.Item>

              {taskDetail.completedAt && (
                <Descriptions.Item label={messages.tasksMonitor.completedAt}>{formatDate(taskDetail.completedAt)}</Descriptions.Item>
              )}

              {taskDetail.errorMessage && (
                <Descriptions.Item label={messages.tasksMonitor.errorMessage}>
                  <Alert message={taskDetail.errorMessage} type="error" />
                </Descriptions.Item>
              )}

              {taskDetail.message && (
                <Descriptions.Item label={messages.tasksMonitor.taskMessage}>
                  <Alert
                    message={taskDetail.status === 'failed' ? messages.tasksMonitor.error : messages.tasksMonitor.information}
                    description={taskDetail.message}
                    type={taskDetail.status === 'failed' ? "error" : "info"}
                  />
                </Descriptions.Item>
              )}

              {taskDetail.file && taskDetail.file.knowledge && (
                <Descriptions.Item label={messages.tasksMonitor.knowledge}>
                  <a href={`/knowledge/${taskDetail.file.knowledge.id}`}>
                    {taskDetail.file.knowledge.name}
                  </a>
                </Descriptions.Item>
              )}

              <Descriptions.Item label={messages.tasksMonitor.actions}>
                <Space>
                  {taskDetail.status === 'failed' && taskDetail.file && (
                    <Button
                      type="primary"
                      onClick={() => {
                        handleRetryTask(taskDetail.file.id);
                        setTaskModalVisible(false);
                      }}
                    >
                      {messages.tasksMonitor.retryParsing}
                    </Button>
                  )}
                  <Button
                    danger
                    onClick={() => {
                      handleDeleteTask(taskDetail.id);
                      setTaskModalVisible(false);
                    }}
                  >
                    {messages.tasksMonitor.deleteTask}
                  </Button>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin />
              <div style={{ marginTop: 8 }}>{messages.tasksMonitor.loadingTaskDetails}</div>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
}
