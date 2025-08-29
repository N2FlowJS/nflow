import React from 'react';
import { Input, Form } from 'antd';

export interface TextAreaFieldProps {
  name: string | (string | number)[];
  label: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ name, label, placeholder, required, rows }) => (
  <Form.Item name={name} label={label} rules={required ? [{ required: true }] : []}>
    <Input.TextArea placeholder={placeholder} rows={rows || 4} />
  </Form.Item>
);

export default TextAreaField;
