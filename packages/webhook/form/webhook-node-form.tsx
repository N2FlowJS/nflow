import { LinkOutlined, SettingOutlined, CodeOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, InputNumber, Select, Collapse, Space, Typography, Alert, Button } from 'antd';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { TextArea } = Input;
const { Text } = Typography;

interface WebhookNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const WebhookNodeForm: React.FC<WebhookNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Webhook Node"
        description="Send data to external webhook endpoints. Perfect for integrating with third-party services and triggering external workflows."
        type="info"
        showIcon
        icon={<LinkOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['webhook', 'payload', 'settings']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'webhook',
            label: (
              <Text strong>
                <LinkOutlined style={{ marginRight: 8 }} />
                Webhook Configuration
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="webhookUrl"
                  label="Webhook URL"
                  help="The endpoint URL to send the webhook to. Use {{variableName}} for dynamic URLs."
                  rules={[{ required: true, message: 'Please specify the webhook URL' }]}
                >
                  <Input placeholder="https://hooks.example.com/webhook" />
                </Form.Item>

                <Form.Item
                  name="method"
                  label="HTTP Method"
                  help="HTTP method to use for the webhook request"
                  initialValue="POST"
                  rules={[{ required: true, message: 'Please select an HTTP method' }]}
                >
                  <Select>
                    <Select.Option value="POST">POST</Select.Option>
                    <Select.Option value="PUT">PUT</Select.Option>
                    <Select.Option value="GET">GET</Select.Option>
                  </Select>
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'payload',
            label: (
              <Text strong>
                <CodeOutlined style={{ marginRight: 8 }} />
                Payload & Headers
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="payload"
                  label="Request Payload"
                  help="Data to send in the webhook request. Use {{variableName}} to reference variables from previous nodes."
                  rules={[{ required: true, message: 'Please specify the payload' }]}
                >
                  <TextArea
                    rows={6}
                    placeholder='{"message": "{{dataToSend}}", "timestamp": "{{currentTime}}"}'
                  />
                </Form.Item>

                <Form.List name="headers">
                  {(fields, { add, remove }) => (
                    <>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>Custom Headers</Text>
                      </div>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                          <Form.Item
                            {...restField}
                            name={[name, 'key']}
                            rules={[{ required: true, message: 'Missing header name' }]}
                          >
                            <Input placeholder="Header name" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, 'value']}
                            rules={[{ required: true, message: 'Missing header value' }]}
                          >
                            <Input placeholder="Header value" />
                          </Form.Item>
                          <Button type="link" onClick={() => remove(name)}>
                            Remove
                          </Button>
                        </Space>
                      ))}
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block>
                          Add Custom Header
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </Space>
            ),
          },
          {
            key: 'settings',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Advanced Settings
              </Text>
            ),
            children: (
              <Form.Item
                name="retryCount"
                label="Retry Count"
                help="Number of times to retry the webhook if it fails"
                initialValue={3}
              >
                <InputNumber
                  min={0}
                  max={10}
                  style={{ width: '100%' }}
                  placeholder="3"
                />
              </Form.Item>
            ),
          },
        ]}
      />

      <Alert
        message="Security Notice"
        description="Webhook payloads may contain sensitive data. Ensure the webhook endpoint is secure and trusted."
        type="warning"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default WebhookNodeForm;
