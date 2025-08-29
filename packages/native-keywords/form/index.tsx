import React from 'react';
import { Form, Input, InputNumber, Card } from 'antd';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

// Temporary migrated form for native keywords node (move into package/native-keywords/form soon)
const NativeKeywordsNodeForm: React.FC<{ nodeid: string; form: any }> = () => {
  return (
    <Card size="small" title="Native Keywords" style={{ marginBottom: 8 }}>
      <Form.Item name={['form', 'name']} label="Name" rules={[{ required: true }]}>
        <Input placeholder="Node name" />
      </Form.Item>
      <Form.Item name={['form', 'role']} label="Role">
        <RoleSelector />
      </Form.Item>
      <Form.Item name={['form', 'text']} label="Text" rules={[{ required: true }]}>
        <Input.TextArea rows={3} placeholder="${conversation}" />
      </Form.Item>
      <Form.Item name={['form', 'maxResults']} label="Max Results" initialValue={10}>
        <InputNumber min={1} max={100} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name={['form', 'minLength']} label="Min Length" initialValue={3}>
        <InputNumber min={1} max={20} style={{ width: '100%' }} />
      </Form.Item>
    </Card>
  );
};

export default NativeKeywordsNodeForm;
