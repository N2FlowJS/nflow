import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  Switch,
  Button,
  Card,
  Typography,
  message,
  Space,
  Alert
} from 'antd';
import { SaveOutlined, ApiOutlined } from '@ant-design/icons';
import { CreateLLMProviderRequest, UpdateLLMProviderRequest, LLMProviderType, LLMProvider } from '../../types/llm';
import { testLLMProvider } from '../../services/llmService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface LLMProviderFormProps {
  initialValues?: Partial<LLMProvider>;
  onSubmit: (values: CreateLLMProviderRequest | UpdateLLMProviderRequest) => Promise<void>;
  isLoading?: boolean;
  teamContext?: string;  // Optional team ID if in team context
  userContext?: string;  // Optional user ID if in user context
}

const LLMProviderForm: React.FC<LLMProviderFormProps> = ({ 
  initialValues, 
  onSubmit,
  isLoading = false,
  teamContext,
  userContext
}) => {
  const [form] = Form.useForm();
  const [isTesting, setIsTesting] = useState(false);
  const isEdit = !!initialValues?.id;

  const providerTypes: { label: string, value: LLMProviderType }[] = [
    { label: 'OpenAI', value: 'openai' },
    { label: 'Custom OpenAI Compatible', value: 'openai-compatible' }
  ];

  const handleTest = async () => {
    try {
      setIsTesting(true);
      
      const formValues = form.getFieldsValue();
      const testMessage = "Hello, this is a test message. Please respond with a short greeting.";
      
      const testData = {
        providerId: initialValues?.id || '',
        message: testMessage
      };

      // If we're creating a new provider (no ID yet), use the form values
      // to directly make the API call for testing
      if (!isEdit) {
        message.info('Please save the provider first before testing');
        setIsTesting(false);
        return;
      }
      
      const result = await testLLMProvider(testData);
      
      if (result.success) {
        message.success('Provider connection test successful!');
      } else {
        message.error(`Test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Provider test error:', error);
      message.error('Failed to test provider connection');
    } finally {
      setIsTesting(false);
    }
  };

  const handleFinish = async (values: any) => {
    try {
      await onSubmit(values);
      message.success(`Provider ${isEdit ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Provider form error:', error);
      message.error(`Failed to ${isEdit ? 'update' : 'create'} provider`);
    }
  };

  return (
    <Card>
      <Title level={4}>
        {isEdit ? 'Edit Provider' : userContext ? 'Add Personal LLM Provider' : teamContext ? 'Add Team LLM Provider' : 'Add New LLM Provider'}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues || {
          isActive: true,
          isDefault: false,
          providerType: 'openai',
          endpointUrl: 'https://api.openai.com/v1'
        }}
        onFinish={handleFinish}
      >
        <Form.Item
          name="name"
          label="Provider Name"
          rules={[{ required: true, message: 'Please enter provider name' }]}
        >
          <Input placeholder="e.g., OpenAI, Azure, Local LLM" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea rows={2} placeholder="Optional description of this provider" />
        </Form.Item>

        <Form.Item
          name="providerType"
          label="Provider Type"
          rules={[{ required: true, message: 'Please select provider type' }]}
        >
          <Select placeholder="Select provider type">
            {providerTypes.map(type => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="endpointUrl"
          label="API Endpoint URL"
          rules={[{ required: true, message: 'Please enter API endpoint URL' }]}
        >
          <Input placeholder="https://api.example.com/v1" />
        </Form.Item>

        <Form.Item
          name="apiKey"
          label="API Key"
          extra={isEdit ? "Leave blank to keep the current API key" : ""}
        >
          <Input.Password placeholder={isEdit ? "••••••••" : "Enter API key"} />
        </Form.Item>

        <Form.Item name="isActive" valuePropName="checked">
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" /> 
          <Text style={{ marginLeft: 8 }}>Enable this provider</Text>
        </Form.Item>

        <Form.Item name="isDefault" valuePropName="checked">
          <Switch checkedChildren="Default" unCheckedChildren="Not Default" />
          <Text style={{ marginLeft: 8 }}>Set as default provider</Text>
        </Form.Item>

        {/* Hide ownership settings if in team or user context */}
        {!teamContext && !userContext && !isEdit && (
          <Alert
            message="Provider Access"
            description="This LLM provider will be private to your account. Team admins can add providers accessible to all team members."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        {teamContext && (
          <Alert
            message="Team Provider"
            description="This LLM provider will be accessible by all members of this team."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        {userContext && (
          <Alert
            message="Personal Provider"
            description="This LLM provider will be private to your account."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading}
              icon={<SaveOutlined />}
            >
              {isEdit ? 'Update Provider' : 'Add Provider'}
            </Button>
            
            {isEdit && (
              <Button 
                onClick={handleTest} 
                loading={isTesting}
                icon={<ApiOutlined />}
              >
                Test Connection
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default LLMProviderForm;
