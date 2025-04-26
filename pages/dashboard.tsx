import {
  DatabaseOutlined, FileOutlined,
  FileTextOutlined,
  RobotOutlined,
  SyncOutlined,
  TeamOutlined, UserOutlined
} from "@ant-design/icons";
import {
  Alert, Button,
  Card,
  Col,
  Divider,
  Progress,
  Row,
  Spin,
  Statistic, Table,
  Tabs,
  Typography
} from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import { getSystemStats, getWorkerStatus } from "../services/adminService";
import { useLocale } from "../locale";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function Dashboard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    userStats: { total: 0 },
    teamStats: { total: 0 },
    knowledgeStats: { total: 0 },
    fileStats: { total: 0, byStatus: [] },
    taskStats: { total: 0, byStatus: [] },
    agentStats: { total: 0, active: 0, inactive: 0 },
    chunkStats: { total: 0 }
  });
  const [workerStatus, setWorkerStatus] = useState<any>({
    workerConfig: { enabled: false, maxWorkers: 0, pollingInterval: 5000 },
    taskStats: { pending: 0, processing: 0, completed: 0, failed: 0, total: 0 },
    recentTasks: []
  });
  const [error, setError] = useState<string | null>(null);
  const { messages } = useLocale();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard');
      return;
    }

    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [systemStats, workers] = await Promise.all([
        getSystemStats(),
        getWorkerStatus()
      ]);
      setStats(systemStats);
      setWorkerStatus(workers);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fileStatusColumns = [
    { title: messages.dashboard.status, dataIndex: 'status', key: 'status' },
    { title: messages.dashboard.count, dataIndex: 'count', key: 'count' }
  ];

  const fileStatusData = stats.fileStats.byStatus.map((item: any) => ({
    status: item.parsingStatus || messages.dashboard.notProcessed,
    count: item._count._all
  }));

  const taskStatusColumns = [
    { title: messages.dashboard.status, dataIndex: 'status', key: 'status' },
    { title: messages.dashboard.count, dataIndex: 'count', key: 'count' }
  ];

  const taskStatusData = stats.taskStats.byStatus.map((item: any) => ({
    status: item.status,
    count: item._count._all
  }));

  const recentTasksColumns = [
    { title: messages.dashboard.file, dataIndex: 'fileName', key: 'fileName' },
    { title: messages.dashboard.status, dataIndex: 'status', key: 'status' },
    { title: messages.dashboard.updated, dataIndex: 'updated', key: 'updated' }
  ];

  const recentTasksData = workerStatus.recentTasks.map((task: any) => ({
    key: task.id,
    fileName: task.file?.originalName || messages.dashboard.unknownFile,
    status: task.status,
    updated: new Date(task.updatedAt).toLocaleString()
  }));

  return (
    <MainLayout title="N-Flow | Dashboard">
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        <Title level={2}>{messages.dashboard.systemDashboard}</Title>
        <Text type="secondary">{messages.dashboard.overview}</Text>
        
        <Button 
          type="primary" 
          onClick={fetchDashboardData} 
          style={{ marginTop: 16, marginBottom: 24 }}
          loading={loading}
        >
          {messages.dashboard.refreshData}
        </Button>

        {error && (
          <Alert 
            message={messages.dashboard.error} 
            description={error} 
            type="error" 
            showIcon 
            style={{ marginBottom: 24 }}
          />
        )}

        <Spin spinning={loading}>
          <Tabs defaultActiveKey="1">
            <TabPane tab={messages.dashboard.systemOverview} key="1">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic 
                      title={messages.dashboard.users} 
                      value={stats.userStats.total} 
                      prefix={<UserOutlined />} 
                      valueStyle={{ color: '#1677ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic 
                      title={messages.dashboard.teams} 
                      value={stats.teamStats.total} 
                      prefix={<TeamOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic 
                      title={messages.dashboard.knowledgeBases} 
                      value={stats.knowledgeStats.total}
                      prefix={<DatabaseOutlined />}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic 
                      title={messages.dashboard.files} 
                      value={stats.fileStats.total}
                      prefix={<FileOutlined />}
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Card>
                    <Statistic 
                      title={messages.dashboard.aiAgents} 
                      value={stats.agentStats.total}
                      prefix={<RobotOutlined />}
                      valueStyle={{ color: '#eb2f96' }}
                    />
                    <Divider style={{ margin: '16px 0' }} />
                    <Row>
                      <Col span={12}>
                        <Statistic 
                          title={messages.dashboard.active} 
                          value={stats.agentStats.active}
                          valueStyle={{ fontSize: '18px', color: 'green' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic 
                          title={messages.dashboard.inactive} 
                          value={stats.agentStats.inactive}
                          valueStyle={{ fontSize: '18px', color: 'gray' }}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
                
                <Col xs={24} sm={12} md={8}>
                  <Card>
                    <Statistic 
                      title={messages.dashboard.tasks} 
                      value={stats.taskStats.total}
                      prefix={<SyncOutlined />}
                      valueStyle={{ color: '#13c2c2' }}
                    />
                    <Progress 
                      percent={stats.taskStats.total ? 
                        Math.round((workerStatus.taskStats.completed / stats.taskStats.total) * 100) : 
                        0
                      }
                      status="active"
                      style={{ marginTop: 16 }}
                    />
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Card>
                    <Statistic 
                      title={messages.dashboard.textChunks} 
                      value={stats.chunkStats.total}
                      prefix={<FileTextOutlined />}
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab={messages.dashboard.fileAnalysis} key="2">
              <Row gutter={[16, 16]}>
                <Col span={24} md={12}>
                  <Card title={messages.dashboard.filesByStatus}>
                    <Table 
                      dataSource={fileStatusData}
                      columns={fileStatusColumns}
                      pagination={false}
                      size="small"
                    />
                  </Card>
                </Col>
                <Col span={24} md={12}>
                  <Card title={messages.dashboard.processingProgress}>
                    <Statistic 
                      title={messages.dashboard.fileProcessingRate}
                      value={fileStatusData.find((i: any) => i.status === 'completed')?.count || 0}
                      suffix={`/ ${stats.fileStats.total}`}
                    />
                    <Progress 
                      percent={stats.fileStats.total ? 
                        Math.round((fileStatusData.find((i: any) => i.status === 'completed')?.count || 0) / stats.fileStats.total * 100) : 
                        0
                      }
                      status="active"
                      style={{ marginTop: 16 }}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab={messages.dashboard.taskDetails} key="3">
              <Row gutter={[16, 16]}>
                <Col span={24} md={12}>
                  <Card title={messages.dashboard.tasksByStatus}>
                    <Table 
                      dataSource={taskStatusData}
                      columns={taskStatusColumns}
                      pagination={false}
                      size="small"
                    />
                  </Card>
                </Col>
                <Col span={24} md={12}>
                  <Card title={messages.dashboard.workerConfiguration}>
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Statistic 
                          title={messages.dashboard.enabled}
                          value={workerStatus.workerConfig.enabled ? messages.dashboard.yes : messages.dashboard.no}
                          valueStyle={{ color: workerStatus.workerConfig.enabled ? 'green' : 'red' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic 
                          title={messages.dashboard.maxWorkers}
                          value={workerStatus.workerConfig.maxWorkers}
                        />
                      </Col>
                      <Col span={24}>
                        <Statistic 
                          title={messages.dashboard.pollingInterval}
                          value={`${workerStatus.workerConfig.pollingInterval / 1000} seconds`}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>

                <Col span={24}>
                  <Card title={messages.dashboard.recentTasks}>
                    <Table 
                      dataSource={recentTasksData}
                      columns={recentTasksColumns}
                      pagination={{ pageSize: 5 }}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Spin>
      </div>
    </MainLayout>
  );
}
