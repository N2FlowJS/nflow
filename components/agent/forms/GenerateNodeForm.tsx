import React, { useState, useEffect } from "react";
import { Form, Input, Select, Spin, Typography, Space, Collapse } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { FlowNode } from "../types/flowTypes";
import BaseNodeForm from "./BaseNodeForm";
import { fetchAllLLMProviders } from "../../../services/llmService";

const { Text } = Typography;
const { Panel } = Collapse;

interface GenerateNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const GenerateNodeForm: React.FC<GenerateNodeFormProps> = (props) => {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<{id: string, name: string, displayName: string, providerId: string}[]>([]);
  const [providers, setProviders] = useState<{id: string, name: string, models: any[]}[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [outputVarName, setOutputVarName] = useState(
    props.form?.getFieldValue('outputVariable') || 'generatedText'
  );
  
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
            extra="Use {{variables}} to reference values from flow"
            rules={[{ required: true, message: 'Please enter a prompt template' }]}
            noStyle
          >
            <Input.TextArea rows={10} placeholder="Enter prompt template..." />
          </Form.Item>
          <div style={{ fontSize: '0.9em', color: '#888', marginTop: 8 }}>
            You can use system variables like <code>{'{{userInput}}'}</code> or <code>{'{{retrievalResults}}'}</code> in your prompt.
          </div>
        </Panel>
        
        <Panel 
          header={
            <Space>
              <span>Output Configuration</span>
            </Space>
          } 
          key="output"
        >
          <Form.Item 
            name="outputVariable" 
            label="Output Variable Name"
            extra="This variable will store the generated text for use in subsequent nodes"
            initialValue={outputVarName}
          >
            <Input 
              placeholder="Variable name (e.g., generatedText)" 
              value={outputVarName}
              onChange={(e) => setOutputVarName(e.target.value)}
              addonBefore="$"
            />
          </Form.Item>
        </Panel>
      </Collapse>
    </BaseNodeForm>
  );
};

export default GenerateNodeForm;
