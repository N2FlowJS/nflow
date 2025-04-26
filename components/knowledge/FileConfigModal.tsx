import { SettingOutlined } from "@ant-design/icons";
import {
  Form,
  InputNumber,
  Modal,
  Space,
  Select,
} from "antd";
import React, { useEffect } from "react";

interface FileConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (values: any) => Promise<void>;
  fileId: string;
  fileName: string;
  fileConfig: any;
  loading: boolean;
}

const separatorOptions = [
  { label: 'Newline (\\n)', value: '\n' },
  { label: 'Carriage Return (\\r)', value: '\r' },
  { label: 'Tab (\\t)', value: '\t' },
  { label: 'Space ( )', value: ' ' },
  { label: 'Comma (,)', value: ',' },
  { label: 'Semicolon (;)', value: ';' },
];

const FileConfigModal: React.FC<FileConfigModalProps> = ({
  visible,
  onClose,
  onSave,
  fileName,
  fileConfig,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        tokenChunk: fileConfig?.tokenChunk || 1000,
        chunkSeparator: Array.isArray(fileConfig?.chunkSeparator)
          ? fileConfig.chunkSeparator
          : typeof fileConfig?.chunkSeparator === "string"
            ? [fileConfig.chunkSeparator]
            : ["\n", "\n"],
      });
    }
  }, [visible, fileConfig]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const configToSave = {
        tokenChunk: values.tokenChunk || 1000,
        chunkSeparator: Array.isArray(values.chunkSeparator)
          ? values.chunkSeparator
          : typeof values.chunkSeparator === "string"
            ? [values.chunkSeparator]
            : ["\n", "\n"],
      };
      await onSave(configToSave);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

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

  const chunkSeparator = Form.useWatch("chunkSeparator", form);

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          <span>Chunking Configuration - {fileName}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="tokenChunk"
          label="Tokens Per Chunk"
          tooltip="Maximum number of tokens for each text chunk"
          rules={[
            {
              required: true,
              message: "Please enter tokens per chunk",
            },
          ]}
        >
          <InputNumber min={100} max={8000} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="chunkSeparator"
          label="Chunk Separator"
          tooltip="Characters used to divide text into chunks (e.g., ['\\n','\\r'] for paragraphs)"
          rules={[
            {
              required: true,
              message: "Please enter chunk separator",
            },
          ]}
          getValueProps={(value) => ({
            value: Array.isArray(value) ? value : typeof value === 'string' ? [value] : [],
          })}
          normalize={(value) => {
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
            open={false}
          />
        </Form.Item>
        {renderSeparatorTokens(chunkSeparator)}
      </Form>
    </Modal>
  );
};

export default FileConfigModal;
