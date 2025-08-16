import { FileTextOutlined, SafetyOutlined } from '@ant-design/icons';
import { Alert, Collapse, Form, Input, InputNumber, Select, Space, Typography } from 'antd';
import React from 'react';
import { useLocale } from '../../../locale';
import { FlowNode } from '../../../models/flowTypes';
import BaseNodeForm from './base-node-form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { Text } = Typography;

interface FileReadNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const FileReadNodeForm: React.FC<FileReadNodeFormProps> = (props) => {
  const { selectedNode } = props;
  useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="File Read Node"
        description="Read content from files with support for different encodings and size limits for security."
        type="info"
        showIcon
        icon={<FileTextOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['file', 'settings']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'file',
            label: (
              <Text strong>
                <FileTextOutlined style={{ marginRight: 8 }} />
                File Configuration
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="filePath"
                  label="File Path"
                  help="Path to the file to read. Use {{variableName}} syntax to reference variables from previous nodes."
                  rules={[{ required: true, message: 'Please specify the file path' }]}
                >
                  <Input placeholder="/path/to/file.txt or {{inputPath}}" />
                </Form.Item>

                <Form.Item
                  name="encoding"
                  label="File Encoding"
                  help="Character encoding to use when reading the file"
                  initialValue="utf8"
                >
                  <Select>
                    <Select.Option value="utf8">UTF-8 (Text files)</Select.Option>
                    <Select.Option value="base64">Base64 (Binary data)</Select.Option>
                    <Select.Option value="binary">Binary</Select.Option>
                  </Select>
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'settings',
            label: (
              <Text strong>
                <SafetyOutlined style={{ marginRight: 8 }} />
                Security Settings
              </Text>
            ),
            children: (
              <Form.Item
                name="maxSize"
                label="Maximum File Size (bytes)"
                help="Maximum file size to read for security (1MB = 1048576 bytes)"
                initialValue={1048576}
              >
                <InputNumber
                  min={1024}
                  max={10485760}
                  style={{ width: '100%' }}
                  placeholder="1048576"
                  formatter={(value) => {
                    if (!value) return '';
                    const num = parseInt(value.toString());
                    if (num >= 1048576) {
                      return `${(num / 1048576).toFixed(1)}MB`;
                    } else if (num >= 1024) {
                      return `${(num / 1024).toFixed(1)}KB`;
                    }
                    return `${num}B`;
                  }}
                  parser={(value) => {
                    if (!value) return 1024;
                    const cleanValue = value.toString().replace(/[^\d.]/g, '');
                    const num = parseFloat(cleanValue);
                    let result = 1024;
                    if (value.includes('MB')) {
                      result = Math.round(num * 1048576);
                    } else if (value.includes('KB')) {
                      result = Math.round(num * 1024);
                    } else {
                      result = Math.round(num);
                    }
                    // Constrain to allowed values
                    if (result <= 1024) return 1024;
                    if (result >= 10485760) return 10485760;
                    return result as 1024 | 10485760;
                  }}
                />
              </Form.Item>
            ),
          },
        ]}
      />

      <Alert
        message="Security Notice"
        description="File reads are restricted to the current working directory for security. Directory traversal attempts will be blocked."
        type="warning"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default FileReadNodeForm;
