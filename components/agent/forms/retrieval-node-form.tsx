import { DatabaseOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { IKnowledge } from '../../../models/IKnowledge';
import { fetchAllKnowledge } from '../../../services/knowledgeService';
import { Form, InputNumber, Select, Slider, Spin, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import BaseNodeForm from './base-node-form';
import InputReferences from './shared/InputReferences';
import RoleSelector from './shared/RoleSelector';
import { useLocale } from '../../../locale';

interface RetrievalNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const RetrievalNodeForm: React.FC<RetrievalNodeFormProps> = (props) => {
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
          {knowledgeBases.map((kb) => (
            <Select.Option key={kb.id} value={kb.id} label={kb.name}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <DatabaseOutlined style={{ marginRight: 8 }} />
                <span>{kb.name}</span>
              </div>
            </Select.Option>
          ))}
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
                onChange={(value) => setFieldsValue({ maxResults: value })}
                marks={{ 1: '1', 20: '20' }}
              />
              <InputNumber
                min={1}
                max={20}
                value={getFieldValue('maxResults')}
                onChange={(value) => setFieldsValue({ maxResults: value })}
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

export default RetrievalNodeForm;
