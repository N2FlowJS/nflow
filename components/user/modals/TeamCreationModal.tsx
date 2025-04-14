import React from 'react';
import { Modal, Form, Input, Button, Typography, Space } from 'antd';
import { TeamOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface TeamCreationModalProps {
  isVisible: boolean;
  isLoading: boolean;
  form: any;
  onCancel: () => void;
  onSubmit: () => void;
}

const TeamCreationModal: React.FC<TeamCreationModalProps> = ({
  isVisible,
  isLoading,
  form,
  onCancel,
  onSubmit
}) => {
  return (
    <Modal
      title={<Title level={4}>Create New Team</Title>}
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        <Form.Item
          name="name"
          label="Team Name"
          rules={[{ required: true, message: 'Please enter a team name' }]}
        >
          <Input prefix={<TeamOutlined />} placeholder="Enter team name" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter a team description' }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Describe the purpose of this team"
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              icon={<PlusOutlined />}
            >
              Create Team
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TeamCreationModal;
