/**
 * DYNAMIC FORM GENERATOR
 * 
 * Generic form component that renders based on NodeDefinition.config.
 * Eliminates need for 60+ custom form components.
 * 
 * Features:
 * - Auto-generates form fields from config.properties
 * - Supports string, number, boolean, enum types
 * - TextArea for template variables
 * - Smart field selection based on type
 */

import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Switch, Select, Slider, Row, Col } from 'antd';
import { FlowNode } from '../../../models/flowTypes';
import BaseNodeForm from '../form';
import InputReferences from '../share/InputReferences';
import RoleSelector from '../share/RoleSelector';
import { NodeRegistry } from '../node-registry';

const { TextArea } = Input;
const { Option } = Select;

interface DynamicFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Render field based on property schema
 */
function renderField(
  name: string,
  property: any
): React.ReactNode {
  const label = property.title || property.description || name;
  const required = property.required !== false;
  const help = property.description;

  // Enum/Select field
  if (property.enum && Array.isArray(property.enum)) {
    return (
      <Form.Item
        key={name}
        name={name}
        label={label}
        rules={[{ required }]}
        extra={help}
      >
        <Select placeholder={`Select ${label}`}>
          {property.enum.map((value: string) => (
            <Option key={value} value={value}>
              {value}
            </Option>
          ))}
        </Select>
      </Form.Item>
    );
  }

  // Boolean field
  if (property.type === 'boolean') {
    return (
      <Form.Item
        key={name}
        name={name}
        label={label}
        valuePropName="checked"
        extra={help}
      >
        <Switch />
      </Form.Item>
    );
  }

  // Number field
  if (property.type === 'number' || property.type === 'integer') {
    const min = property.minimum;
    const max = property.maximum;
    const step = property.type === 'integer' ? 1 : property.step || 0.1;

    // Use slider + input for bounded numbers
    if (min !== undefined && max !== undefined && max - min <= 100) {
      return (
        <Form.Item key={name} name={name} label={label} rules={[{ required }]} extra={help}>
          <Row gutter={12}>
            <Col flex="auto">
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue, setFieldsValue }) => (
                  <Slider
                    min={min}
                    max={max}
                    step={step}
                    value={getFieldValue(name)}
                    onChange={(value) => {
                      if (getFieldValue(name) !== value) {
                        const updates: Record<string, any> = {};
                        updates[name] = value;
                        setFieldsValue(updates as any);
                      }
                    }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col style={{ width: 80 }}>
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue, setFieldsValue }) => (
                  <InputNumber
                    min={min}
                    max={max}
                    step={step}
                    value={getFieldValue(name)}
                    onChange={(value) => {
                      if (getFieldValue(name) !== value) {
                        const updates: Record<string, any> = {};
                        updates[name] = value;
                        setFieldsValue(updates as any);
                      }
                    }}
                    style={{ width: '100%' }}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form.Item>
      );
    }

    // Regular number input
    return (
      <Form.Item
        key={name}
        name={name}
        label={label}
        rules={[{ required }]}
        extra={help}
      >
        <InputNumber
          min={min}
          max={max}
          step={step}
          style={{ width: '100%' }}
          placeholder={`Enter ${label}`}
        />
      </Form.Item>
    );
  }

  // Array field (JSON editor)
  if (property.type === 'array') {
    return (
      <Form.Item
        key={name}
        name={name}
        label={label}
        rules={[
          { required },
          {
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              try {
                JSON.parse(value);
                return Promise.resolve();
              } catch {
                return Promise.reject('Invalid JSON array');
              }
            },
          },
        ]}
        extra={help || 'Enter JSON array'}
      >
        <TextArea
          rows={4}
          placeholder='["item1", "item2"]'
        />
      </Form.Item>
    );
  }

  // Object field (JSON editor)
  if (property.type === 'object') {
    return (
      <Form.Item
        key={name}
        name={name}
        label={label}
        rules={[
          { required },
          {
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              try {
                JSON.parse(value);
                return Promise.resolve();
              } catch {
                return Promise.reject('Invalid JSON object');
              }
            },
          },
        ]}
        extra={help || 'Enter JSON object'}
      >
        <TextArea
          rows={4}
          placeholder='{"key": "value"}'
        />
      </Form.Item>
    );
  }

  // Text field with template support (default)
  const isTemplate = name.toLowerCase().includes('prompt') ||
                     name.toLowerCase().includes('template') ||
                     name.toLowerCase().includes('text') ||
                     name.toLowerCase().includes('data') ||
                     name.toLowerCase().includes('content') ||
                     name.toLowerCase().includes('message');

  // Multi-line text field (check multiline property or format)
  if (property.multiline || isTemplate || property.format === 'textarea') {
    const rows = property.rows || 6;
    const placeholder = property.placeholder || `Enter ${label}. Use {variable} for dynamic values.`;
    
    return (
      <Form.Item
        key={name}
        name={name}
        label={label}
        rules={[{ required }]}
        extra={help || 'Use {variable} for template variables'}
      >
        <TextArea
          rows={rows}
          placeholder={placeholder}
        />
      </Form.Item>
    );
  }

  // Regular text input
  return (
    <Form.Item
      key={name}
      name={name}
      label={label}
      rules={[{ required }]}
      extra={help}
    >
      <Input placeholder={`Enter ${label}`} />
    </Form.Item>
  );
}

