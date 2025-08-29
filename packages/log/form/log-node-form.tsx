import { FlowNode } from '../../../models/flowTypes';
import TextAreaField from '../../@input/TextAreaField';
import DropdownField from '../../@input/DropdownField';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

interface LogNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const LogNodeForm: React.FC<LogNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('logNode');

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
            name="logLevel"
            label={t('logLevelLabel')}
            required
            options={[
              { label: t('debugLevel'), value: 'debug' },
              { label: t('infoLevel'), value: 'info' },
              { label: t('warnLevel'), value: 'warn' },
              { label: t('errorLevel'), value: 'error' }
            ]}
          />

          <TextAreaField
            name="message"
            label={t('messageLabel')}
            required
            rows={4}
            placeholder={t('messagePlaceholder')}
          />

          <TextAreaField
            name="includeData"
            label={t('includeDataLabel')}
            rows={3}
            placeholder="{{additionalData}}"
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Log Settings
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <DropdownField
            name="includeTimestamp"
            label={t('includeTimestampLabel')}
            options={[
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' }
            ]}
          />

          <DropdownField
            name="includeNodeInfo"
            label={t('includeNodeInfoLabel')}
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

      <div style={{ padding: '12px', backgroundColor: '#fff7e6', border: '1px solid #ffd591', borderRadius: '6px', marginTop: '16px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Logging Levels</div>
        <div>
          <p><strong>Debug:</strong> Detailed information for diagnosing problems</p>
          <p><strong>Info:</strong> General information about flow execution</p>
          <p><strong>Warn:</strong> Warning messages about potential issues</p>
          <p><strong>Error:</strong> Error conditions that should be addressed</p>
        </div>
      </div>

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default LogNodeForm;
