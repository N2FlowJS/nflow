import { FlowNode } from '../../../models/flowTypes';
import React from 'react';
import { Form, Input, Select, InputNumber, Switch, Collapse, Typography, Tag } from 'antd';
import BaseNodeForm from '../../@flow/form';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';
import { getInputFromTemplate } from '@n2flowjs/template/template';

const { TextArea } = Input;
const { Text } = Typography;

interface HttpRequestNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Helper to get variable type color
const getVariableColor = (): string => {
  return 'blue'; // All template variables are TEXT type for HTTP
};

const HttpRequestNodeFormComponent: React.FC<HttpRequestNodeFormProps> = (props) => {
  const { t } = useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <Collapse
        defaultActiveKey={['request', 'advanced']}
        items={[
          {
            key: 'request',
            label: (
              <div style={{ fontWeight: 'bold' }}>
                {t('httpRequestConfig')} / Request Configuration
              </div>
            ),
            children: (
              <>
                {/* HTTP Method */}
                <Form.Item
                  label="HTTP Method"
                  name="method"
                  initialValue="GET">
                  <Select
                    options={[
                      { label: 'GET', value: 'GET' },
                      { label: 'POST', value: 'POST' },
                      { label: 'PUT', value: 'PUT' },
                      { label: 'PATCH', value: 'PATCH' },
                      { label: 'DELETE', value: 'DELETE' },
                    ]}
                  />
                </Form.Item>

                {/* URL */}
                <Form.Item
                  label="URL"
                  name="url"
                  rules={[{ required: true, message: 'URL is required' }]}>
                  <Input
                    placeholder="https://api.example.com/users/{userId}"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (props.form.getFieldValue('url') !== value) {
                        props.form.setFieldsValue({ url: value });
                      }
                    }}
                  />
                </Form.Item>

                {/* URL Variables Preview */}
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue }) => {
                    const url = getFieldValue('url') || '';
                    const variables = getInputFromTemplate(url);
                    
                    if (variables.length === 0) return null;
                    
                    return (
                      <div style={{ marginTop: -16, marginBottom: 16, padding: '8px 12px', background: '#f5f5f5', borderRadius: 4 }}>
                        <Text type="secondary" style={{ fontSize: '0.9em' }}>
                          URL variables ({variables.length}):
                        </Text>
                        <div style={{ marginTop: 8 }}>
                          {variables.map(v => (
                            <Tag key={v} color={getVariableColor()} style={{ marginBottom: 4 }}>
                              {v}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    );
                  }}
                </Form.Item>

                {/* Request Body */}
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue }) => {
                    const method = getFieldValue('method') || 'GET';
                    
                    // Only show body for POST, PUT, PATCH
                    if (!['POST', 'PUT', 'PATCH'].includes(method)) {
                      return null;
                    }
                    
                    return (
                      <>
                        <Form.Item
                          label="Request Body"
                          name="body">
                          <TextArea
                            rows={8}
                            placeholder='{"name": "{userName}", "age": {userAge}}'
                            onChange={(e) => {
                              const value = e.target.value;
                              if (props.form.getFieldValue('body') !== value) {
                                props.form.setFieldsValue({ body: value });
                              }
                            }}
                          />
                        </Form.Item>

                        {/* Body Variables Preview */}
                        <Form.Item shouldUpdate noStyle>
                          {({ getFieldValue: gfv }) => {
                            const body = gfv('body') || '';
                            const variables = getInputFromTemplate(body);
                            
                            if (variables.length === 0) return null;
                            
                            return (
                              <div style={{ marginTop: -16, marginBottom: 16, padding: '8px 12px', background: '#f5f5f5', borderRadius: 4 }}>
                                <Text type="secondary" style={{ fontSize: '0.9em' }}>
                                  Body variables ({variables.length}):
                                </Text>
                                <div style={{ marginTop: 8 }}>
                                  {variables.map(v => (
                                    <Tag key={v} color={getVariableColor()} style={{ marginBottom: 4 }}>
                                      {v}
                                    </Tag>
                                  ))}
                                </div>
                              </div>
                            );
                          }}
                        </Form.Item>
                      </>
                    );
                  }}
                </Form.Item>

                <div style={{ fontSize: '0.9em', color: '#888', marginTop: 8 }}>
                  Use {'{variable}'} syntax for dynamic values in URL and body
                </div>
              </>
            ),
          },
          {
            key: 'headers',
            label: 'Custom Headers (Optional)',
            children: (
              <>
                <div style={{ fontSize: '0.9em', color: '#888', marginBottom: 12 }}>
                  Custom headers support coming soon. Default Content-Type: application/json is automatically added.
                </div>
              </>
            ),
          },
          {
            key: 'advanced',
            label: 'Advanced Settings',
            children: (
              <>
                {/* Timeout */}
                <Form.Item
                  label="Timeout (seconds)"
                  name="timeout"
                  initialValue={30}>
                  <InputNumber
                    min={1}
                    max={300}
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                {/* Follow Redirects */}
                <Form.Item
                  label="Follow Redirects"
                  name="followRedirects"
                  valuePropName="checked"
                  initialValue={true}>
                  <Switch />
                </Form.Item>
              </>
            ),
          },
          {
            key: 'role',
            label: 'Role & Permissions',
            children: <RoleSelector />,
          },
        ]}
      />
    </BaseNodeForm>
  );
};

export default HttpRequestNodeFormComponent;
