
export interface InputFieldProps {
  name: string | (string | number)[];
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'textarea' | 'number' | 'password';
  rows?: number;
}

const InputField: React.FC<InputFieldProps> = ({ name, label, placeholder, required, type = 'text', rows }) => (
  <Form.Item name={name} label={label} rules={required ? [{ required: true }] : []}>
    {type === 'textarea' ? (
      <Input.TextArea placeholder={placeholder} rows={rows || 4} />
    ) : (
      <Input type={type} placeholder={placeholder} />
    )}
  </Form.Item>
);

export default InputField;
import React from 'react';
import { Input, Form } from 'antd';
