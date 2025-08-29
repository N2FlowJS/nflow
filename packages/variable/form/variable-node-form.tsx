import { FlowNode } from '../../../models/flowTypes';
import TextInputField from '../../@input/TextInputField';
import DropdownField from '../../@input/DropdownField';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

interface VariableNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const VariableNodeForm: React.FC<VariableNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('variableNode');

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
              { label: t('appendOperation'), value: 'append' }
            ]}
          />

          <TextInputField
            name="variableName"
            label={t('variableNameLabel')}
            required
            placeholder="myVariable"
          />

          <TextInputField
            name="variableValue"
            label={t('variableValueLabel')}
            placeholder="{{inputValue}}"
          />

          <TextInputField
            name="defaultValue"
            label={t('defaultValueLabel')}
            placeholder="Default value if variable doesn't exist"
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

export default VariableNodeForm;
