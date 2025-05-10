import React, { useEffect, useState } from 'react';
import KnowledgeFileList from '../../../components/knowledge/KnowledgeFileList';
import MainLayout from '../../../components/layout/MainLayout';
import { IKnowledge } from '../../../models/IKnowledge';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/router';
import UploadFileModal from '../../../components/upload/UploadFileModal';
import { fetchKnowledgeById } from '../../../services/knowledgeService';
import { useLocale } from '../../../locale';
import { Form, message, Spin } from 'antd';
import FileConfigModal from '../../../components/knowledge/FileConfigModal';
import { updateFileConfig } from '../../../services/fileService';

export default function KnowledgeDetailFile() {
  const router = useRouter();
  const { messages } = useLocale();
  const [form] = Form.useForm();

  const { id } = router.query;
  const [savingFileConfig, setSavingFileConfig] = useState(false);
  const [loading, setLoading] = useState(true);

  const [knowledge, setKnowledge] = useState<IKnowledge>();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFileForConfig, setSelectedFileForConfig] = useState<any>();
  const [fileConfigModalVisible, setFileConfigModalVisible] = useState(false);

  const { isAuthenticated } = useAuth();
  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  const openFileConfigModal = (file: any) => {
    setSelectedFileForConfig(file);
    setFileConfigModalVisible(true);
  };

  const handleSaveFileConfig = async (config: any) => {
    if (!selectedFileForConfig) return;

    setSavingFileConfig(true);
    try {
      await updateFileConfig(selectedFileForConfig.id, config);
      message.success(messages.knowledgeDetail.fileConfigUpdated);
      setFileConfigModalVisible(false);
      fetchKnowledgeDetail();
    } catch (error: unknown) {
      console.error('Error saving file config:', error);
      message.error(messages.knowledgeDetail.fileConfigUpdateFailed);
    } finally {
      setSavingFileConfig(false);
    }
  };

  const fetchKnowledgeDetail = React.useCallback(async () => {
    if (!id || typeof id !== 'string') return;

    setLoading(true);
    try {
      const data = await fetchKnowledgeById(id);
      if (data) {
        setKnowledge(data);

        // Set form values including config
        form.setFieldsValue({
          name: data.name,
          description: data.description,
          config: data.config || { tokenChunk: 128, chunkSeparator: ['\n', '\n'] },
          modelId: data.modelId,
        });
      } else {
        message.error(messages.knowledgeDetail.fetchKnowledgeFailed);
      }
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id, form, messages]);

  useEffect(() => {
    fetchKnowledgeDetail();
  }, [fetchKnowledgeDetail]);

    if (loading) {
    return (
      <MainLayout title={messages.knowledgeDetail.loadingKnowledge}>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      <KnowledgeFileList
        knowledge={knowledge!}
        isAuthenticated={isAuthenticated}
        handleOpenUploadModal={handleOpenUploadModal}
        openFileConfigModal={openFileConfigModal}
      />

      {/* Upload File Modal */}
      {id && typeof id === 'string' && (
        <UploadFileModal
          knowledgeId={id}
          isOpen={isUploadModalOpen}
          onClose={handleCloseUploadModal}
          onUploadComplete={fetchKnowledgeDetail}
          isAuthenticated={isAuthenticated}
        />
      )}

      {selectedFileForConfig && (
        <FileConfigModal
          visible={fileConfigModalVisible}
          onClose={() => setFileConfigModalVisible(false)}
          onSave={handleSaveFileConfig}
          fileId={selectedFileForConfig.id}
          fileName={selectedFileForConfig.originalName}
          fileConfig={selectedFileForConfig.config ? JSON.parse(selectedFileForConfig.config) : null}
          loading={savingFileConfig}
        />
      )}
    </MainLayout>
  );
}
