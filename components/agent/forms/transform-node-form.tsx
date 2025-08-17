import { SwapOutlined, CodeOutlined, SettingOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { TextArea } = Input;
const { Text } = Typography;

interface TransformNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TransformNodeForm: React.FC<TransformNodeFormProps> = (props) => {
  const { selectedNode } = props;
  useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Transform Node"
        description="Transform and manipulate data using JavaScript expressions. Perfect for data processing and formatting."
        type="info"
        showIcon
        icon={<SwapOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['input', 'transformation']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'input',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Input Configuration
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="transformType"
                  label="Data Type"
                  help="Type of data being transformed"
                  initialValue="json"
                >
                  <Select>
                    <Select.Option value="json">JSON Object/Array</Select.Option>
                    <Select.Option value="text">Text/String</Select.Option>
                    <Select.Option value="array">Array</Select.Option>
                    <Select.Option value="object">Object</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="inputData"
                  label="Input Data"
                  help="Reference to the data to transform using {{variableName}} syntax"
                  rules={[{ required: true, message: 'Please specify the input data' }]}
                >
                  <Input placeholder="{{previousNodeOutput}}" />
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'transformation',
            label: (
              <Text strong>
                <CodeOutlined style={{ marginRight: 8 }} />
                Transformation Logic
              </Text>
            ),
            children: (
              <Form.Item
                name="transformation"
                label="JavaScript Expression"
                help="JavaScript code to transform the data. Use 'data' variable to reference input."
                rules={[{ required: true, message: 'Please enter transformation logic' }]}
              >
                <TextArea
                  rows={8}
                  placeholder={`// Transform examples:
// For arrays:
data.map(item => ({ ...item, processed: true }))

// For objects:
{ ...data, timestamp: new Date().toISOString() }

// For text:
data.toUpperCase().replace(/\\s+/g, '_')

// Complex transformation:
data.filter(item => item.active)
    .map(item => ({
      id: item.id,
      name: item.name.trim(),
      score: Math.round(item.score * 100) / 100
    }))`}
                  style={{ fontFamily: 'monospace' }}
                />
              </Form.Item>
            ),
          },
        ]}
      />

      <Alert
        message="JavaScript Execution Environment"
        description="Transformations run in a safe JavaScript environment with access to: JSON, Object, Array, String, Number, Boolean, Math, Date, RegExp, parseInt, parseFloat, isNaN, isFinite"
        type="info"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default TransformNodeForm;
