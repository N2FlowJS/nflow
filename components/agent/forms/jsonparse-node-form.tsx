import { CodeOutlined, SettingOutlined, DatabaseOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { TextArea } = Input;
const { Text } = Typography;

interface JsonParseNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const JsonParseNodeForm: React.FC<JsonParseNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="JSON Parse Node"
        description="Parse, stringify, extract data from JSON, or validate JSON format. Essential for working with API responses and structured data."
        type="info"
        showIcon
        icon={<CodeOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['input', 'operation', 'output']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'input',
            label: (
              <Text strong>
                <DatabaseOutlined style={{ marginRight: 8 }} />
                Input Configuration
              </Text>
            ),
            children: (
              <Form.Item
                name="jsonData"
                label="JSON Data"
                help="JSON data to process. Use {{variableName}} syntax to reference variables from previous nodes."
                rules={[{ required: true, message: 'Please specify the JSON data' }]}
              >
                <TextArea
                  rows={4}
                  placeholder='{{apiResponse}} or {&quot;key&quot;: &quot;value&quot;}'
                />
              </Form.Item>
            ),
          },
          {
            key: 'operation',
            label: (
              <Text strong>
                <CodeOutlined style={{ marginRight: 8 }} />
                JSON Operation
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="operation"
                  label="Operation Type"
                  help="Choose the JSON operation to perform"
                  initialValue="parse"
                  rules={[{ required: true, message: 'Please select an operation' }]}
                >
                  <Select>
                    <Select.Option value="parse">Parse - Convert JSON string to object</Select.Option>
                    <Select.Option value="stringify">Stringify - Convert object to JSON string</Select.Option>
                    <Select.Option value="extract">Extract - Get specific data using path</Select.Option>
                    <Select.Option value="validate">Validate - Check if JSON is valid</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const operation = getFieldValue('operation');
                    return operation === 'extract' ? (
                      <Form.Item
                        name="jsonPath"
                        label="JSON Path"
                        help="Path to extract data (e.g., 'user.name' or 'items[0].id')"
                        rules={[{ required: true, message: 'Please enter JSON path' }]}
                      >
                        <Input placeholder="user.name or items[0].id" />
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'output',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Output Format
              </Text>
            ),
            children: (
              <Form.Item
                name="outputFormat"
                label="Output Format"
                help="How to format the output result"
                initialValue="object"
              >
                <Select>
                  <Select.Option value="object">Object/Array (structured)</Select.Option>
                  <Select.Option value="string">String (serialized)</Select.Option>
                </Select>
              </Form.Item>
            ),
          },
        ]}
      />

      <Alert
        message="Usage Examples"
        description={
          <div>
            <p><strong>Parse:</strong> Convert API response string to usable object</p>
            <p><strong>Extract:</strong> Get specific values like &quot;user.profile.email&quot;</p>
            <p><strong>Stringify:</strong> Convert data for HTTP requests or storage</p>
            <p><strong>Validate:</strong> Check data integrity before processing</p>
          </div>
        }
        type="info"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default JsonParseNodeForm;
