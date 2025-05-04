import { Form, Select, Spin, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { fetchAllLLMProviders } from '../../services/llmService';

const { Text } = Typography;


const KnowledgeModelForm: React.FC = () => {

  const [loadingLLM, setLoadingLLM] = useState(false);
  const [models, setModels] = useState<{ id: string, name: string, providerId: string }[]>([]);
  const [providers, setProviders] = useState<{ id: string, providerType: string, models: unknown[] }[]>([]);
  const [error, setError] = useState<string | null>(null);


  const loadModels = React.useCallback(async () => {
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
  }, []);
  useEffect(() => {


    loadModels();
  }, [loadModels]);

  return (
    <>
      <Form.Item
        name={'modelId'}
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
            {providers.map(provider => {
              const providerModels = models.filter(model => model.providerId === provider.id);
              return {
                provider,
                models: providerModels
              };
            }).filter(group => group.models.length > 0).map(group => (
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
    </>
  );
};

export default KnowledgeModelForm;
