import { FlowNode } from '../../../models/flowTypes';
import { IKnowledge } from '../../../models/IKnowledge';
import { fetchAllKnowledge } from '../../../services/knowledgeService';
import { Form, InputNumber, Slider } from 'antd';
import KnowledgeDropdownField from '../../../packages/@input/KnowledgeDropdownField';
import React, { useEffect, useState, useMemo } from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

interface RetrievalNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const RetrievalNodeFormComponent: React.FC<RetrievalNodeFormProps> = (props) => {
  const { form, selectedNode, setIsDrawerOpen } = props;
  const [knowledgeBases, setKnowledgeBases] = useState<IKnowledge[]>([]);
  const { t } = useLocale('form.nodeForm');

  const loadKnowledgeBases = React.useCallback(async () => {
    try {
      const data = await fetchAllKnowledge();
      setKnowledgeBases(data);
    } catch (err) {
      console.error('Failed to load knowledge bases:', err);
    }
  }, [t]);

  useEffect(() => {
    loadKnowledgeBases();
  }, [loadKnowledgeBases]);

  const kbOptions = useMemo(() => knowledgeBases.map((kb) => ({ id: kb.id, name: kb.name })), [knowledgeBases]);

  return (
    <BaseNodeForm form={form} selectedNode={selectedNode} setIsDrawerOpen={setIsDrawerOpen}>
      <KnowledgeDropdownField
        name='knowledgeIds'
        label={t('knowledgeBasesLabel')}
        options={kbOptions}
        placeholder={t('knowledgeBasesPlaceholder')}
        required
        help={t('knowledgeBasesHelp')}
      />

      <Form.Item name='maxResults' label={t('maxResultsLabel')} rules={[{ required: true }]}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Slider
            min={1}
            max={20}
            value={form.getFieldValue('maxResults')}
            onChange={(value) => {
              if (form.getFieldValue('maxResults') !== value) form.setFieldsValue({ maxResults: value });
            }}
            style={{ flex: 1 }}
          />
          <InputNumber
            min={1}
            max={20}
            value={form.getFieldValue('maxResults')}
            onChange={(value) => {
              if (form.getFieldValue('maxResults') !== value) form.setFieldsValue({ maxResults: value });
            }}
            style={{ width: 70 }}
          />
        </div>
      </Form.Item>

      <Form.Item 
        name='threshold' 
        label={t('thresholdLabel') || 'Similarity Threshold'}
        extra={t('thresholdHelp') || 'Minimum similarity score (0-1) for results'}
        rules={[{ required: true }]}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={form.getFieldValue('threshold')}
            onChange={(value) => {
              if (form.getFieldValue('threshold') !== value) form.setFieldsValue({ threshold: value });
            }}
            style={{ flex: 1 }}
          />
          <InputNumber
            min={0}
            max={1}
            step={0.01}
            value={form.getFieldValue('threshold')}
            onChange={(value) => {
              if (form.getFieldValue('threshold') !== value) form.setFieldsValue({ threshold: value });
            }}
            style={{ width: 70 }}
          />
        </div>
      </Form.Item>

      <RoleSelector />

      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

const RetrievalNodeForm = React.memo(RetrievalNodeFormComponent, (prev, next) => (
  prev.selectedNode.id === next.selectedNode.id && prev.form === next.form && prev.setIsDrawerOpen === next.setIsDrawerOpen
));

export default RetrievalNodeForm;
