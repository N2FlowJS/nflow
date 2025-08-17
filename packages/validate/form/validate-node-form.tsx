import { CheckCircleOutlined, SettingOutlined, CodeOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, InputNumber, Switch, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { Text } = Typography;

interface ValidateNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ValidateNodeForm: React.FC<ValidateNodeFormProps> = (props) => {
  const { selectedNode } = props;
  useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Validate Node"
        description="Validate data format and constraints. Check emails, URLs, phone numbers, JSON, numbers, dates, and custom patterns."
        type="info"
        showIcon
        icon={<CheckCircleOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['input', 'validation', 'constraints']}
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
              <Form.Item
                name="inputData"
                label="Input Data"
                help="Data to validate. Use {{variableName}} syntax to reference variables from previous nodes."
                rules={[{ required: true, message: 'Please specify the input data to validate' }]}
              >
                <Input placeholder="{{dataToValidate}}" />
              </Form.Item>
            ),
          },
          {
            key: 'validation',
            label: (
              <Text strong>
                <CheckCircleOutlined style={{ marginRight: 8 }} />
                Validation Type
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="validationType"
                  label="Validation Type"
                  help="Choose the type of validation to perform"
                  initialValue="email"
                  rules={[{ required: true, message: 'Please select a validation type' }]}
                >
                  <Select>
                    <Select.Option value="email">Email Address</Select.Option>
                    <Select.Option value="url">URL</Select.Option>
                    <Select.Option value="phone">Phone Number</Select.Option>
                    <Select.Option value="json">JSON Format</Select.Option>
                    <Select.Option value="number">Number</Select.Option>
                    <Select.Option value="date">Date</Select.Option>
                    <Select.Option value="custom">Custom Pattern (Regex)</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const validationType = getFieldValue('validationType');
                    return validationType === 'custom' ? (
                      <Form.Item
                        name="customPattern"
                        label="Custom Regex Pattern"
                        help="Regular expression pattern for custom validation"
                        rules={[{ required: true, message: 'Please enter a regex pattern' }]}
                      >
                        <Input placeholder="^[A-Za-z0-9]+$" />
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'constraints',
            label: (
              <Text strong>
                <CodeOutlined style={{ marginRight: 8 }} />
                Constraints
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="required"
                  label="Required Field"
                  help="Whether the field is required (non-empty)"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="minLength"
                  label="Minimum Length"
                  help="Minimum number of characters (optional)"
                >
                  <InputNumber
                    min={0}
                    max={10000}
                    style={{ width: '100%' }}
                    placeholder="No minimum"
                  />
                </Form.Item>

                <Form.Item
                  name="maxLength"
                  label="Maximum Length"
                  help="Maximum number of characters (optional)"
                >
                  <InputNumber
                    min={1}
                    max={10000}
                    style={{ width: '100%' }}
                    placeholder="No maximum"
                  />
                </Form.Item>
              </Space>
            ),
          },
        ]}
      />

      <Alert
        message="Validation Results"
        description="The node returns a JSON object with 'valid' (boolean), 'message' (string), and 'value' (original input) properties."
        type="info"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default ValidateNodeForm;
