import { FlowNode } from '../../../models/flowTypes';
import TextAreaField from '../../@input/TextAreaField';
import DropdownField from '../../@input/DropdownField';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

interface DisplayNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DisplayNodeForm: React.FC<DisplayNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('displayNode');

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
          <TextAreaField
            name="content"
            label="Content"
            required
            rows={6}
            placeholder="Enter content to display... Use {{variableName}} for dynamic values."
          />

          <DropdownField
            name="outputFormat"
            label={t('outputFormatLabel')}
            options={[
              { label: t('textFormat'), value: 'text' },
              { label: t('markdownFormat'), value: 'markdown' },
              { label: t('htmlFormat'), value: 'html' },
              { label: t('jsonFormat'), value: 'json' }
            ]}
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Display Settings
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <DropdownField
            name="showAsModal"
            label={t('showAsModalLabel')}
            options={[
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' }
            ]}
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

export default DisplayNodeForm;
