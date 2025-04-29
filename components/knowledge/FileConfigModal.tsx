import { SettingOutlined } from "@ant-design/icons";
import {
  Form,
  InputNumber,
  Modal,
  Space,
} from "antd";
import React, { useEffect } from "react";
import ChunkSeparatorSelect, { ConfigChunk } from "./ChunkSeparatorSelect";


interface FileConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (values: any) => Promise<void>;
  fileId: string;
  fileName: string;
  fileConfig: ConfigChunk;
  loading: boolean;
}

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
            : ["\n"],
      });
    }
  }, [visible, fileConfig, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const configToSave = {
        tokenChunk: values.tokenChunk || 1000,
        chunkSeparator: Array.isArray(values.chunkSeparator)
          ? values.chunkSeparator
          : typeof values.chunkSeparator === "string"
            ? [values.chunkSeparator]
            : ["\n"],
      };
      await onSave(configToSave);
    } catch (error: unknown) {
      console.error("Validation failed:", error);
    }
  };


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

        <ChunkSeparatorSelect
          name="chunkSeparator"
          form={form}
        />
      </Form>
    </Modal>
  );
};

export default FileConfigModal;
