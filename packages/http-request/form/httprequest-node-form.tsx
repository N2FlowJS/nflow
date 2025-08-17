import { ApiOutlined, SettingOutlined, CodeOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, InputNumber, Switch, Collapse, Space, Typography, Alert, Button } from 'antd';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { TextArea } = Input;
const { Text } = Typography;

interface HttpRequestNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const HttpRequestNodeForm: React.FC<HttpRequestNodeFormProps> = (props) => {
  const { selectedNode } = props;
  useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="HTTP Request Node"
        description="Make HTTP requests to external APIs and services. Supports dynamic URLs and headers with variable substitution."
        type="info"
        showIcon
        icon={<ApiOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['request', 'headers', 'settings']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'request',
            label: (
              <Text strong>
                <ApiOutlined style={{ marginRight: 8 }} />
                Request Configuration
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="method"
                  label="HTTP Method"
                  initialValue="GET"
                >
                  <Select>
                    <Select.Option value="GET">GET</Select.Option>
                    <Select.Option value="POST">POST</Select.Option>
                    <Select.Option value="PUT">PUT</Select.Option>
                    <Select.Option value="DELETE">DELETE</Select.Option>
                    <Select.Option value="PATCH">PATCH</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="url"
                  label="URL"
                  help="Use {{variableName}} syntax to reference variables from previous nodes"
                  rules={[{ required: true, message: 'Please enter the request URL' }]}
                >
                  <Input placeholder="https://api.example.com/{{endpoint}}" />
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const method = getFieldValue('method');
                    return ['POST', 'PUT', 'PATCH'].includes(method) ? (
                      <Form.Item
                        name="body"
                        label="Request Body"
                        help="JSON or text data to send in the request body"
                      >
                        <TextArea
                          rows={6}
                          placeholder='{"key": "{{value}}", "data": "example"}'
                          style={{ fontFamily: 'monospace' }}
                        />
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'headers',
            label: (
              <Text strong>
                <CodeOutlined style={{ marginRight: 8 }} />
                Headers
              </Text>
            ),
            children: (
              <div>
                <Alert
                  message="HTTP Headers"
                  description="Add custom headers to your request. Use {{variableName}} for dynamic values."
                  type="info"
                  style={{ marginBottom: 16 }}
                />
                
                <Form.List name="headersList">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                          <Form.Item
                            {...restField}
                            name={[name, 'key']}
                            rules={[{ required: true, message: 'Missing header name' }]}
                          >
                            <Input placeholder="Content-Type" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'value']}
                            rules={[{ required: true, message: 'Missing header value' }]}
                          >
                            <Input placeholder="application/json" />
                          </Form.Item>
                          <Button type="link" onClick={() => remove(name)}>
                            Remove
                          </Button>
                        </Space>
                      ))}
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block>
                          Add Header
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </div>
            ),
          },
          {
            key: 'settings',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Request Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="timeout"
                  label="Timeout (seconds)"
                  help="Maximum time to wait for the request"
                  initialValue={30}
                >
                  <InputNumber
                    min={1}
                    max={300}
                    style={{ width: '100%' }}
                    placeholder="30"
                  />
                </Form.Item>

                <Form.Item
                  name="followRedirects"
                  label="Follow Redirects"
                  help="Automatically follow HTTP redirects"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>
              </Space>
            ),
          },
        ]}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default HttpRequestNodeForm;
