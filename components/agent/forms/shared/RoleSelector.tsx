import React from 'react';
import { Form, Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { FormItemProps } from 'antd/es/form';

// Default roles available in the system
const DEFAULT_ROLE_OPTIONS = [
  { value: 'system', label: 'System (Instructions & Context)' },
  { value: 'user', label: 'User (Human Input)' },
  { value: 'assistant', label: 'Assistant (AI Response)' },
  { value: 'developer', label: 'Developer (Technical Context)' },
];

export interface RoleSelectorProps {
  name?: string; // Form item name (default: "role")
  label?: React.ReactNode; // Form item label (default: "Message Role")
  tooltip?: React.ReactNode; // Optional tooltip
  required?: boolean; // Whether the field is required (default: true)
  defaultValue?: string; // Default role value (default: "assistant")
  options?: { value: string; label: string }[]; // Custom role options
  formItemProps?: Partial<FormItemProps>; // Additional Form.Item props
  selectProps?: Partial<React.ComponentProps<typeof Select>>; // Additional Select props
}

const RoleSelector: React.FC<RoleSelectorProps> = ({
  name = 'role',
  label = 'Message Role',
  tooltip,
  required = true,
  defaultValue = 'assistant',
  options = DEFAULT_ROLE_OPTIONS,
  formItemProps = {},
  selectProps = {},
}) => {
  return (
    <Form.Item
      name={name}
      label={label}
      tooltip={tooltip}
      extra="Define the role for this message in the conversation"
      rules={required ? [{ required: true, message: 'Please select a role' }] : undefined}
      initialValue={defaultValue}
      {...formItemProps}
    >
      <Select
        placeholder="Select a role"
        options={options}
        suffixIcon={<UserOutlined />}
        {...selectProps}
      />
    </Form.Item>
  );
};

export default RoleSelector;
