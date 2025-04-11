import React from 'react';
import { Modal, Form, Input, Typography, FormInstance } from 'antd';
import { User } from '../../types/auth';

interface KnowledgeFormProps {
  form: FormInstance;
  visible: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  isEditing: boolean;
  user: User | null;
}

export default function KnowledgeForm({ 
  form, 
  visible, 
  onCancel, 
  onSubmit, 
  isEditing,
  user 
}: KnowledgeFormProps) {
  return (
    <Modal
      title={isEditing ? "Edit Knowledge" : "Add Knowledge"}
      open={visible}
      onCancel={onCancel}
      onOk={onSubmit}
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
        {!isEditing && user && (
          <Form.Item>
            <Typography.Text type="secondary">
              Created by: {user.name || 'You'}
            </Typography.Text>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