/**
 * Convert InputPort to property schema for form rendering
 */
function inputPortToProperty(port: any): any {
  const metadata = port.metadata || {};
  const inputType = metadata.inputType || 'text';
  
  const property: any = {
    type: port.type === 'number' ? 'number' : 
          port.type === 'boolean' ? 'boolean' : 'string',
    title: port.name,
    description: port.description,
    required: port.required !== false,
    default: port.defaultValue,
  };

  // Handle select inputs
  if (inputType === 'select' && metadata.options) {
    property.enum = metadata.options;
  }

  // Handle textarea
  if (inputType === 'textarea') {
    property.multiline = true;
    property.rows = metadata.rows || 6;
    property.placeholder = metadata.placeholder;
  }

  // Handle number inputs
  if (inputType === 'number') {
    if (metadata.min !== undefined) property.minimum = metadata.min;
    if (metadata.max !== undefined) property.maximum = metadata.max;
    if (metadata.step !== undefined) property.step = metadata.step;
  }

  return property;
}

/**
 * Dynamic Form Component - NEW PATTERN (InputPort-based)
 * Generates forms from NodeDefinition.inputs with metadata
 */
export const DynamicForm: React.FC<DynamicFormProps> = ({
  form,
  selectedNode,
  setIsDrawerOpen,
}) => {
  const nodeType = selectedNode.data?.type || selectedNode.type;
  const definition = nodeType ? NodeRegistry.get(nodeType) : undefined;

  // Initialize form with default values from InputPorts
  useEffect(() => {
    if (definition?.inputs) {
      const defaults: Record<string, any> = {};
      definition.inputs.forEach((port: any) => {
        const fieldValue = form.getFieldValue(port.id);
        // Only set default if field is undefined or null
        if (port.defaultValue !== undefined && (fieldValue === undefined || fieldValue === null)) {
          defaults[port.id] = port.defaultValue;
        }
      });
      if (Object.keys(defaults).length > 0) {
        form.setFieldsValue(defaults);
      }
    }
  }, [definition, form]);

  // Fallback if definition not found
  if (!definition) {
    return (
      <BaseNodeForm form={form} selectedNode={selectedNode} setIsDrawerOpen={setIsDrawerOpen}>
        <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>
          <p>No definition found for node type: {nodeType}</p>
          <p style={{ fontSize: 12 }}>Please create a definition.ts file for this node.</p>
        </div>
      </BaseNodeForm>
    );
  }

  // Check if node has configuration inputs
  const hasInputs = definition.inputs && definition.inputs.length > 0;
  
  // Fallback if no inputs - this is OK for nodes without config
  if (!hasInputs) {
    return (
      <BaseNodeForm form={form} selectedNode={selectedNode} setIsDrawerOpen={setIsDrawerOpen}>
        <div style={{ padding: 16, textAlign: 'center', color: '#666' }}>
          <p>This node has no configuration options.</p>
        </div>
        <InputReferences form={form} nodeid={selectedNode.id} />
        <RoleSelector />
      </BaseNodeForm>
    );
  }

  // Use InputPort with metadata
  return (
    <BaseNodeForm form={form} selectedNode={selectedNode} setIsDrawerOpen={setIsDrawerOpen}>
      {/* Generate fields from inputs with metadata */}
      {definition.inputs
        .filter((port: any) => !port.metadata?.isDynamic) // Skip dynamic ports
        .map((port: any) => {
          const property = inputPortToProperty(port);
          return renderField(port.id, property);
        })}

      {/* Show template variable references */}
      <InputReferences form={form} nodeid={selectedNode.id} />

      {/* Role selector */}
      <RoleSelector />
    </BaseNodeForm>
  );
};

export default DynamicForm;
