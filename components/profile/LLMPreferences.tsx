import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Select, 
  Form, 
  Button, 
  Row, 
  Col, 
  Divider, 
  Spin, 
  Empty, 
  Tabs, 
  message, 
  Tooltip,
  Space,
  Alert,
  Modal,
  Input
} from 'antd';
import { 
  SaveOutlined, 
  ApiOutlined, 
  SettingOutlined, 
  RobotOutlined,
  QuestionCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { 
  fetchAllLLMProviders, 
  createDefaultLLMProvider 
} from '../../services/llmService';
import { updateUserPreferences, getUserPreferences } from '../../services/userService';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option, OptGroup } = Select;

interface LLMPreferencesProps {
  userId: string;
}

export default function LLMPreferences({ userId }: LLMPreferencesProps) {
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [creatingProvider, setCreatingProvider] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch providers with models
        const providersData = await fetchAllLLMProviders();
        setProviders(providersData);
        
        // Fetch user preferences
        const userPrefs = await getUserPreferences(userId);
        setPreferences(userPrefs);
        
        // Initialize form with user preferences
        form.setFieldsValue({
          defaultProviderId: userPrefs?.defaultLLMProviderId,
          modelPreferences: {
            chat: userPrefs?.llmPreferences?.models?.chat,
            text: userPrefs?.llmPreferences?.models?.text,
            embedding: userPrefs?.llmPreferences?.models?.embedding,
            image: userPrefs?.llmPreferences?.models?.image,
          }
        });
      } catch (error) {
        console.error("Error fetching LLM data:", error);
        message.error("Failed to load LLM preferences");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId, form]);

  const handleSavePreferences = async (values: any) => {
    try {
      setSaveLoading(true);
      
      // Prepare data for API
      const updateData = {
        defaultLLMProviderId: values.defaultProviderId,
        llmPreferences: {
          models: values.modelPreferences
        }
      };
      
      // Send update request
      await updateUserPreferences(userId, updateData);
      message.success("LLM preferences saved successfully");
    } catch (error) {
      console.error("Error saving preferences:", error);
      message.error("Failed to save LLM preferences");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCreateDefaultProvider = async () => {
    if (!apiKey.trim()) {
      message.error("API key is required");
      return;
    }

    try {
      setCreatingProvider(true);
      const result = await createDefaultLLMProvider({
        apiKey: apiKey.trim(),
        ownerType: 'user' // Default to user-owned
      });
      
      message.success(`Default OpenAI provider created with ${result.modelsCreated} models`);
      setCreateModalVisible(false);
      
      // Refresh providers list
      const providersData = await fetchAllLLMProviders();
      setProviders(providersData);
      
    } catch (error) {
      console.error("Error creating default provider:", error);
      message.error("Failed to create default provider");
    } finally {
      setCreatingProvider(false);
    }
  };

  // Get all active models grouped by provider and type
  const getModelsOptions = (modelType: string) => {
    return providers
      .filter(provider => provider.isActive)
      .map(provider => {
        const models = provider.models.filter(
          (model: any) => model.modelType === modelType && model.isActive
        );
        
        if (models.length === 0) return null;
        
        // Add ownership information to the group label
        let providerLabel = provider.name;
        
        // Add ownership information
        if (provider.ownerType === 'team' && provider.teamOwner) {
          providerLabel += ` (Team: ${provider.teamOwner.name})`;
        } else if (provider.ownerType === 'user' && provider.userOwner) {
          providerLabel += ` (Personal)`;
        } else if (provider.ownerType === 'system') {
          providerLabel += ` (System)`;
        }
        
        return (
          <OptGroup key={provider.id} label={providerLabel}>
            {models.map((model: any) => (
              <Option 
                key={model.id} 
                value={model.id}
                title={model.description}
              >
                {model.displayName || model.name}
                {model.isDefault && ' (Default)'}
              </Option>
            ))}
          </OptGroup>
        );
      })
      .filter(Boolean);
  };

  // Find default model for a type
  const findDefaultModel = (modelType: string): string | undefined => {
    for (const provider of providers) {
      const defaultModel = provider.models?.find(
        (model: any) => model.modelType === modelType && model.isDefault
      );
      if (defaultModel) return defaultModel.id;
    }
    return undefined;
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading LLM preferences...</div>
        </div>
      </Card>
    );
  }

  if (providers.length === 0) {
    return (
      <Card>
        <Empty
          description={
            <span>
              No LLM providers configured in the system.
            </span>
          }
        />
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Create Default OpenAI Provider
          </Button>

          <Modal
            title="Create Default OpenAI Provider"
            visible={createModalVisible}
            onOk={handleCreateDefaultProvider}
            onCancel={() => setCreateModalVisible(false)}
            okText="Create"
            confirmLoading={creatingProvider}
          >
            <Paragraph>
              This will create a default OpenAI provider with standard models.
              You'll need to provide your OpenAI API key.
            </Paragraph>
            
            <Form layout="vertical">
              <Form.Item 
                label="OpenAI API Key" 
                required
                tooltip="You can get this from platform.openai.com/api-keys"
              >
                <Input.Password 
                  placeholder="Enter your OpenAI API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Title level={4}>
        <ApiOutlined /> LLM Preferences
      </Title>
      
      <Paragraph>
        Configure your default AI providers and models for different types of operations.
        Your selections will be used when no specific model is requested.
      </Paragraph>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSavePreferences}
        initialValues={{
          defaultProviderId: preferences?.defaultLLMProviderId || undefined,
          modelPreferences: {
            chat: preferences?.llmPreferences?.models?.chat || findDefaultModel('chat'),
            text: preferences?.llmPreferences?.models?.text || findDefaultModel('text'),
            embedding: preferences?.llmPreferences?.models?.embedding || findDefaultModel('embedding'),
            image: preferences?.llmPreferences?.models?.image || findDefaultModel('image'),
          }
        }}
      >
        <Tabs defaultActiveKey="general">
          <TabPane 
            tab={<span><SettingOutlined /> General</span>}
            key="general"
          >
            <Alert
              message="Default LLM Provider"
              description="Select which LLM provider to use by default for your AI tasks."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            
            <Form.Item 
              name="defaultProviderId" 
              label="Default LLM Provider"
              tooltip="The provider used when no specific provider is requested"
            >
              <Select
                placeholder="Select default provider"
                style={{ width: '100%' }}
                allowClear
              >
                {providers
                  .filter((provider: any) => provider.isActive)
                  .map((provider: any) => (
                    <Option 
                      key={provider.id} 
                      value={provider.id}
                    >
                      {provider.name}
                      {provider.isDefault && ' (System Default)'}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </TabPane>
          
          <TabPane 
            tab={<span><RobotOutlined /> Models</span>}
            key="models"
          >
            <Alert
              message="Default Models by Type"
              description="Configure which models to use by default for different AI tasks."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name={['modelPreferences', 'chat']}
                  label={
                    <Space>
                      Chat Model
                      <Tooltip title="Used for conversations and chat completions">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                >
                  <Select
                    placeholder="Select default chat model"
                    style={{ width: '100%' }}
                    allowClear
                  >
                    {getModelsOptions('chat')}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name={['modelPreferences', 'text']}
                  label={
                    <Space>
                      Text Model
                      <Tooltip title="Used for text completion tasks">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                >
                  <Select
                    placeholder="Select default text model"
                    style={{ width: '100%' }}
                    allowClear
                  >
                    {getModelsOptions('text')}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name={['modelPreferences', 'embedding']}
                  label={
                    <Space>
                      Embedding Model
                      <Tooltip title="Used for creating vector representations of text">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                >
                  <Select
                    placeholder="Select default embedding model"
                    style={{ width: '100%' }}
                    allowClear
                  >
                    {getModelsOptions('embedding')}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name={['modelPreferences', 'image']}
                  label={
                    <Space>
                      Image Model
                      <Tooltip title="Used for image generation">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                >
                  <Select
                    placeholder="Select default image model"
                    style={{ width: '100%' }}
                    allowClear
                  >
                    {getModelsOptions('image')}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
        
        <Divider />
        
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<SaveOutlined />}
            loading={saveLoading}
          >
            Save Preferences
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
