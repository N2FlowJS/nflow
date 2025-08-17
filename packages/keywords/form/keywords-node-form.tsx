import { TagsOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
// import { fetchAllLLMProviders } from '../../../services/llmService'; // replaced by hook
import { Collapse, Form, InputNumber, Select, Slider, Space, Spin, Typography } from 'antd';
import React, { useMemo } from 'react';
import { Mention, MentionsInput, SuggestionDataItem } from 'react-mentions';
import { usePredecessorNodes } from '@n2flowjs/flow/share/usePredecessorNodes';
import BaseNodeForm from '../../@flow/form';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import { FormInstance } from 'antd/lib';
import { useLocale } from '../../../locale';
import { useLLMChatModels } from '../../../hooks/useLLMChatModels';
import { KeywordsForm } from '../types';

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

const KeywordsNodeFormComponent: React.FC<KeywordsNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('form.nodeForm');

  const { groupedModels, models, loading, error } = useLLMChatModels();

  // Use our hook to get variables
  const { predecessorVariables } = usePredecessorNodes(selectedNode.id);

  // Use predecessor variables directly
  const allVariables: {
    id: string;
    display: string;
  }[] = useMemo(() => [...predecessorVariables], [predecessorVariables]);

  // groupedModels provided by hook

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
        onChange={(value) => { if (getFieldValue('maxResults') !== value) setFieldsValue({ maxResults: value }); }}
                marks={{ 1: '1', 25: '25', 50: '50' }}
              />
              <InputNumber
                min={1}
                max={50}
                value={getFieldValue('maxResults')}
        onChange={(value) => { if (getFieldValue('maxResults') !== value) setFieldsValue({ maxResults: value }); }}
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
        defaultActiveKey={['prompt']}
        bordered={false}
        expandIconPosition="end"
        items={useMemo(() => ([{
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
                  onChange={(_, value: string) => {
                    // Only update if different to avoid loop
                    if (props.form.getFieldValue('prompt') !== value) {
                      props.form.setFieldsValue({ prompt: value });
                    }
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
        }]), [t, allVariables, props.form])}
      />

      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

const KeywordsNodeForm = React.memo(KeywordsNodeFormComponent, (prev, next) => (
  prev.selectedNode.id === next.selectedNode.id && prev.form === next.form && prev.setIsDrawerOpen === next.setIsDrawerOpen
));

export default KeywordsNodeForm;
