import {
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  MessageFilled,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip, // Keep Breadcrumb import
  Typography,
} from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { useLocale } from '../../locale/index';
import { apiRequest } from '../../services/apiUtils';

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
      onOk: () => deleteAgent(id),
    });
  };

  const deleteAgent = async (id: string) => {
    try {
      // Get auth token
      const token = localStorage.getItem('token');

      const res = await fetch(`/api/agent/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  // Render agent card
  const renderAgentCard = (agent: Agent) => {
    return (
      <Card
        hoverable
        style={{ marginBottom: '16px', height: '100%' }}
        actions={[
          <Tooltip title={t('table.actions.edit')} key="edit">
            <Button icon={<EditOutlined />} onClick={() => router.push(`/agent/${agent.id}`)} type="text" />
          </Tooltip>,
          <Tooltip title={t('table.actions.chat')} key="chat">
            <Button
              icon={<MessageFilled />}
              onClick={() => router.push(`/agent/${agent.id}/chat`)}
              type="text"
            
            />
          </Tooltip>,
          <Tooltip title={t('table.actions.delete')} key="delete">
            <Button icon={<DeleteOutlined />} onClick={() => confirmDelete(agent.id)} type="text" danger />
          </Tooltip>,
        ]}>
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <Typography.Title level={4} style={{ marginBottom: '4px' }}>
              <Link href={`/agent/${agent.id}`}>{agent.name}</Link>
            </Typography.Title>
            <Tag color={agent.isActive ? 'green' : 'red'} style={{ marginBottom: '8px' }}>
              {agent.isActive ? t('active') : t('inactive')}
            </Tag>
          </div>
        </div>

        <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: '16px' }}>
          {agent.description || <em style={{ color: '#999' }}>{t('noDescription')}</em>}
        </Typography.Paragraph>

        <Divider style={{ margin: '8px 0' }} />

        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div>
            <Space>
              {agent.ownerType === 'user' ? (
                <>
                  <UserOutlined />
                  <span>{t('table.owner')}:</span>
                  <Link href={`/user/${agent.user?.id}`}>{agent.user?.name}</Link>
                </>
              ) : (
                <>
                  <TeamOutlined />
                  <span>{t('table.owner')}:</span>
                  <Link href={`/team/${agent.team?.id}`}>{agent.team?.name}</Link>
                </>
              )}
            </Space>
          </div>

          <div>
            <Space>
              <InfoCircleOutlined />
              <span>{t('table.createdBy')}:</span>
              <Link href={`/user/${agent.createdBy.id}`}>{agent.createdBy.name}</Link>
            </Space>
          </div>

          <div>
            <Space>
              <ClockCircleOutlined />
              <span>{t('table.lastUpdated')}:</span>
              <span>{new Date(agent.updatedAt).toLocaleString()}</span>
            </Space>
          </div>
        </Space>
      </Card>
    );
  };

  return (
    <MainLayout title={t('title')}>
      <Space style={{ marginBottom: '16px', width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            suffix={<SearchOutlined style={{ cursor: 'pointer' }} onClick={handleSearch} />}
            onPressEnter={handleSearch}
          />

          <Select
            placeholder={t('ownerTypePlaceholder')}
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setFilterOwnerType(value)}>
            <Option value="user">{t('user')}</Option>
            <Option value="team">{t('team')}</Option>
          </Select>

          <Select
            placeholder={t('statusPlaceholder')}
            allowClear
            style={{ width: 150 }}
            onChange={(value) => setFilterActive(value === null ? null : value === true)}>
            <Option value={true}>{t('active')}</Option>
            <Option value={false}>{t('inactive')}</Option>
          </Select>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/agent/new')}>
          {t('createAgentButton')}
        </Button>
      </Space>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : agents.length === 0 ? (
        <Empty description={t('noAgentsFound')} />
      ) : (
        <Row gutter={[16, 16]}>
          {agents.map((agent) => (
            <Col xs={24} sm={24} md={12} lg={8} xl={6} key={agent.id}>
              {renderAgentCard(agent)}
            </Col>
          ))}
        </Row>
      )}
    </MainLayout>
  );
}
