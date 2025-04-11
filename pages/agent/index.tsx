import React, { useEffect, useState } from 'react';
import { 
  Table, Card, Button, Space, Tag, 
  Breadcrumb, Typography, message, Spin,
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
  
  // Fetch agents
  const fetchAgents = async () => {
    setLoading(true);
    
    try {
      // Build query params for filtering
      const params = new URLSearchParams();
      if (searchText) params.append('search', searchText);
      if (filterOwnerType) params.append('ownerType', filterOwnerType);
      if (filterActive !== null) params.append('isActive', String(filterActive));
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`/api/agent${queryString}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch agents');
      }
      
      const data = await res.json();
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
      message.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAgents();
  }, [filterOwnerType, filterActive]);
  
  // Handle search
  const handleSearch = () => {
    fetchAgents();
  };
  
  // Handle agent deletion
  const confirmDelete = (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this agent?',
      content: 'This action cannot be undone.',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'Cancel',
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
    } catch (error) {
      console.error('Error deleting agent:', error);
      message.error('An error occurred while deleting the agent');
    }
  };
  
  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Agent) => (
        <Link href={`/agent/${record.id}`}>{text}</Link>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Owner',
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
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Created By',
      key: 'createdBy',
      render: (_: any, record: Agent) => (
        <Link href={`/user/${record.createdBy.id}`}>{record.createdBy.name}</Link>
      )
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Actions',
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
    <MainLayout title="Agents">
      <div style={{ padding: '24px' }}>
        <Breadcrumb style={{ marginBottom: '16px' }}>
          <Breadcrumb.Item>
            <Link href="/">Home</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Agents</Breadcrumb.Item>
        </Breadcrumb>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Title level={2}>Agents</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => router.push('/agent/new')}
          >
            Create Agent
          </Button>
        </div>
        
        <Card style={{ marginBottom: '24px' }}>
          <Space style={{ marginBottom: '16px', width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Input
                placeholder="Search agents"
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
                placeholder="Owner Type"
                allowClear
                style={{ width: 150 }}
                onChange={(value) => setFilterOwnerType(value)}
              >
                <Option value="user">User</Option>
                <Option value="team">Team</Option>
              </Select>
              
              <Select
                placeholder="Status"
                allowClear
                style={{ width: 150 }}
                onChange={(value) => setFilterActive(value === null ? null : value === true)}
              >
                <Option value={true}>Active</Option>
                <Option value={false}>Inactive</Option>
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
