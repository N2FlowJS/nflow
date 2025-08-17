import { EditOutlined, RobotOutlined, SettingOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
// import { fetchAllLLMProviders } from '../../../services/llmService'; // replaced by hook
import { Form, InputNumber, Select, Switch, Collapse, Space, Typography, Alert } from 'antd';
import React, { useMemo } from 'react';
import { Mention, MentionsInput, SuggestionDataItem } from 'react-mentions';
import { usePredecessorNodes } from '@n2flowjs/flow/share/usePredecessorNodes';
import BaseNodeForm from '../../@flow/form';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import { useLocale } from '../../../locale';
import { useLLMChatModels } from '../../../hooks/useLLMChatModels';

const { Text } = Typography;

interface RewriteNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const RewriteNodeFormComponent: React.FC<RewriteNodeFormProps> = (props) => {
  const { selectedNode } = props;
  useLocale('form.nodeForm');
  const { groupedModels, loading, error } = useLLMChatModels();

  const { predecessorVariables } = usePredecessorNodes(selectedNode.id);

  const allVariables: SuggestionDataItem[] = useMemo(() => [
    ...predecessorVariables,
    { id: 'conversation', display: 'conversation' },
    { id: 'userInput', display: 'userInput' },
  ], [predecessorVariables]);

  // Model grouping provided by hook

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Rewrite Node"
        description="Rewrite and improve text using AI models based on conversation history and context."
        type="info"
        showIcon
        icon={<EditOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Form.Item
        name="model"
        label="AI Model"
        extra="Select the AI model to use for rewriting"
        rules={[{ required: true, message: 'Please select an AI model' }]}>
        {loading ? (
          <Select loading placeholder="Loading models..." />
        ) : error ? (
          <Select placeholder="Failed to load models" disabled />
        ) : (
          <Select placeholder="Select an AI model">
            {groupedModels.map((group) => (
              <Select.OptGroup
                key={group.provider.id}
                label={`${group.provider.name} (${group.provider.providerType})`}
              >
                {group.models.map((model) => (
                  <Select.Option key={model.id} value={model.id}>
                    {model.name}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            ))}
          </Select>
        )}
      </Form.Item>

      <Collapse
        defaultActiveKey={['settings', 'prompt']}
        bordered={false}
        expandIconPosition="end"
        items={useMemo(() => ([
          {
            key: 'settings',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Rewrite Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="outputStyle"
                  label="Output Style"
                  help="Choose the style for the rewritten text"
                  initialValue="professional"
                >
                  <Select>
                    <Select.Option value="formal">Formal</Select.Option>
                    <Select.Option value="casual">Casual</Select.Option>
                    <Select.Option value="professional">Professional</Select.Option>
                    <Select.Option value="concise">Concise</Select.Option>
                    <Select.Option value="detailed">Detailed</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="preserveMeaning"
                  label="Preserve Original Meaning"
                  help="Ensure the rewritten text maintains the original intent"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="numberHistory"
                  label="Number of History Messages"
                  help="How many previous messages to consider for context"
                  initialValue={5}
                >
                  <InputNumber
                    min={1}
                    max={20}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'prompt',
            label: (
              <Text strong>
                <RobotOutlined style={{ marginRight: 8 }} />
                Rewrite Prompt
              </Text>
            ),
            children: (
              <Form.Item
                name="prompt"
                label="Custom Prompt"
                help="Define how the AI should rewrite the text. Use {{conversation}} for history and {{userInput}} for current input."
              >
                <MentionsInput
                  value={props.form.getFieldValue('prompt') || ''}
                  onChange={(event) => {
                    const val = (event as any).target?.value ?? '';
                    if (props.form.getFieldValue('prompt') !== val) {
                      props.form.setFieldsValue({ prompt: val });
                    }
                  }}
                  style={{
                    control: {
                      backgroundColor: '#fff',
                      fontSize: 14,
                      fontWeight: 'normal',
                    },
                    '&multiLine': {
                      control: {
                        fontFamily: 'monospace',
                        minHeight: 120,
                      },
                      highlighter: {
                        padding: 9,
                        border: '1px solid transparent',
                      },
                      input: {
                        padding: 9,
                        border: '1px solid #d9d9d9',
                        borderRadius: 6,
                        fontSize: 14,
                        fontFamily: 'monospace',
                      },
                    },
                  }}
                  placeholder="Enter your rewrite prompt..."
                  allowSpaceInQuery
                >
                  <Mention
                    trigger="{{"
                    data={allVariables}
                    style={{
                      backgroundColor: '#f0f0f0',
                      color: '#1890ff',
                      fontWeight: 'bold',
                    }}
                    markup="{{__display__}}"
                  />
                </MentionsInput>
              </Form.Item>
            ),
          },
        ]), [allVariables, props.form])}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

const RewriteNodeForm = React.memo(RewriteNodeFormComponent, (prev, next) => (
  prev.selectedNode.id === next.selectedNode.id && prev.form === next.form && prev.setIsDrawerOpen === next.setIsDrawerOpen
));

export default RewriteNodeForm;
