import { FileTextOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Collapse, Form, Input, InputNumber, Select, Slider, Space, Spin, Tag, Typography } from 'antd';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { FormInstance } from 'antd/lib';
import { useLocale } from '../../../locale';
import { useLLMChatModels } from '../../../hooks/useLLMChatModels';
import { GenerateForm } from '../types';
import { parseTemplateVariables } from '../../@template/variable-parser';

const { TextArea } = Input;

const { Text } = Typography;

/**
 * Get color for variable type tag
 */
const getVariableTypeColor = (type: 'string' | 'number' | 'boolean'): string => {
  switch (type) {
    case 'number':
      return 'green';
    case 'boolean':
      return 'orange';
    default:
      return 'blue';
  }
};

interface GenerateNodeFormProps {
  form: FormInstance<GenerateForm>;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const GenerateNodeFormComponent: React.FC<GenerateNodeFormProps> = (props) => {
  const { t } = useLocale('form.nodeForm');

  const { groupedModels, models, loading, error } = useLLMChatModels();

  return (
    <BaseNodeForm {...props}>
      <Form.Item
        name="model"
        label={t('modelLabel')}
        extra={t('modelExtraGenerate')}
        rules={[{ required: true, message: t('modelRequired') }]}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Spin />
            <div style={{ marginTop: 8 }}>{t('loadingModels')}</div>
          </div>
        ) : error ? (
          <div style={{ color: 'red' }}>
            <Text type="danger">{error}</Text>
          </div>
        ) : (
          <Select placeholder={t('modelPlaceholder')} showSearch optionFilterProp="children" loading={loading}>
            {groupedModels.map((group) => (
              <Select.OptGroup key={group.provider.id} label={group.provider.providerType}>
                {group.models.map((model) => (
                  <Select.Option key={model.id} value={model.id}>
                    {model.name}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            ))}
            {models.length === 0 && !loading && !error && (
              <Select.Option disabled value="no-models">
                {t('noModelsAvailable')}
              </Select.Option>
            )}
          </Select>
        )}
      </Form.Item>
  <Form.Item name="numberHistory" label={t('numberHistoryLabel')} rules={[{ required: true }]}>
        <Form.Item shouldUpdate>
      {({ getFieldValue, setFieldsValue }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Slider
                min={1}
                max={50}
                style={{ flex: 1 }}
                value={getFieldValue('numberHistory')}
        onChange={(value) => { if (getFieldValue('numberHistory') !== value) setFieldsValue({ numberHistory: value }); }}
                marks={{ 1: '1', 25: '25', 50: '50' }}
              />
              <InputNumber
                min={1}
                max={50}
                value={getFieldValue('numberHistory')}
        onChange={(value) => { if (getFieldValue('numberHistory') !== value) setFieldsValue({ numberHistory: value }); }}
                style={{ width: 70 }}
              />
            </div>
          )}
        </Form.Item>
      </Form.Item>
      <RoleSelector />

      <Collapse
        defaultActiveKey={['prompt', 'output']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'prompt',
            label: (
              <Space>
                <FileTextOutlined />
                <span>{t('promptLabel')}</span>
              </Space>
            ),
            children: (
              <>
                <Form.Item
                  name="prompt"
                  rules={[{ required: true, message: t('promptRequired') }]}>
                  <TextArea
                    rows={10}
                    placeholder={t('promptPlaceholder') + ' - Use {variable} or {variable:type} for dynamic inputs'}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (props.form.getFieldValue('prompt') !== value) {
                        props.form.setFieldsValue({ prompt: value });
                      }
                    }}
                  />
                </Form.Item>

                {/* Show detected template variables */}
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue }) => {
                    const prompt = getFieldValue('prompt') || '';
                    const variables = parseTemplateVariables(prompt);
                    
                    if (variables.length === 0) {
                      return (
                        <div style={{ fontSize: '0.9em', color: '#888', marginTop: -8, marginBottom: 8 }}>
                          {t('variablesHelpTextGenerate')}
                        </div>
                      );
                    }
                    
                    return (
                      <div style={{ marginTop: -8, marginBottom: 8 }}>
                        <div style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: 4 }}>
                          <Text type="secondary" style={{ fontSize: '0.9em' }}>
                            Detected variables ({variables.length}):
                          </Text>
                          <div style={{ marginTop: 8 }}>
                            {variables.map(v => (
                              <Tag key={v.name} color={getVariableTypeColor(v.type)} style={{ marginBottom: 4 }}>
                                {v.name}: {v.type}
                              </Tag>
                            ))}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.9em', color: '#888', marginTop: 8 }}>
                          {t('variablesHelpTextGenerate')}
                        </div>
                      </div>
                    );
                  }}
                </Form.Item>
              </>
            ),
          },
        ]}
      />
    </BaseNodeForm>
  );
};

const GenerateNodeForm = React.memo(GenerateNodeFormComponent, (prev, next) => (
  prev.selectedNode.id === next.selectedNode.id && prev.form === next.form && prev.setIsDrawerOpen === next.setIsDrawerOpen
));

export default GenerateNodeForm;
