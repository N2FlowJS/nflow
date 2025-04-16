import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Switch,
  Button,
  Card,
  Typography,
  message,
  InputNumber,
  Spin
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { 
  CreateLLMModelRequest, 
  UpdateLLMModelRequest, 
  LLMModelType, 
  LLMModel,
  LLMProvider 
} from '../../types/llm';
import { fetchAllLLMProviders } from '../../services/llmService';
import { fetchTeamLLMProviders } from '@services/teamService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface LLMModelFormProps {
  initialValues?: Partial<LLMModel>;
  providerType?: string;
  providerId?: string;
  onSubmit: (values: CreateLLMModelRequest | UpdateLLMModelRequest) => Promise<void>;
  isLoading?: boolean;
  teamContext?: string; // Optional team ID for team-specific providers
}

const LLMModelForm: React.FC<LLMModelFormProps> = ({ 
  initialValues, 
  providerId,
  onSubmit,
  isLoading = false,
  teamContext
}) => {
  const [form] = Form.useForm();
  const isEdit = !!initialValues?.id;
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoadingProviders(true);
      try {
        let providersData;
        if (teamContext) {
          // If we have a team context, we should fetch team-specific providers
          // This requires importing the team service and using fetchTeamLLMProviders
          providersData = await fetchTeamLLMProviders(teamContext);
        } else {
          // Fetch all available providers
          providersData = await fetchAllLLMProviders();
        }
        setProviders(providersData || []);
      } catch (error) {
        console.error('Failed to fetch providers:', error);
        message.error('Failed to load LLM providers');
      } finally {
        setLoadingProviders(false);
      }
    };

    fetchProviders();
  }, [teamContext]);

  const modelTypes: { label: string, value: LLMModelType }[] = [
    { label: 'Chat Completion', value: 'chat' },
    { label: 'Text Completion', value: 'text' },
    { label: 'Embedding', value: 'embedding' },
    { label: 'Image Generation', value: 'image' }
  ];

  const handleFinish = async (values: any) => {
    try {
      // If providerId is passed as prop, use it
      if (providerId && !values.providerId) {
        values.providerId = providerId;
      }
      
      await onSubmit(values);
      message.success(`Model ${isEdit ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Model form error:', error);
      message.error(`Failed to ${isEdit ? 'update' : 'create'} model`);
    }
  };

  return (
    <Card>
      <Title level={4}>{isEdit ? 'Edit Model' : 'Add New LLM Model'}</Title>
      
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isActive: true,
          isDefault: false,
          modelType: 'chat',
          ...initialValues,
          // If providerId is supplied as prop, override initialValues
          ...(providerId ? { providerId } : {})
        }}
        onFinish={handleFinish}
      >
        <Form.Item
          name="name"
          label="Model Name"
          rules={[{ required: true, message: 'Please enter model name' }]}
          tooltip="The actual model identifier used in API calls (e.g., gpt-4, claude-2)"
        >
          <Input placeholder="e.g., gpt-4, gpt-3.5-turbo, claude-2" />
        </Form.Item>

        <Form.Item
          name="displayName"
          label="Display Name"
          tooltip="A user-friendly name to display in the UI"
        >
          <Input placeholder="e.g., GPT-4, Claude 2" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea rows={2} placeholder="Optional description of this model's capabilities" />
        </Form.Item>

        <Form.Item
          name="modelType"
          label="Model Type"
          rules={[{ required: true, message: 'Please select model type' }]}
        >
          <Select placeholder="Select model type">
            {modelTypes.map(type => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {!providerId && (
          <Form.Item
            name="providerId"
            label="Provider"
            rules={[{ required: true, message: 'Please select a provider' }]}
          >
            <Select 
              placeholder="Select provider"
              loading={loadingProviders}
              notFoundContent={loadingProviders ? <Spin size="small" /> : 'No providers found'}
            >
              {providers.map(provider => (
                <Option key={provider.id} value={provider.id}>
                  {provider.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        <Form.Item
          name="contextWindow"
          label="Context Window Size"
          tooltip="Maximum number of tokens this model can process"
        >
          <InputNumber 
            min={0} 
            step={1024}
            placeholder="e.g., 8192, 16384"
            style={{ width: '100%' }} 
          />
        </Form.Item>

        <Form.Item name="isActive" valuePropName="checked">
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" /> 
          <Text style={{ marginLeft: 8 }}>Enable this model</Text>
        </Form.Item>

        <Form.Item name="isDefault" valuePropName="checked">
          <Switch checkedChildren="Default" unCheckedChildren="Not Default" />
          <Text style={{ marginLeft: 8 }}>Set as default model for this type</Text>
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isLoading}
            icon={<SaveOutlined />}
          >
            {isEdit ? 'Update Model' : 'Add Model'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default LLMModelForm;
