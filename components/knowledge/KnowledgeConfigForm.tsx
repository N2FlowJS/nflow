import { Divider, Form, InputNumber, Typography } from 'antd';
import React from 'react';
import ChunkSeparatorSelect from "./ChunkSeparatorSelect";

const { Text } = Typography;

interface KnowledgeConfigFormProps {
  form: any;
}

const KnowledgeConfigForm: React.FC<KnowledgeConfigFormProps> = ({
  form,
}) => {
  return (
    <>
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
