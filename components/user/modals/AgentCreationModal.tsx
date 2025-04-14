import React from 'react';
import { Modal, Form, Input, Button, Typography, Space, Switch } from 'antd';
import { RobotOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface AgentCreationModalProps {
  isVisible: boolean;
  isLoading: boolean;
  form: any;
  onCancel: () => void;
  onSubmit: () => void;
}

const AgentCreationModal: React.FC<AgentCreationModalProps> = ({
  isVisible,
  isLoading,
  form,
  onCancel,
  onSubmit
}) => {
  return (
    <Modal
      title={<Title level={4}>Create New Agent</Title>}
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
          label="Agent Name"
          rules={[{ required: true, message: 'Please enter an agent name' }]}
        >
          <Input prefix={<RobotOutlined />} placeholder="Enter agent name" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter an agent description' }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Describe what this agent does"
          />
        </Form.Item>
        <Form.Item
          name="isActive"
          label="Active"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            defaultChecked
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
              Create Agent
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AgentCreationModal;
