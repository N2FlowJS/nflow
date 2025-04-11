import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Typography,
  Badge,
  Statistic,
  Row,
  Col,
  Space,
  Tag,
  Progress,
  Alert,
  Button,
  Modal,
  Descriptions,
  Divider,
  Spin,
} from 'antd';
import {
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  RobotOutlined,
  ReloadOutlined,
  EyeOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import MainLayout from '../../../components/layout/MainLayout';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/router';
import { getWorkerStatus } from '../../../services/adminService';
import { parseFile, deleteParsingTask } from '../../../services/fileService';
import { format, formatDistance } from 'date-fns';

const { Title, Text } = Typography;

export default function TasksMonitorPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskDetail, setTaskDetail] = useState<any>(null);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch data initially and set up polling
  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    fetchData();

    // Set up polling every 5 seconds
    const interval = setInterval(fetchData, 5000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isAuthenticated, loading, router]);

  // Function to fetch worker status data
  const fetchData = async () => {
    try {
      setLoadingData(true);
      const result = await getWorkerStatus();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch worker status');
    } finally {
      setLoadingData(false);
    }
  };

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
        return <Badge status="warning" text="Pending" />;
      case 'processing':
        return <Badge status="processing" text="Processing" />;
      case 'completed':
        return <Badge status="success" text="Completed" />;
      case 'failed':
        return <Badge status="error" text="Failed" />;
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

  if (loading) {
    return <MainLayout title="Loading...">Loading authentication info...</MainLayout>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout title="System Monitoring">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Card>
            <Row gutter={[16, 16]} align="middle">
              <Col>
                <Title level={3}>System Status Monitor</Title>
              </Col>
              <Col flex="auto" />
              <Col>
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />} 
                  onClick={handleRefresh}
                  loading={loadingData}
                >
                  Refresh
                </Button>
              </Col>
            </Row>
          </Card>

          {error && (
            <Alert 
              message="Error Loading Data" 
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
                    title="Database Status" 
                    value="Connected" 
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<DatabaseOutlined />} 
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic 
                    title="Worker Status" 
                    value={data.workerConfig.enabled ? 'Enabled' : 'Disabled'} 
                    valueStyle={{ color: data.workerConfig.enabled ? '#3f8600' : '#cf1322' }}
                    prefix={<RobotOutlined />} 
                  />
                  <Text type="secondary">Workers: {data.workerConfig.maxWorkers}</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic 
                    title="Active Tasks" 
                    value={data.taskStats.processing} 
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<SyncOutlined spin={data.taskStats.processing > 0} />} 
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic 
                    title="Pending Tasks" 
                    value={data.taskStats.pending} 
                    valueStyle={{ color: data.taskStats.pending > 0 ? '#faad14' : '#8c8c8c' }}
                    prefix={<ClockCircleOutlined />} 
                  />
                </Card>
              </Col>
            </Row>
          )}

          {data && (
            <Card title="Processing Summary">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Progress 
                    percent={Math.round(
                      (data.taskStats.completed / 
                        (data.taskStats.completed + data.taskStats.failed + data.taskStats.pending + data.taskStats.processing)) * 100 || 0
                    )}
                    success={{ percent: Math.round(
                      (data.taskStats.completed / 
                        (data.taskStats.completed + data.taskStats.failed + data.taskStats.pending + data.taskStats.processing)) * 100 || 0
                    )}}
                    status={data.taskStats.failed > 0 ? 'exception' : 'normal'}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic 
                    title="Completed" 
                    value={data.taskStats.completed} 
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic 
                    title="Failed" 
                    value={data.taskStats.failed} 
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic 
                    title="Processing" 
                    value={data.taskStats.processing} 
                    prefix={<SyncOutlined spin={data.taskStats.processing > 0} />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic 
                    title="Pending" 
                    value={data.taskStats.pending} 
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
              </Row>
            </Card>
          )}

          {data && (
            <Card title="Recent Tasks">
              <Table 
                dataSource={data.recentTasks} 
                columns={columns} 
                rowKey="id"
                pagination={{ pageSize: 10 }}
                loading={loadingData}
              />
            </Card>
          )}
        </Space>

        {/* Task Detail Modal */}
        <Modal
          title="Task Details"
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
                View Complete Details
              </Button>
            ),
            <Button key="close" onClick={() => setTaskModalVisible(false)}>
              Close
            </Button>
          ]}
          width={700}
        >
          {taskDetail ? (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Task ID">{taskDetail.id}</Descriptions.Item>
              <Descriptions.Item label="Status">{getStatusBadge(taskDetail.status)}</Descriptions.Item>
              
              {/* Add null checking for nested objects */}
              {taskDetail.file && (
                <>
                  <Descriptions.Item label="File Name">{taskDetail.file.originalName}</Descriptions.Item>
                  <Descriptions.Item label="File ID">{taskDetail.file.id}</Descriptions.Item>
                </>
              )}
              
              <Descriptions.Item label="Created At">{formatDate(taskDetail.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Updated At">{formatDate(taskDetail.updatedAt)}</Descriptions.Item>
              
              {taskDetail.completedAt && (
                <Descriptions.Item label="Completed At">{formatDate(taskDetail.completedAt)}</Descriptions.Item>
              )}
              
              {taskDetail.errorMessage && (
                <Descriptions.Item label="Error Message">
                  <Alert message={taskDetail.errorMessage} type="error" />
                </Descriptions.Item>
              )}
              
              {taskDetail.message && (
                <Descriptions.Item label="Task Message">
                  <Alert 
                    message={taskDetail.status === 'failed' ? "Error" : "Information"} 
                    description={taskDetail.message}
                    type={taskDetail.status === 'failed' ? "error" : "info"}
                  />
                </Descriptions.Item>
              )}
              
              {taskDetail.file && taskDetail.file.knowledge && (
                <Descriptions.Item label="Knowledge">
                  <a href={`/knowledge/${taskDetail.file.knowledge.id}`}>
                    {taskDetail.file.knowledge.name}
                  </a>
                </Descriptions.Item>
              )}
              
              <Descriptions.Item label="Actions">
                <Space>
                  {taskDetail.status === 'failed' && taskDetail.file && (
                    <Button 
                      type="primary"
                      onClick={() => {
                        handleRetryTask(taskDetail.file.id);
                        setTaskModalVisible(false);
                      }}
                    >
                      Retry Parsing
                    </Button>
                  )}
                  <Button 
                    danger
                    onClick={() => {
                      handleDeleteTask(taskDetail.id);
                      setTaskModalVisible(false);
                    }}
                  >
                    Delete Task
                  </Button>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin />
              <div style={{ marginTop: 8 }}>Loading task details...</div>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
}
