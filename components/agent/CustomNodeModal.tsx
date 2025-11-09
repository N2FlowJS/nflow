import React, { useState } from 'react';
import { Modal, Form, Input, Button, Select, Space, message, Card, Divider } from 'antd';
import { CodeOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

interface PortDefinition {
  name: string;
  type: string;
  required?: boolean;
}

interface CustomNodeFormData {
  name: string;
  description: string;
  code: string;
  inputPorts: PortDefinition[];
  outputPorts: PortDefinition[];
  icon?: string;
  category: string;
}

interface CustomNodeModalProps {
  open: boolean;
  onCancel: () => void;
  onCreate: (data: CustomNodeFormData) => Promise<void>;
  loading?: boolean;
}

const CustomNodeModal: React.FC<CustomNodeModalProps> = ({
  open,
  onCancel,
  onCreate,
  loading = false
}) => {
  const [form] = Form.useForm<CustomNodeFormData>();
  const [inputPorts, setInputPorts] = useState<PortDefinition[]>([
    { name: 'input1', type: 'string', required: true }
  ]);
  const [outputPorts, setOutputPorts] = useState<PortDefinition[]>([
    { name: 'output1', type: 'string' }
  ]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData: CustomNodeFormData = {
        ...values,
        inputPorts,
        outputPorts
      };

      await onCreate(formData);
      message.success('Custom node created successfully!');
      handleCancel();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setInputPorts([{ name: 'input1', type: 'string', required: true }]);
    setOutputPorts([{ name: 'output1', type: 'string' }]);
    onCancel();
  };

  const addInputPort = () => {
    setInputPorts([...inputPorts, { name: `input${inputPorts.length + 1}`, type: 'string', required: false }]);
  };

  const removeInputPort = (index: number) => {
    if (inputPorts.length > 1) {
      setInputPorts(inputPorts.filter((_, i) => i !== index));
    }
  };

  const updateInputPort = (index: number, field: keyof PortDefinition, value: any) => {
    const updated = [...inputPorts];
    updated[index] = { ...updated[index], [field]: value };
    setInputPorts(updated);
  };

  const addOutputPort = () => {
    setOutputPorts([...outputPorts, { name: `output${outputPorts.length + 1}`, type: 'string' }]);
  };

  const removeOutputPort = (index: number) => {
    if (outputPorts.length > 1) {
      setOutputPorts(outputPorts.filter((_, i) => i !== index));
    }
  };

  const updateOutputPort = (index: number, field: keyof PortDefinition, value: any) => {
    const updated = [...outputPorts];
    updated[index] = { ...updated[index], [field]: value };
    setOutputPorts(updated);
  };

  const sampleCode = `// Example: Simple text processor
// Available: context (utilities), inputs (port values), outputs (results)

const inputText = inputs.input1 || '';

// Process the text (example: convert to uppercase)
const processedText = inputText.toUpperCase();

// Set the output
outputs.output1 = processedText;

// Optional: Log for debugging
context.console.log('Processed text:', processedText);`;

  return (
    <Modal
      title={
        <Space>
          <CodeOutlined />
          Create Custom Node
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Create Node
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          category: 'custom',
          code: sampleCode
        }}
      >
        <Form.Item
          name="name"
          label="Node Name"
          rules={[{ required: true, message: 'Please enter a node name' }]}
        >
          <Input placeholder="e.g., Text Processor" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter a description' }]}
        >
          <Input.TextArea
            placeholder="Describe what this node does"
            rows={2}
          />
        </Form.Item>

        <Form.Item name="category" label="Category">
          <Select>
            <Option value="custom">Custom</Option>
            <Option value="processing">Processing</Option>
            <Option value="ai">AI</Option>
            <Option value="utility">Utility</Option>
            <Option value="api">API</Option>
          </Select>
        </Form.Item>

        <Divider>Input Ports</Divider>
        <Space direction="vertical" style={{ width: '100%' }}>
          {inputPorts.map((port, index) => (
            <Card key={index} size="small" style={{ padding: 0 }}>
              <Space>
                <Input
                  placeholder="Port name"
                  value={port.name}
                  onChange={(e) => updateInputPort(index, 'name', e.target.value)}
                  style={{ width: 120 }}
                />
                <Select
                  value={port.type}
                  onChange={(value) => updateInputPort(index, 'type', value)}
                  style={{ width: 100 }}
                >
                  <Option value="string">String</Option>
                  <Option value="number">Number</Option>
                  <Option value="boolean">Boolean</Option>
                  <Option value="object">Object</Option>
                  <Option value="array">Array</Option>
                </Select>
                <Button
                  type={port.required ? 'primary' : 'default'}
                  size="small"
                  onClick={() => updateInputPort(index, 'required', !port.required)}
                >
                  {port.required ? 'Required' : 'Optional'}
                </Button>
                {inputPorts.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeInputPort(index)}
                  />
                )}
              </Space>
            </Card>
          ))}
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addInputPort}
            block
          >
            Add Input Port
          </Button>
        </Space>

        <Divider>Output Ports</Divider>
        <Space direction="vertical" style={{ width: '100%' }}>
          {outputPorts.map((port, index) => (
            <Card key={index} size="small" style={{ padding: 0 }}>
              <Space>
                <Input
                  placeholder="Port name"
                  value={port.name}
                  onChange={(e) => updateOutputPort(index, 'name', e.target.value)}
                  style={{ width: 120 }}
                />
                <Select
                  value={port.type}
                  onChange={(value) => updateOutputPort(index, 'type', value)}
                  style={{ width: 100 }}
                >
                  <Option value="string">String</Option>
                  <Option value="number">Number</Option>
                  <Option value="boolean">Boolean</Option>
                  <Option value="object">Object</Option>
                  <Option value="array">Array</Option>
                </Select>
                {outputPorts.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeOutputPort(index)}
                  />
                )}
              </Space>
            </Card>
          ))}
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addOutputPort}
            block
          >
            Add Output Port
          </Button>
        </Space>

        <Divider>Code</Divider>
        <Form.Item
          name="code"
          label="JavaScript Code"
          rules={[{ required: true, message: 'Please enter the node code' }]}
        >
          <TextArea
            rows={12}
            placeholder="Write your JavaScript code here..."
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>

        <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
          <strong>Available variables:</strong><br />
          • <code>inputs</code> - Object with input port values<br />
          • <code>outputs</code> - Object to set output port values<br />
          • <code>context</code> - Utilities (console, JSON, Math, etc.)
        </div>
      </Form>
    </Modal>
  );
};

export default CustomNodeModal;
