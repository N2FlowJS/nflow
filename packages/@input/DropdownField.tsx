import React from 'react';
import { Select, Form } from 'antd';

export interface DropdownFieldOption {
  value: string | number;
  label: string;
}

export interface DropdownFieldProps {
  name: string | (string | number)[];
  label: string;
  options: DropdownFieldOption[];
  placeholder?: string;
  required?: boolean;
  mode?: 'multiple' | 'tags';
}

const DropdownField: React.FC<DropdownFieldProps> = ({ name, label, options, placeholder, required, mode }) => (
  <Form.Item name={name} label={label} rules={required ? [{ required: true }] : []}>
    <Select
      placeholder={placeholder}
      mode={mode}
      optionLabelProp="label"
      showSearch
      filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
    >
      {options.map((opt) => (
        <Select.Option key={opt.value} value={opt.value} label={opt.label}>
          {opt.label}
        </Select.Option>
      ))}
    </Select>
  </Form.Item>
);

export default DropdownField;
