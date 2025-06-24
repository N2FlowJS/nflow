import React, { useEffect } from 'react';
import { Form, Input, Select, Collapse, Typography, Alert, Space } from 'antd';
import {
  SettingOutlined,
  ApartmentOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import BaseNodeForm from './base-node-form';
import { FlowNode } from '../../../models/flowTypes';
import RoleSelector from './shared/RoleSelector';
import InputReferences from './shared/InputReferences';

const { Text } = Typography;

interface AgentNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AgentNodeForm: React.FC<AgentNodeFormProps> = (props) => {
  const { selectedNode } = props;

  useEffect(() => {
    // Set default values or perform actions based on selectedNode if needed
    props.form.setFieldsValue({
      // Example: setting a default system message
      form: {
        systemMessage: 'You are a helpful assistant.',
        ...selectedNode.data,
      },
    });
  }, [props.form, selectedNode]);

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Agent (Dispatcher) Node"
        description="Acts as a central coordinator that can execute tools and delegate tasks to other agents based on the input."
        type="info"
        showIcon
        icon={<ApartmentOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['config', 'tools']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'config',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Agent Configuration
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form.Item
                  name={['form', 'systemMessage']}
                  label="System Message"
                  rules={[
                    {
                      required: true,
                      message:
                        "Please define the agent's role and instructions.",
                    },
                  ]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="e.g., You are a helpful assistant."
                  />
                </Form.Item>
                <Form.Item name={['form', 'model']} label="LLM Model">
                  <Select placeholder="Select a model (coming soon)" disabled />
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'tools',
            label: (
              <Text strong>
                <ToolOutlined style={{ marginRight: 8 }} />
                Tools & Delegation
              </Text>
            ),
            children: (
              <Text type="secondary">
                Tool and agent delegation configuration will be available here.
              </Text>
            ),
          },
        ]}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default AgentNodeForm;
