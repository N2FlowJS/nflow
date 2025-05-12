import { Button, DatePicker, Form, Input } from 'antd';
import React from 'react';

interface ApiTokenFormProps {
  onSubmit: (values: any) => void;
  loading: boolean;
}

const ApiTokenForm: React.FC<ApiTokenFormProps> = ({ onSubmit, loading }) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSubmit(values);
    });
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        name="name"
        label="Token Name"
        rules={[{ required: true, message: 'Please name your token' }]}
        help="Give your token a descriptive name to remember what it's for"
      >
        <Input placeholder="e.g., Development API, GitHub Actions, etc." />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        help="Optional description to help remember the token's purpose"
      >
        <Input.TextArea 
          placeholder="What will this token be used for?"
          rows={2}
        />
      </Form.Item>

      <Form.Item
        name="expiresAt"
        label="Expiration Date"
        help="Optional. If not set, the token will never expire."
      >
        <DatePicker 
          showTime 
          format="YYYY-MM-DD HH:mm:ss"
          placeholder="Select expiration date and time"
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Create Token
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ApiTokenForm;
