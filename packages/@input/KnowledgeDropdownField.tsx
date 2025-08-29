import React from 'react';
import { Select, Form } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';

export interface KnowledgeDropdownFieldOption {
  id: string;
  name: string;
}

export interface KnowledgeDropdownFieldProps {
  name: string | (string | number)[];
  label: string;
  options: KnowledgeDropdownFieldOption[];
  placeholder?: string;
  required?: boolean;
  help?: string;
}

const KnowledgeDropdownField: React.FC<KnowledgeDropdownFieldProps> = ({ name, label, options, placeholder, required, help }) => (
  <Form.Item name={name} label={label} help={help} rules={required ? [{ required: true }] : []}>
    <Select
      mode="multiple"
      placeholder={placeholder}
      optionLabelProp="label"
      showSearch
      filterOption={(input, option) => (option?.label as string).toLowerCase().includes(input.toLowerCase())}
    >
      {options.map((kb) => (
        <Select.Option key={kb.id} value={kb.id} label={kb.name}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <DatabaseOutlined style={{ marginRight: 8 }} />
            <span>{kb.name}</span>
          </div>
        </Select.Option>
      ))}
    </Select>
  </Form.Item>
);

export default KnowledgeDropdownField;
