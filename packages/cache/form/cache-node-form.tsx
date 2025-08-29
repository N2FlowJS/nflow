import { FlowNode } from '../../../models/flowTypes';
import TextInputField from '../../@input/TextInputField';
import DropdownField from '../../@input/DropdownField';
import React, { useState, useEffect } from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

interface CacheNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CacheNodeForm: React.FC<CacheNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('cacheNode');
  const [operation, setOperation] = useState('');

  useEffect(() => {
    // Watch for changes in the operation field
    const subscription = props.form?.getFieldValue && (() => {
      const currentOperation = props.form.getFieldValue('operation');
      if (currentOperation !== operation) {
        setOperation(currentOperation || '');
      }
    });

    // Initial value
    const initialOperation = props.form?.getFieldValue ? props.form.getFieldValue('operation') : '';
    setOperation(initialOperation || '');

    return subscription;
  }, [props.form, operation]);

  return (
    <BaseNodeForm {...props}>
      <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{t('title')}</div>
        <div>{t('description')}</div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          {t('configurationLabel')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <DropdownField
            name="operation"
            label={t('operationLabel')}
            required
            options={[
              { label: t('setOperation'), value: 'set' },
              { label: t('getOperation'), value: 'get' },
              { label: t('deleteOperation'), value: 'delete' },
              { label: t('clearOperation'), value: 'clear' }
            ]}
          />

          <TextInputField
            name="cacheKey"
            label={t('cacheKeyLabel')}
            required
            placeholder="dataKey_{{userId}}"
          />

          {operation === 'set' && (
            <TextInputField
              name="cacheValue"
              label={t('cacheValueLabel')}
              required
              placeholder="{{dataToCache}}"
            />
          )}

          {operation === 'get' && (
            <TextInputField
              name="defaultValue"
              label={t('defaultValueLabel')}
              placeholder="{}"
            />
          )}
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Cache Settings
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {operation === 'set' && (
            <TextInputField
              name="ttl"
              label={t('ttlLabel')}
              required
              type="number"
              placeholder="3600"
            />
          )}
        </div>
      </div>

      <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginTop: '16px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{t('examplesTitle')}</div>
        <div style={{ marginBottom: '8px' }}>{t('examplesDescription')}</div>
        <ul>
          <li>{t('example1')}</li>
          <li>{t('example2')}</li>
          <li>{t('example3')}</li>
          <li>{t('example4')}</li>
        </ul>
      </div>

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default CacheNodeForm;
