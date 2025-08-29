import { FlowNode } from '../../../models/flowTypes';
import TextInputField from '../../@input/TextInputField';
import DropdownField from '../../@input/DropdownField';
import React, { useState, useEffect } from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

interface CounterNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CounterNodeForm: React.FC<CounterNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('counterNode');
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
          <TextInputField
            name="counterName"
            label={t('counterNameLabel')}
            required
            placeholder="myCounter"
          />

          <DropdownField
            name="operation"
            label={t('operationLabel')}
            required
            options={[
              { label: t('incrementOperation'), value: 'increment' },
              { label: t('decrementOperation'), value: 'decrement' },
              { label: t('resetOperation'), value: 'reset' },
              { label: t('setOperation'), value: 'set' }
            ]}
          />

          {['increment', 'decrement'].includes(operation) && (
            <TextInputField
              name="stepValue"
              label={t('stepValueLabel')}
              required
              type="number"
              placeholder="1"
            />
          )}

          <TextInputField
            name="initialValue"
            label={t('initialValueLabel')}
            required
            type="number"
            placeholder="0"
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          {t('settingsLabel')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TextInputField
            name="maxValue"
            label={t('maxValueLabel')}
            type="number"
            placeholder="No limit"
          />

          <TextInputField
            name="minValue"
            label={t('minValueLabel')}
            type="number"
            placeholder="No limit"
          />
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

export default CounterNodeForm;
