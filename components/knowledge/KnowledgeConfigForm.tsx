import { SettingOutlined } from '@ant-design/icons';
import { Card, Divider, Form, InputNumber, Typography, Select } from 'antd';
import React from 'react';

const { Text } = Typography;

interface KnowledgeConfigFormProps {
  form: any;
}

// Các ký tự phân tách phổ biến
const separatorOptions = [
  { label: 'Newline (\\n)', value: '\n' },
  { label: 'Carriage Return (\\r)', value: '\r' },
  { label: 'Tab (\\t)', value: '\t' },
  { label: 'Space ( )', value: ' ' },
  { label: 'Comma (,)', value: ',' },
  { label: 'Semicolon (;)', value: ';' },
];

const KnowledgeConfigForm: React.FC<KnowledgeConfigFormProps> = ({
  form,
}) => {
  // Lấy giá trị hiện tại của chunkSeparator từ form
  const chunkSeparator = Form.useWatch(['config', 'chunkSeparator'], form);

  // Hiển thị token cho từng ký tự
  const renderSeparatorTokens = (separators: string[]) => {
    if (!Array.isArray(separators)) return null;
    return (
      <div style={{ marginTop: 8 }}>
        {separators.map((sep, idx) => (
          <span
            key={idx}
            style={{
              display: 'inline-block',
              background: '#f0f0f0',
              borderRadius: 4,
              padding: '2px 8px',
              marginRight: 4,
              fontFamily: 'monospace',
              fontSize: 13,
              border: '1px solid #d9d9d9',
            }}
          >
            {JSON.stringify(sep)}
          </span>
        ))}
      </div>
    );
  };

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
        tooltip="Characters used to divide text into chunks (e.g., ['\\n','\\r'] for paragraphs)"
        rules={[{ required: true, message: 'Please enter chunk separator' }]}
        getValueProps={(value) => ({
          value: Array.isArray(value) ? value : typeof value === 'string' ? [value] : [],
        })}
        normalize={(value) => {
          // Đảm bảo luôn là mảng ký tự
          if (Array.isArray(value)) return value;
          if (typeof value === 'string') return [value];
          return [];
        }}
      >
        <Select
          mode="tags"
          style={{ width: '100%' }}
          placeholder="Enter or select chunk separators"
          tokenSeparators={[]}
          options={separatorOptions}
          open={false} // Không mở dropdown, chỉ cho nhập tag
        />
      </Form.Item>
      {renderSeparatorTokens(chunkSeparator)}

      <Divider />

      <Text type="secondary">
        These settings determine how files are processed. Each file can override these settings
        individually, otherwise they inherit from the Knowledge Base.
      </Text>
    </Card>
  );
};

export default KnowledgeConfigForm;
