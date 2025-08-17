import { DatabaseOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { IKnowledge } from '../../../models/IKnowledge';
import { fetchAllKnowledge } from '../../../services/knowledgeService';
import { Form, InputNumber, Select, Slider, Spin, Typography } from 'antd';
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
  const { selectedNode } = props;
  const [knowledgeBases, setKnowledgeBases] = useState<IKnowledge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLocale('form.nodeForm');
  const loadKnowledgeBases = React.useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchAllKnowledge();
      setKnowledgeBases(data);
    } catch (err) {
      console.error('Failed to load knowledge bases:', err);
      setError(t('knowledgeBasesLoadingError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadKnowledgeBases();
  }, [loadKnowledgeBases]);

  const kbOptions = useMemo(() => knowledgeBases.map((kb) => (
    <Select.Option key={kb.id} value={kb.id} label={kb.name}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <DatabaseOutlined style={{ marginRight: 8 }} />
        <span>{kb.name}</span>
      </div>
    </Select.Option>
  )), [knowledgeBases]);

  return (
    <BaseNodeForm {...props}>
      <Form.Item
        name="knowledgeIds"
        label={t('knowledgeBasesLabel')}
        help={t('knowledgeBasesHelp')}
        rules={[{ required: true, message: t('knowledgeBasesRequired') }]}>
        <Select
          mode="multiple"
          placeholder={t('knowledgeBasesPlaceholder')}
          loading={loading}
          disabled={loading}
          notFoundContent={
            loading ? (
              <Spin size="small" />
            ) : error ? (
              <Typography.Text type="danger">{error}</Typography.Text>
            ) : (
              t('noKnowledgeBasesFound')
            )
          }
          optionLabelProp="label">
          {kbOptions}
        </Select>
      </Form.Item>

      <Form.Item name="maxResults" label={t('maxResultsLabel')} rules={[{ required: true }]}>
        <Form.Item shouldUpdate>
          {({ getFieldValue, setFieldsValue }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Slider
                min={1}
                max={20}
                style={{ flex: 1 }}
                value={getFieldValue('maxResults')}
                onChange={(value) => {
                  if (getFieldValue('maxResults') !== value) setFieldsValue({ maxResults: value });
                }}
                marks={{ 1: '1', 20: '20' }}
              />
              <InputNumber
                min={1}
                max={20}
                value={getFieldValue('maxResults')}
                onChange={(value) => {
                  if (getFieldValue('maxResults') !== value) setFieldsValue({ maxResults: value });
                }}
                style={{ width: 70 }}
              />
            </div>
          )}
        </Form.Item>
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
