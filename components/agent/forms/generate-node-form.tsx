import React, { useState, useEffect, useMemo } from "react"; // Import useMemo
import { Form, Input, Select, Spin, Typography, Space, Collapse } from "antd";
import { FileTextOutlined, UserOutlined } from "@ant-design/icons";
import { MentionsInput, Mention, SuggestionDataItem } from 'react-mentions';
import { FlowNode, } from "../../../types/flowTypes"; // Import Edge type
import BaseNodeForm from "./base-node-form";
import { fetchAllLLMProviders } from "../../../services/llmService";
import { usePredecessorNodes } from "../hooks/usePredecessorNodes";
import RoleSelector from "./shared/RoleSelector";

const { Text } = Typography;
const { Panel } = Collapse;

// Basic styling to integrate better with Ant Design
const mentionsInputStyle = {
  control: {
    backgroundColor: '#fff',
    fontSize: 14,
    lineHeight: 1.5715,
    border: '1px solid #d9d9d9',
    borderRadius: '2px',
    minHeight: 150, // Match TextArea rows={10} roughly
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
      outline: 'none', // Remove focus outline
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
        backgroundColor: '#e6f7ff', // Ant Design primary color with low opacity
        color: '#1890ff', // Ant Design primary color
      },
    },
  },
};

// Custom style for suggestion items
const mentionItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

interface GenerateNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const GenerateNodeForm: React.FC<GenerateNodeFormProps> = (props) => {
  const { selectedNode } = props;

  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<{ id: string, name: string, displayName: string, providerId: string }[]>([]);
  const [providers, setProviders] = useState<{ id: string, name: string, models: any[] }[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Use our new hook to get variables
  const { predecessorVariables } = usePredecessorNodes(selectedNode.id);

  // Use predecessor variables directly
  const allVariables: {
    id: string;
    display: string;
  }[] = useMemo(() => [...predecessorVariables], [predecessorVariables]);
  console.log(allVariables);

  useEffect(() => {
    const loadModels = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch providers with their models
        const providersData = await fetchAllLLMProviders();
        setProviders(providersData);

        // Collect all chat models from all providers
        const allModels = providersData.flatMap(provider =>
          (provider.models || [])
            .filter(model => model.modelType === 'chat' && model.isActive)
            .map(model => ({
              id: model.id,
              name: model.name,
              displayName: model.displayName || model.name,
              providerId: provider.id,
              providerName: provider.name
            }))
        );

        setModels(allModels);
      } catch (err) {
        console.error("Failed to load models:", err);
        setError("Failed to load available models. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  // Group models by provider for better organization
  const groupedModels = providers.map(provider => {
    const providerModels = models.filter(model => model.providerId === provider.id);
    return {
      provider,
      models: providerModels
    };
  }).filter(group => group.models.length > 0);

  return (
    <BaseNodeForm {...props}>
      <Form.Item
        name="model"
        label="Model"
        extra="Select the AI model to use for text generation"
        rules={[{ required: true, message: 'Please select a model' }]}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Spin tip="Loading available models..." />
          </div>
        ) : error ? (
          <div style={{ color: 'red' }}>
            <Text type="danger">{error}</Text>
          </div>
        ) : (
          <Select
            placeholder="Select a model"
            showSearch
            optionFilterProp="children"
            loading={loading}
          >
            {groupedModels.map(group => (
              <Select.OptGroup key={group.provider.id} label={group.provider.name}>
                {group.models.map(model => (
                  <Select.Option key={model.id} value={model.id}>
                    {model.displayName}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            ))}
            {models.length === 0 && !loading && !error && (
              <Select.Option disabled value="no-models">
                No models available
              </Select.Option>
            )}
          </Select>
        )}
      </Form.Item>

      <RoleSelector />

      <Collapse
        defaultActiveKey={['prompt', 'output']}
        bordered={false}
        expandIconPosition="end"
      >
        <Panel
          header={
            <Space>
              <FileTextOutlined />
              <span>Prompt Template</span>
            </Space>
          }
          key="prompt"
        >
          <Form.Item
            name="prompt"
            // No label needed as it's in the Panel header
            rules={[{ required: true, message: 'Please enter a prompt template' }]}
            // Use getValueFromEvent to correctly handle MentionsInput onChange
            getValueFromEvent={(event) => event.target.value}
          >
            <MentionsInput
              style={mentionsInputStyle} // Apply custom styles
              placeholder="Enter prompt template... Use @ to mention variables."
              a11ySuggestionsListLabel={"Suggested variables"}
              allowSpaceInQuery={true} // Allows searching for multi-word variables if needed
              // Control the component value
              onChange={(event, value: string) => props.form.setFieldsValue({ prompt: value })} // Update form on change
            >
              <Mention
                trigger="@" // Use @ to trigger suggestions
                data={allVariables} // Provide the variable data
                markup="{{__id__}}" // Define how the mention is inserted (using Ant Design variable style)
                displayTransform={(id: string) => {
                  // Find the variable with this id to get its display name
                  const variable = allVariables.find(v => v.id === id);
                  return `@${variable ? variable.display : id}`;
                }} // Show display name in mentions
                style={{ backgroundColor: '#e6f7ff' }} // Style for the highlighted mention
                appendSpaceOnAdd={true} // Add a space after inserting a mention
                renderSuggestion={(suggestion: SuggestionDataItem) => (
                  <div style={mentionItemStyle}>
                    <div>
                      <b>{suggestion.display}</b>
                    </div>
                    <div style={{ color: '#8c8c8c', fontSize: '0.85em', marginLeft: '8px' }}>
                      {suggestion.id}
                    </div>
                  </div>
                )}
              />
            </MentionsInput>
          </Form.Item>
          <div style={{ fontSize: '0.9em', color: '#888', marginTop: 8 }}>
            Use <code>@</code> to insert available variables like <code>@userInput</code> or <code>@retrievalResults</code>. They will be converted to <code>{'{{variableName}}'}</code> format.
          </div>
        </Panel>


      </Collapse>
    </BaseNodeForm>
  );
};

export default GenerateNodeForm;
