import React from 'react';
import { Modal, Form, Input, Button, Switch } from 'antd';

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
      title="Create New Team Agent"
      open={isVisible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isLoading}
          onClick={onSubmit}
        >
          Create
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="Agent Name"
          rules={[{ required: true, message: 'Please enter an agent name' }]}
        >
          <Input placeholder="Enter agent name" />
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
          <Switch defaultChecked />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AgentCreationModal;
