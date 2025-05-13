import { ApiOutlined } from '@ant-design/icons';
import { Card, Col, Form, message, Row, Select, Space, Spin, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { IUser } from '../../models/IUser';
import { fetchUserPreferences } from '../../services/userService';

const { Title } = Typography;
const { Option } = Select;

interface DefaultModelsFormProps {
  user?: IUser;
  form: any;
}

const ModelsFormConfig: React.FC<DefaultModelsFormProps> = ({ user, form }) => {
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<any>(null);

  // Fetch user preferences
  const fetchPreferences = React.useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await fetchUserPreferences(user.id);
      setPreferences(data);

      // Set form values based on lmmConfig
      if (data.lmmConfig?.defaultModels) {
        form.setFieldsValue({
          defaultChatModel: data.lmmConfig.defaultModels.chat,
          defaultEmbeddingModel: data.lmmConfig.defaultModels.embedding,
        });
      }
    } catch (error: unknown) {
      console.error('Error fetching LLM preferences:', error);
      message.error('Failed to load default model preferences');
    } finally {
      setLoading(false);
    }
  }, [user, form]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Helper functions for rendering tags
  const getProviderTypeTag = (type: string) => {
    let color = '';
    let icon = null;
    let label = type;

    switch (type) {
      case 'openai':
        color = 'green';
        icon = <ApiOutlined />;
        label = 'OpenAI';
        break;
      case 'openai-compatible':
        color = 'cyan';
        icon = <ApiOutlined />;
        label = 'OpenAI Compatible';
        break;
      default:
        color = 'default';
        break;
    }

    return (
      <Tag color={color} icon={icon}>
        {label}
      </Tag>
    );
  };

  // Get all models of a specific type from all providers
  const getModelsByType = (type: string) => {
    if (!preferences) return [];

    const allProviders = [
      ...(preferences.availableProviders?.systemProviders || []),
      ...(preferences.availableProviders?.userProviders || []),
      ...(preferences.availableProviders?.teamProviders || []),
    ];

    const models = allProviders.flatMap((provider) =>
      (provider.models || [])
        .filter((model: { modelType: string }) => model.modelType === type)
        .map((model: any) => ({
          ...model,
          providerName: provider.name,
          providerType: provider.providerType,
          ownerType: provider.ownerType,
        }))
    );

    return models;
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading model preferences...</div>
        </div>
      </Card>
    );
  }

  const chatModels = getModelsByType('chat');
  const embeddingModels = getModelsByType('embedding');

  return (
    <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Form.Item
            name={['lmmConfig', 'chat']}
            label={<Title level={5}>Default Chat Model</Title>}
            help="Will be used as the default for chat interactions">
            <Select
              placeholder="Select default chat model"
              style={{ width: '100%' }}
              disabled={chatModels.length === 0}
              allowClear>
              {chatModels.map((model) => (
                <Option key={model.id} value={model.id}>
                  <Space>
                    <span>{model.name}</span>
                    <span>
                      {getProviderTypeTag(model.providerType)}
                      <Tag
                        color={model.ownerType === 'system' ? 'gold' : model.ownerType === 'user' ? 'green' : 'blue'}>
                        {model.ownerType === 'system' ? 'System' : model.ownerType === 'user' ? 'Personal' : 'Team'}
                      </Tag>
                    </span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name={['lmmConfig', 'embedding']}
            label={<Title level={5}>Default Embedding Model</Title>}
            help="Will be used as the default for embedding and vector operations">
            <Select
              placeholder="Select default embedding model"
              style={{ width: '100%' }}
              disabled={embeddingModels.length === 0}
              allowClear>
              {embeddingModels.map((model) => (
                <Option key={model.id} value={model.id}>
                  <Space>
                    <span>{model.name}</span>
                    <span>
                      {getProviderTypeTag(model.providerType)}
                      <Tag
                        color={model.ownerType === 'system' ? 'gold' : model.ownerType === 'user' ? 'green' : 'blue'}>
                        {model.ownerType === 'system' ? 'System' : model.ownerType === 'user' ? 'Personal' : 'Team'}
                      </Tag>
                    </span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default ModelsFormConfig;
