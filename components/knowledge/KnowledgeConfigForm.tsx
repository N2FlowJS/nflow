import { SettingOutlined } from '@ant-design/icons';
import { Card, Divider, Form, Input, InputNumber, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

interface KnowledgeConfigFormProps {
  form: any;
}



const KnowledgeConfigForm: React.FC<KnowledgeConfigFormProps> = ({
}) => {
  return (
    <Card
      title={
        <div>
          <SettingOutlined /> Chunking Configuration
        </div>
      }
    >
      <Form.Item
        name={['config', 'tokenChunk']}
        label="Tokens Per Chunk"
        tooltip="Maximum number of tokens for each text chunk"
        rules={[{ required: true, message: 'Please enter tokens per chunk' }]}
      >
        <InputNumber
          min={100}
          max={8000}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name={['config', 'chunkSeparator']}
        label="Chunk Separator"
        tooltip="Characters used to divide text into chunks (e.g., '\n\r' for paragraphs)"
        rules={[{ required: true, message: 'Please enter chunk separator' }]}
      >
        <Input />
      </Form.Item>

      <Divider />

      <Text type="secondary">
        These settings determine how files are processed. Each file can override these settings
        individually, otherwise they inherit from the Knowledge Base.
      </Text>
    </Card>
  );
};

export default KnowledgeConfigForm;
