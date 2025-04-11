import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Typography,
  message,
  Popconfirm,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import MainLayout from "../../components/layout/MainLayout";
import { fetchAllTeams, createTeam, updateTeam, deleteTeam, Team } from "../../services/teamService";

const { Title } = Typography;

export default function TeamList() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  const loadTeams = async () => {
    setLoading(true);
    try {
      const data = await fetchAllTeams();
      setTeams(data);
    } catch (error) {
      message.error("Failed to fetch teams");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const showModal = (record?: Team) => {
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
        // Update existing team
        await updateTeam(editingId, values);
        message.success("Team updated successfully");
      } else {
        // Create new team
        await createTeam(values);
        message.success("Team created successfully");
      }

      setIsModalVisible(false);
      form.resetFields();
      loadTeams();
    } catch (error) {
      message.error("Failed to save team");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTeam(id);
      message.success("Team deleted successfully");
      loadTeams();
    } catch (error) {
      message.error("Failed to delete team");
      console.error(error);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "20%",
      render: (text: string, record: Team) => (
        <a onClick={() => router.push(`/team/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Members",
      key: "members",
      width: "15%",
      render: (_: any, record: Team) => (
        <Tag icon={<UserOutlined />} color="blue">
          {record.users?.length || 0} members
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "15%",
      render: (_: any, record: Team) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm
            title="Are you sure you want to delete this team?"
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
    <MainLayout title="Team Management">
      <div style={{ padding: "24px" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={2}>Team Management</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
              Add Team
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={teams}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />

          <Modal
            title={editingId ? "Edit Team" : "Add Team"}
            open={isModalVisible}
            onCancel={handleCancel}
            onOk={handleSubmit}
            destroyOnClose
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: "Please enter a name" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: "Please enter a description" }]}
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
