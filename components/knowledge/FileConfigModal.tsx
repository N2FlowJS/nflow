import React, { useEffect } from "react";
import {
  Modal,
  Form,
  InputNumber,
  Input,
  Checkbox,
  Typography,
  Space,
  Alert,
} from "antd";
import { SettingOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface FileConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (values: any) => Promise<void>;
  fileId: string;
  fileName: string;
  fileConfig: any;
  loading: boolean;
}

const FileConfigModal: React.FC<FileConfigModalProps> = ({
  visible,
  onClose,
  onSave,
  fileId,
  fileName,
  fileConfig,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      // Initialize form with either file config or knowledge config
      form.setFieldsValue({
        tokenChunk: fileConfig?.tokenChunk || 1000,
        chunkSeparator: fileConfig?.chunkSeparator || "\n\r.",
      });
    }
  }, [visible, fileConfig]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // If using knowledge config, pass null for fileConfig
      const configToSave = {
        tokenChunk: values.tokenChunk || "1000",
        chunkSeparator: values.chunkSeparator || ".\r\n",
      };
      await onSave(configToSave);
    } catch (error) {
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

        <Form.Item
          name="chunkSeparator"
          label="Chunk Separator"
          tooltip="Characters used to divide text into chunks (e.g., '\n\r' for paragraphs)"
          rules={[
            {
              required: true,
              message: "Please enter chunk separator",
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FileConfigModal;
