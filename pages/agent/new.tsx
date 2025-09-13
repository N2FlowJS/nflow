import React from 'react';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Radio, Select, Space, Typography, message } from 'antd';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchTeams } from '../../services/teamService';

const { Title } = Typography;
const { Option } = Select;

interface Team {
  id: string;
  name: string;
}

export default function CreateAgent() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [ownerType, setOwnerType] = useState<'user' | 'team'>('user');
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth(); // get current user

  // Fetch users and teams for ownership selection
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch teams
        const teamsData = await fetchTeams();
        setTeams(teamsData);
      } catch (error: unknown) {
        console.error('Error fetching data:', error);
        message.error('Failed to load users and teams');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set userId automatically when ownerType is 'user'
  useEffect(() => {
    if (ownerType === 'user' && user?.id) {
      form.setFieldsValue({ userId: user.id });
    }
  }, [ownerType, user, form]);

  // Handle owner type change
  const handleOwnerTypeChange = (e: any) => {
    setOwnerType(e.target.value);
    // Clear selected owner when type changes
    if (e.target.value === 'user') {
      form.setFieldsValue({ teamId: undefined, userId: user?.id });
    } else {
      form.setFieldsValue({ userId: undefined });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // Get auth token
      const token = localStorage.getItem('token');

      // Prepare the payload
      const payload = {
        ...values,
        ownerType,
        flowConfig: JSON.stringify({ nodes: [], edges: [] }),
      };

      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create agent');
      }

      const newAgent = await res.json();
      message.success('Agent created successfully');
      router.push(`/agent/${newAgent.id}`);
    } catch (error: unknown) {
      console.error('Error creating agent:', error);
      message.error('Failed to create agent');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout title="Create Agent">
      <div style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2}>Create New Agent</Title>
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/agent')}>
              Back to List
            </Button>
          </div>

          <Card>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter a name' }]}>
                <Input placeholder="Agent name" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please enter a description' }]}>
                <Input.TextArea rows={4} placeholder="Describe what this agent does" />
              </Form.Item>

              <Form.Item label="Owner Type">
                <Radio.Group value={ownerType} onChange={handleOwnerTypeChange}>
                  <Radio.Button value="user">User</Radio.Button>
                  <Radio.Button value="team">Team</Radio.Button>
                </Radio.Group>
              </Form.Item>

              {ownerType === 'user' ? (
                <>
                  <Form.Item
                    name="userId"
                    label="User Owner"
                    initialValue={user?.id}
                    rules={[{ required: true, message: 'Please select a user' }]}
                    hidden>
                    <Input type="hidden" />
                  </Form.Item>
                  <Form.Item label="User Owner">
                    <Input value={user?.name} disabled />
                  </Form.Item>
                </>
              ) : (
                <Form.Item
                  name="teamId"
                  label="Team Owner"
                  rules={[{ required: true, message: 'Please select a team' }]}>
                  <Select placeholder="Select team" loading={loading} showSearch optionFilterProp="children">
                    {teams.map((team) => (
                      <Option key={team.id} value={team.id}>
                        {team.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                  Create Agent
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Space>
      </div>
    </MainLayout>
  );
}
