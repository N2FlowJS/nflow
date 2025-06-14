import { SaveOutlined, SettingOutlined, FileOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Switch, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from './base-node-form';
import InputReferences from './shared/InputReferences';
import RoleSelector from './shared/RoleSelector';
import { useLocale } from '../../../locale';

const { TextArea } = Input;
const { Text } = Typography;

interface FileWriteNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const FileWriteNodeForm: React.FC<FileWriteNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="File Write Node"
        description="Write content to files with dynamic paths and content. Supports different encodings and overwrite protection."
        type="info"
        showIcon
        icon={<SaveOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['file', 'content', 'settings']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'file',
            label: (
              <Text strong>
                <FileOutlined style={{ marginRight: 8 }} />
                File Configuration
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="filePath"
                  label="File Path"
                  help="Path where the file will be written. Use {{variableName}} syntax to reference variables."
                  rules={[{ required: true, message: 'Please specify the file path' }]}
                >
                  <Input placeholder="/path/to/output.txt or {{outputPath}}" />
                </Form.Item>

                <Form.Item
                  name="encoding"
                  label="File Encoding"
                  help="Character encoding for the file"
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
            key: 'content',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Content Configuration
              </Text>
            ),
            children: (
              <Form.Item
                name="content"
                label="Content to Write"
                help="Content to write to the file. Use {{variableName}} syntax to reference variables from previous nodes."
                rules={[{ required: true, message: 'Please specify the content to write' }]}
              >
                <TextArea
                  rows={6}
                  placeholder="{{contentToWrite}} or direct content"
                />
              </Form.Item>
            ),
          },
          {
            key: 'settings',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Write Settings
              </Text>
            ),
            children: (
              <Form.Item
                name="overwrite"
                label="Overwrite Existing File"
                help="Whether to overwrite the file if it already exists"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            ),
          },
        ]}
      />

      <Alert
        message="Security Notice"
        description="File writes are restricted to the current working directory for security. Directory traversal attempts will be blocked."
        type="warning"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default FileWriteNodeForm;
