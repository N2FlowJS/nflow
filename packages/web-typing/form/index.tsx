import { EditOutlined, SettingOutlined, EyeOutlined } from '@ant-design/icons';
import type { FlowNode } from '@n2flowjs/flow';
import { Form, Input, Select, Switch, InputNumber, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { Text } = Typography;

interface WebTypingNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const WebTypingNodeForm: React.FC<WebTypingNodeFormProps> = (props) => {
  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Web Typing Node"
        description="Type text into an input field or textarea on the current web page. Supports CSS selectors, XPath, or text-based element selection."
        type="info"
        showIcon
        icon={<EditOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['selector', 'text', 'settings']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'selector',
            label: (
              <Text strong>
                <EditOutlined style={{ marginRight: 8 }} />
                Element Selector
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="selector"
                  label="Selector"
                  help="Input element selector to type into. Use {{variableName}} for dynamic values."
                  rules={[{ required: true, message: 'Please enter a selector' }]}
                >
                  <Input placeholder="input[name='search'] or {{selector}}" />
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
                    <Select.Option value="text">Text Content (placeholder/aria-label)</Select.Option>
                  </Select>
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'text',
            label: (
              <Text strong>
                <EditOutlined style={{ marginRight: 8 }} />
                Text Content
              </Text>
            ),
            children: (
              <Form.Item
                name="text"
                label="Text to Type"
                help="Text to type into the element. Use {{variableName}} for dynamic values."
                rules={[{ required: true, message: 'Please enter text to type' }]}
              >
                <Input.TextArea 
                  rows={4}
                  placeholder="Enter text or {{textVariable}}" 
                />
              </Form.Item>
            ),
          },
          {
            key: 'settings',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Typing Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="clearBefore"
                  label="Clear Before Typing"
                  help="Clear existing text in the input before typing"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="pressEnter"
                  label="Press Enter After"
                  help="Press Enter key after typing (useful for search forms)"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="typingDelay"
                  label="Typing Delay (ms)"
                  help="Delay between each keystroke (simulates human typing)"
                  initialValue={50}
                >
                  <InputNumber
                    min={0}
                    max={1000}
                    step={10}
                    style={{ width: '100%' }}
                    placeholder="50"
                  />
                </Form.Item>

                <Form.Item
                  name="waitForSelector"
                  label="Wait for Element"
                  help="Wait for element to appear before typing"
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

export default WebTypingNodeForm;
