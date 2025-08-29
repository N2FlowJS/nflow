import React from 'react';
import { Input, Form } from 'antd';

export interface TextInputFieldProps {
  name: string | (string | number)[];
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'number' | 'password';
}

const TextInputField: React.FC<TextInputFieldProps> = ({ name, label, placeholder, required, type = 'text' }) => (
  <Form.Item name={name} label={label} rules={required ? [{ required: true }] : []}>
    <Input type={type} placeholder={placeholder} />
  </Form.Item>
);

export default TextInputField;
