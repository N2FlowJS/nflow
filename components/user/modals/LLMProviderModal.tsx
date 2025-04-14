import React from 'react';
import { Modal, Typography } from 'antd';
import { LLMProvider } from '../../../types/llm';
import LLMProviderForm from '../../llm/LLMProviderForm';

const { Title } = Typography;

interface LLMProviderModalProps {
  isVisible: boolean;
  editProvider: LLMProvider | null;
  isLoading: boolean;
  userId: string;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
}

const LLMProviderModal: React.FC<LLMProviderModalProps> = ({
  isVisible,
  editProvider,
  isLoading,
  userId,
  onCancel,
  onSubmit
}) => {
  const isEditing = !!editProvider;
  
  return (
    <Modal
      title={<Title level={4}>{isEditing ? 'Edit Personal LLM Provider' : 'Add Personal LLM Provider'}</Title>}
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <LLMProviderForm
        initialValues={editProvider || undefined}
        onSubmit={onSubmit}
        isLoading={isLoading}
        userContext={userId}
      />
    </Modal>
  );
};

export default LLMProviderModal;
