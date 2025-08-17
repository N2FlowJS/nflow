import { TagsOutlined } from '@ant-design/icons';
import { FlowNode, KeywordsForm } from '../../../models/flowTypes';
import { fetchAllLLMProviders } from '../../../services/llmService';
import { Collapse, Form, InputNumber, Select, Slider, Space, Spin, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { Mention, MentionsInput, SuggestionDataItem } from 'react-mentions';
import { usePredecessorNodes } from '@n2flowjs/flow/share/usePredecessorNodes';
import BaseNodeForm from '../../../packages/@flow/form';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import { FormInstance } from 'antd/lib';
import { useLocale } from '../../../locale';

const { Text } = Typography;

// Basic styling to integrate better with Ant Design
const mentionsInputStyle = {
  control: {
    backgroundColor: '#fff',
    fontSize: 14,
    lineHeight: 1.5715,
    border: '1px solid #d9d9d9',
    borderRadius: '2px',
    minHeight: 150,
  },
  '&multiLine': {
    control: {
      fontFamily: 'inherit',
    },
    highlighter: {
      padding: '9px 11px',
      border: '1px solid transparent',
    },
    input: {
      padding: '9px 11px',
      outline: 'none',
    },
  },
  suggestions: {
    list: {
      backgroundColor: 'white',
      border: '1px solid #d9d9d9',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      fontSize: 14,
      maxHeight: 250,
      overflowY: 'auto' as const,
      marginTop: '8px',
      zIndex: 1050,
    },
    item: {
      padding: '8px 12px',
      transition: 'background-color 0.3s',
      cursor: 'pointer',
      '&focused': {
        backgroundColor: '#e6f7ff',
        color: '#1890ff',
      },
    },
  },
};

const mentionItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

interface KeywordsNodeFormProps {
  form: FormInstance<KeywordsForm>;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const KeywordsNodeForm: React.FC<KeywordsNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('form.nodeForm');

  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<{ id: string; name: string; providerId: string }[]>([]);
  const [providers, setProviders] = useState<{ id: string; providerType: string; models: unknown[] }[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Use our hook to get variables
  const { predecessorVariables } = usePredecessorNodes(selectedNode.id);

  // Use predecessor variables directly
  const allVariables: {
    id: string;
    display: string;
  }[] = useMemo(() => [...predecessorVariables], [predecessorVariables]);

  const loadModels = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const providersData = await fetchAllLLMProviders();
      setProviders(providersData);

      const allModels = providersData.flatMap((provider) =>
        (provider.models || [])
          .filter((model) => model.modelType === 'chat')
          .map((model) => ({
            id: model.id,
            name: model.name,
            providerId: provider.id,
            providerName: provider.providerType,
          }))
      );

      setModels(allModels);
    } catch (err) {
      console.error('Failed to load models:', err);
      setError(t('modelsError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Group models by provider for better organization
  const groupedModels = providers
    .map((provider) => {
      const providerModels = models.filter((model) => model.providerId === provider.id);
      return {
        provider,
        models: providerModels,
      };
    })
    .filter((group) => group.models.length > 0);

  return (
    <BaseNodeForm {...props}>
      <Form.Item
        name="model"
        label={t('modelLabel')}
        extra={t('modelExtraKeywords')}
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

      <Form.Item name="maxResults" label={t('maxKeywordsLabel')} rules={[{ required: true }]}>
        <Form.Item shouldUpdate>
          {({ getFieldValue, setFieldsValue }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Slider
                min={1}
                max={50}
                style={{ flex: 1 }}
                value={getFieldValue('maxResults')}
                onChange={(value) => setFieldsValue({ maxResults: value })}
                marks={{ 1: '1', 25: '25', 50: '50' }}
              />
              <InputNumber
                min={1}
                max={50}
                value={getFieldValue('maxResults')}
                onChange={(value) => setFieldsValue({ maxResults: value })}
                style={{ width: 70 }}
              />
            </div>
          )}
        </Form.Item>
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
                onChange={(value) => setFieldsValue({ numberHistory: value })}
                marks={{ 1: '1', 25: '25', 50: '50' }}
              />
              <InputNumber
                min={1}
                max={50}
                value={getFieldValue('numberHistory')}
                onChange={(value) => setFieldsValue({ numberHistory: value })}
                style={{ width: 70 }}
              />
            </div>
          )}
        </Form.Item>
      </Form.Item>

      <RoleSelector />

      <Collapse
        defaultActiveKey={['prompt']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'prompt',
            label: (
              <Space>
                <TagsOutlined />
                <span>{t('keywordsPromptLabel')}</span>
              </Space>
            ),
            children: (
              <>
                <Form.Item
                  name="prompt"
                  rules={[{ required: true, message: t('keywordsPromptRequired') }]}
                  getValueFromEvent={(event) => event.target.value}>
                  <MentionsInput
                    style={mentionsInputStyle}
                    placeholder={t('keywordsPromptPlaceholder')}
                    a11ySuggestionsListLabel={'Suggested variables'}
                    allowSpaceInQuery={true}
                    onChange={(event: unknown, value: string) => {
                      console.log(event);
                      props.form.setFieldsValue({ prompt: value });
                    }}>
                    <Mention
                      trigger="@"
                      data={allVariables}
                      markup="{{__id__}}"
                      displayTransform={(id: string) => {
                        const variable = allVariables.find((v) => v.id === id);
                        return `@${variable ? variable.display : id}`;
                      }}
                      style={{ backgroundColor: '#f6ffed' }}
                      appendSpaceOnAdd={true}
                      renderSuggestion={(suggestion: SuggestionDataItem) => (
                        <div style={mentionItemStyle}>
                          <div>
                            <b>{suggestion.display}</b>
                          </div>
                          <div style={{ color: '#8c8c8c', fontSize: '0.85em', marginLeft: '8px' }}>{suggestion.id}</div>
                        </div>
                      )}
                    />
                  </MentionsInput>
                </Form.Item>
                <div style={{ fontSize: '0.9em', color: '#888', marginTop: 8 }}>{t('variablesHelpTextKeywords')}</div>
              </>
            ),
          },
        ]}
      />

      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default KeywordsNodeForm;
