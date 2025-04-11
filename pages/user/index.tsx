import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input,
  Space, Typography, message, Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useLocale } from '../../locale';
import { useTheme } from '../../theme';
import MainLayout from '../../components/layout/MainLayout';

const { Title } = Typography;

interface User {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const { locale, antdLocale } = useLocale();
  const { theme } = useTheme();
  const router = useRouter();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      message.error('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showModal = (record?: User) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        name: record.name,
        description: record.description,
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingId) {
        // Update existing user
        const res = await fetch(`/api/user/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        
        if (res.ok) {
          message.success('User updated successfully');
          fetchUsers();
        } else {
          message.error('Failed to update user');
        }
      } else {
        // Create new user
        const res = await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        
        if (res.ok) {
          message.success('User created successfully');
          fetchUsers();
        } else {
          message.error('Failed to create user');
        }
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/user/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        message.success('User deleted successfully');
        fetchUsers();
      } else {
        message.error('Failed to delete user');
      }
    } catch (error) {
      message.error('An error occurred');
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (text: string, record: User) => (
        <a onClick={() => router.push(`/user/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="User Management">
      <div style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2}>User Management</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Add User
            </Button>
          </div>
          
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
          
          <Modal
            title={editingId ? "Edit User" : "Add User"}
            open={isModalVisible}
            onCancel={handleCancel}
            onOk={handleSubmit}
            destroyOnClose
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Please enter a name' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please enter a description' }]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            </Form>
          </Modal>
        </Space>
      </div>
    </MainLayout>
  );
}
