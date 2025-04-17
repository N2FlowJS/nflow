import React, { useState } from "react";
import { Modal, Button, Upload, message, Progress, List } from "antd";
import { InboxOutlined, FileOutlined, UploadOutlined } from "@ant-design/icons";
import { uploadFiles } from "../../services/fileService";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import { formatFileSize } from "../../utils/client/formatters";

interface UploadFileModalProps {
  knowledgeId: string;
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
  isAuthenticated: boolean;
}

const UploadFileModal: React.FC<UploadFileModalProps> = ({
  knowledgeId,
  isOpen,
  onClose,
  onUploadComplete,
  isAuthenticated,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);

  const handleUpload = async () => {
    if (!isAuthenticated) {
      message.error("You must be logged in to upload files");
      return;
    }

    if (fileList.length === 0) {
      message.warning("Please select at least one file to upload");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setCurrentFileIndex(0);

    try {
      const files = fileList
        .map((fileItem) => fileItem.originFileObj)
        .filter((file): file is RcFile => file instanceof File);
      console.log("Files to upload:", files, fileList);
      if (files.length === 0) {
        message.error("No valid files to upload");
        setUploading(false);
        return;
      }

      const results = [];

      for (let i = 0; i < files.length; i++) {
        console.log("Uploading file:", files[i]);

        setCurrentFileIndex(i);
        const file = files[i];
        const progressCallback = (percent: number) => {
          setUploadProgress(Math.floor(percent));
        };

        const result = await uploadFiles(
          knowledgeId,
          [file],
          progressCallback
        );
        results.push(result[0]); // assuming uploadFiles returns array
      }

      const successCount = results.filter(Boolean).length;

      if (successCount > 0) {
        message.success(
          `${successCount}/${files.length} file(s) uploaded successfully`
        );
        setFileList([]);

        // Ensure we refresh the knowledge detail with a slight delay
        // to make sure the server has processed all uploads
        setTimeout(() => {
          onUploadComplete();
        }, 500);

        onClose();
      } else {
        message.error("All uploads failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error("An error occurred during upload");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setCurrentFileIndex(0);
    }
  };

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
    },
    beforeUpload: (file) => {
      setFileList((prev) => [...prev, file as UploadFile]);
      return false; // Prevent auto upload
    },
    onChange(info) {
      setFileList(info.fileList); // <- Cực quan trọng: fileList từ info.fileList đã có originFileObj
    },
    fileList,
    multiple: true,
  };

  return (
    <Modal
      title="Upload Files"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={uploading}>
          Cancel
        </Button>,
        <Button
          icon={<UploadOutlined />}
          key="upload"
          type="primary"
          onClick={handleUpload}
          loading={uploading}
          disabled={fileList.length === 0 || !isAuthenticated || uploading}
        >
          {uploading ? "Uploading" : "Upload"}
        </Button>,
      ]}
    >
      <Upload.Dragger {...uploadProps} disabled={uploading}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag files to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support single or bulk upload. Do not upload confidential data.
        </p>
      </Upload.Dragger>

      {uploading && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>
              File {currentFileIndex + 1} of {fileList.length}
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress percent={uploadProgress} status="active" />
        </div>
      )}

      {fileList.length > 0 && !uploading && (
        <List
          style={{ marginTop: 16 }}
          size="small"
          header={<div>Files to upload:</div>}
          bordered
          dataSource={fileList}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<FileOutlined />}
                title={item.name}
                description={`Size: ${formatFileSize(item.size || 0)}`}
              />
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
};

export default UploadFileModal;
