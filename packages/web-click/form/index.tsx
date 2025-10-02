import { InteractionOutlined, SettingOutlined, EyeOutlined } from '@ant-design/icons';
import type { FlowNode } from '@n2flowjs/flow';
import { Form, Input, Select, Switch, InputNumber, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { Text } = Typography;

interface WebClickNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const WebClickNodeForm: React.FC<WebClickNodeFormProps> = (props) => {
  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Web Click Node"
        description="Click an element on the current web page. Supports CSS selectors, XPath, or text-based element selection."
        type="info"
        showIcon
        icon={<InteractionOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['selector', 'settings']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'selector',
            label: (
              <Text strong>
                <InteractionOutlined style={{ marginRight: 8 }} />
                Element Selector
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="selector"
                  label="Selector"
                  help="Element selector to click. Use {{variableName}} for dynamic values."
                  rules={[{ required: true, message: 'Please enter a selector' }]}
                >
                  <Input placeholder="button.submit or {{selector}}" />
                </Form.Item>

                <Form.Item
                  name="selectorType"
                  label="Selector Type"
                  help="Type of selector to use"
                  initialValue="css"
                >
                  <Select>
                    <Select.Option value="css">CSS Selector</Select.Option>
                    <Select.Option value="xpath">XPath</Select.Option>
                    <Select.Option value="text">Text Content</Select.Option>
                  </Select>
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'settings',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Click Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="clickType"
                  label="Click Type"
                  help="Type of click to perform"
                  initialValue="single"
                >
                  <Select>
                    <Select.Option value="single">Single Click</Select.Option>
                    <Select.Option value="double">Double Click</Select.Option>
                    <Select.Option value="right">Right Click</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="waitForSelector"
                  label="Wait for Element"
                  help="Wait for element to appear before clicking"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="timeout"
                  label="Timeout (ms)"
                  help="Maximum time to wait for element"
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
                  name="delay"
                  label="Delay Before Click (ms)"
                  help="Wait time before clicking element"
                  initialValue={0}
                >
                  <InputNumber
                    min={0}
                    max={10000}
                    step={100}
                    style={{ width: '100%' }}
                    placeholder="0"
                  />
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

export default WebClickNodeForm;
