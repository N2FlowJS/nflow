import { GlobalOutlined, SettingOutlined, EyeOutlined } from '@ant-design/icons';
import type { FlowNode } from '@n2flowjs/flow';
import { Form, Input, Switch, InputNumber, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { Text } = Typography;

interface WebOpenNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const WebOpenNodeForm: React.FC<WebOpenNodeFormProps> = (props) => {
  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Web Open Node"
        description="Open a web page in a browser using Puppeteer. This creates a browser session that can be used by subsequent web nodes."
        type="info"
        showIcon
        icon={<GlobalOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['url', 'settings']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'url',
            label: (
              <Text strong>
                <GlobalOutlined style={{ marginRight: 8 }} />
                URL
              </Text>
            ),
            children: (
              <Form.Item
                name="url"
                label="Website URL"
                help="Enter the URL to open. Use {{variableName}} syntax to reference variables."
                rules={[{ required: true, message: 'Please enter a URL' }]}
              >
                <Input placeholder="https://example.com or {{url}}" />
              </Form.Item>
            ),
          },
          {
            key: 'settings',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Browser Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="headless"
                  label="Headless Mode"
                  help="Run browser in headless mode (no visible window)"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name={['viewport', 'width']}
                  label="Viewport Width"
                  help="Browser window width in pixels"
                  initialValue={1920}
                >
                  <InputNumber
                    min={320}
                    max={3840}
                    style={{ width: '100%' }}
                    placeholder="1920"
                  />
                </Form.Item>

                <Form.Item
                  name={['viewport', 'height']}
                  label="Viewport Height"
                  help="Browser window height in pixels"
                  initialValue={1080}
                >
                  <InputNumber
                    min={240}
                    max={2160}
                    style={{ width: '100%' }}
                    placeholder="1080"
                  />
                </Form.Item>

                <Form.Item
                  name="userAgent"
                  label="User Agent"
                  help="Custom user agent string (optional)"
                >
                  <Input placeholder="Mozilla/5.0 ..." />
                </Form.Item>

                <Form.Item
                  name="timeout"
                  label="Timeout (ms)"
                  help="Maximum time to wait for page load"
                  initialValue={30000}
                >
                  <InputNumber
                    min={1000}
                    max={120000}
                    step={1000}
                    style={{ width: '100%' }}
                    placeholder="30000"
                  />
                </Form.Item>

                <Form.Item
                  name="waitUntil"
                  label="Wait Until"
                  help="When to consider navigation succeeded"
                  initialValue="networkidle2"
                >
                  <Select>
                    <Select.Option value="load">load - Page load event</Select.Option>
                    <Select.Option value="domcontentloaded">domcontentloaded - DOM loaded</Select.Option>
                    <Select.Option value="networkidle0">networkidle0 - No network connections</Select.Option>
                    <Select.Option value="networkidle2">networkidle2 - Max 2 network connections</Select.Option>
                  </Select>
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'role',
            label: (
              <Text strong>
                <EyeOutlined style={{ marginRight: 8 }} />
                Display Settings
              </Text>
            ),
            children: <RoleSelector />,
          },
        ]}
      />
    </BaseNodeForm>
  );
};

export default WebOpenNodeForm;
