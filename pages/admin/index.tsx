import React from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Space,
  Statistic,
  Spin,
} from 'antd';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  RobotOutlined,
  DatabaseOutlined,
  SettingOutlined,
  DashboardOutlined,
  FileOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import MainLayout from '@components/layout/MainLayout';
import { useAuth } from '@context/AuthContext';
import { useSystemStats } from '@hooks/useSystemStats';

const { Title, Text } = Typography;

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { stats, loading: statsLoading } = useSystemStats();

  // Check if user has admin access
  const hasAccess = user?.permission === 'owner' || user?.permission === 'maintainer';

  if (authLoading || statsLoading) {
    return (
      <MainLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated || !hasAccess) {
    router.push('/auth/login?redirect=/admin');
    return null;
  }

  const adminMenuItems = [
    {
      title: 'System Monitoring',
      description: 'Monitor system tasks and performance',
      icon: <DashboardOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      link: '/admin/tasks',
      statistic: { title: 'Active Tasks', value: stats?.taskStats?.processing || 0 },
    },
    {
      title: 'LLM Management',
      description: 'Manage LLM providers and models',
      icon: <RobotOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
      link: '/admin/llm',
      statistic: { title: 'Active Models', value: stats?.agentStats?.active || 0 },
    },
    {
      title: 'Knowledge Base',
      description: 'Manage knowledge repositories',
      icon: <DatabaseOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      link: '/admin/knowledge',
      statistic: { title: 'Knowledge Bases', value: stats?.knowledgeStats?.total || 0 },
    },
    {
      title: 'File Management',
      description: 'Manage uploaded files and processing',
      icon: <FileOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
      link: '/admin/files',
      statistic: { title: 'Total Files', value: stats?.fileStats?.total || 0 },
    },
    {
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: <TeamOutlined style={{ fontSize: '24px', color: '#eb2f96' }} />,
      link: '/admin/users',
      statistic: { title: 'Active Users', value: stats?.userStats?.total || 0 },
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: <SettingOutlined style={{ fontSize: '24px', color: '#13c2c2' }} />,
      link: '/admin/settings',
      statistic: { title: 'Services', value: stats?.agentStats?.total || 0 },
    },
  ];

  return (
    <MainLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2}>Admin Dashboard</Title>
            <Text type="secondary">Welcome back, {user?.name}</Text>
          </div>

          <Row gutter={[16, 16]}>
            {adminMenuItems.map((item, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Link href={item.link}>
                  <Card
                    hoverable
                    style={{ height: '100%' }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ marginBottom: 16 }}>
                        {item.icon}
                        <Title level={4} style={{ marginTop: 8 }}>{item.title}</Title>
                        <Text type="secondary">{item.description}</Text>
                      </div>
                      <Statistic 
                        title={item.statistic.title}
                        value={item.statistic.value}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Space>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </Space>
      </div>
    </MainLayout>
  );
}
