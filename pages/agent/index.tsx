import React, { useEffect, useState } from 'react';
import {
  Table, Card, Button, Space, Tag,
  Breadcrumb, // Keep Breadcrumb import
  Typography, message, Spin,
  Select, Input, Modal
} from 'antd';
import {
  PlusOutlined, SearchOutlined,
  TeamOutlined, UserOutlined,
  EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import MainLayout from '../../components/layout/MainLayout';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { apiRequest } from '../../services/apiUtils';
import { useLocale } from '../../locale/index';

const { Title } = Typography;
const { Option } = Select;

interface Agent {
  id: string;
  name: string;
  description: string;
  ownerType: 'user' | 'team';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
  };
  team?: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
}

export default function AgentsList() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterOwnerType, setFilterOwnerType] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const { t } = useLocale('agentList');

  // Fetch agents
  const fetchAgents = React.useCallback(async () => {
    setLoading(true);

    try {
      // Build query params for filtering
      const params = new URLSearchParams();
      if (searchText) params.append('search', searchText);
      if (filterOwnerType) params.append('ownerType', filterOwnerType);
      if (filterActive !== null) params.append('isActive', String(filterActive));

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const data = await apiRequest<Agent[]>(`/api/agent${queryString}`);

      if (!data) {
        throw new Error('Failed to fetch agents');
      }

      setAgents(data);
    } catch (error: unknown) {
      console.error('Error fetching agents:', error);
      message.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  }, [searchText, filterActive, filterOwnerType]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Handle search
  const handleSearch = () => {
    fetchAgents();
  };

  // Handle agent deletion
  const confirmDelete = (id: string) => {
    Modal.confirm({
      title: t('deleteConfirmation.title'),
      content: t('deleteConfirmation.content'),
      okText: t('deleteConfirmation.okText'),
      okType: 'danger',
      cancelText: t('deleteConfirmation.cancelText'),
      onOk: () => deleteAgent(id)
    });
  };

  const deleteAgent = async (id: string) => {
    try {
      // Get auth token
      const token = localStorage.getItem('token');

      const res = await fetch(`/api/agent/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        message.success('Agent deleted successfully');
        fetchAgents(); // Refresh the list
      } else {
        message.error('Failed to delete agent');
      }
    } catch (error: unknown) {
      console.error('Error deleting agent:', error);
      message.error('An error occurred while deleting the agent');
    }
  };

  // Table columns
  const columns = [
    {
      title: t('table.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Agent) => (
        <Link href={`/agent/${record.id}`}>{text}</Link>
      )
    },
    {
      title: t('table.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: t('table.owner'),
      key: 'owner',
      render: (_: any, record: Agent) => (
        <Space>
          {record.ownerType === 'user' ? (
            <>
              <UserOutlined />
              <Link href={`/user/${record.user?.id}`}>{record.user?.name}</Link>
            </>
          ) : (
            <>
              <TeamOutlined />
              <Link href={`/team/${record.team?.id}`}>{record.team?.name}</Link>
            </>
          )}
        </Space>
      )
    },
    {
      title: t('table.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? t(active ? 'active' : 'inactive') : ''}
        </Tag>
      )
    },
    {
      title: t('table.createdBy'),
      key: 'createdBy',
      render: (_: any, record: Agent) => (
        <Link href={`/user/${record.createdBy.id}`}>{record.createdBy.name}</Link>
      )
    },
    {
      title: t('table.lastUpdated'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: t('table.actions'),
      key: 'actions',
      render: (_: any, record: Agent) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => router.push(`/agent/${record.id}`)}
            type="text"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => confirmDelete(record.id)}
            type="text"
            danger
          />
        </Space>
      )
    }
  ];

  return (
    <MainLayout title={t('title')}>
      <div style={{ padding: '24px' }}>
        <Breadcrumb
          style={{ marginBottom: '16px' }}
          items={[
            {
              title: <Link href="/">Home</Link>,
            },
            {
              title: t('breadcrumb.agents'),
            },
          ]}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={2}>{t('title')}</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/agent/new')}
          >
            {t('createAgentButton')}
          </Button>
        </div>

        <Card style={{ marginBottom: '24px' }}>
          <Space style={{ marginBottom: '16px', width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }}
                suffix={
                  <SearchOutlined
                    style={{ cursor: 'pointer' }}
                    onClick={handleSearch}
                  />
                }
                onPressEnter={handleSearch}
              />

              <Select
                placeholder={t('ownerTypePlaceholder')}
                allowClear
                style={{ width: 150 }}
                onChange={(value) => setFilterOwnerType(value)}
              >
                <Option value="user">{t('user')}</Option>
                <Option value="team">{t('team')}</Option>
              </Select>

              <Select
                placeholder={t('statusPlaceholder')}
                allowClear
                style={{ width: 150 }}
                onChange={(value) => setFilterActive(value === null ? null : value === true)}
              >
                <Option value={true}>{t('active')}</Option>
                <Option value={false}>{t('inactive')}</Option>
              </Select>
            </Space>
          </Space>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={agents}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
