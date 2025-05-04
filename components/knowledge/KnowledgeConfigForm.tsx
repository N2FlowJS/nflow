import { Divider, Form, InputNumber, Select, Spin, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import ChunkSeparatorSelect from "./ChunkSeparatorSelect";
import { fetchAllLLMProviders } from '../../services/llmService';

const { Text } = Typography;

interface KnowledgeConfigFormProps {
  form: any;
}

const KnowledgeConfigForm: React.FC<KnowledgeConfigFormProps> = ({
  form,
}) => {

  const [loadingLLM, setLoadingLLM] = useState(false);
    const [models, setModels] = useState<{ id: string, name: string,  providerId: string }[]>([]);
    const [providers, setProviders] = useState<{ id: string, providerType: string, models: unknown[] }[]>([]);
    const [error, setError] = useState<string | null>(null);
  
  
    const loadModels = async () => {
      setLoadingLLM(true);
      setError(null);
      try {
        // Fetch providers with their models
        const providersData = await fetchAllLLMProviders();
  
        setProviders(providersData);
  
        // Collect all chat models from all providers
        const allModels = providersData.flatMap(provider =>
          (provider.models || [])
            .filter(model => model.modelType === 'embedding')
            .map(model => ({
              id: model.id,
              name: model.name,
              providerId: provider.id,
              providerName: provider.providerType
            }))
        );
  
        setModels(allModels);
      } catch (err) {
        console.error("Failed to load models:", err);
        setError("Failed to load available models. Please try again.");
      } finally {
        setLoadingLLM(false);
      }
    };
    useEffect(() => {
  
  
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
    <>
    
    <Form.Item
        name={['config', 'modelId']}
        label="Model"
          extra="Select the AI model to use for text Embedding"
          rules={[{ required: true, message: 'Please select a model' }]}
        >
          {loadingLLM ? (
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
              loading={loadingLLM}
            >
              {groupedModels.map(group => (
                <Select.OptGroup key={group.provider.id} label={group.provider.providerType}>
                  {group.models.map(model => (
                    <Select.Option key={model.id} value={model.id}>
                      {model.name}
                    </Select.Option>
                  ))}
                </Select.OptGroup>
              ))}
              {models.length === 0 && !loadingLLM && !error && (
                <Select.Option disabled value="no-models">
                  No models available
                </Select.Option>
              )}
            </Select>
          )}
        </Form.Item>

      <Form.Item
        name={['config', 'tokenChunk']}
        label="Tokens each chunk"
        tooltip="Maximum number of tokens for each text chunk"
        rules={[{ required: true, message: 'Please enter tokens per chunk' }]}
      >
        <InputNumber
          min={100}
          max={8000}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <ChunkSeparatorSelect
        name={['config', 'chunkSeparator']}
        form={form}
      />

      <Divider />

      <Text type="secondary">
        These settings determine how files are processed. Each file can override these settings
        individually, otherwise they inherit from the Knowledge Base.
      </Text>
    </>
  );
};

export default KnowledgeConfigForm;
