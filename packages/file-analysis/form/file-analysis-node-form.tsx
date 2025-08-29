import { FlowNode } from '../../../models/flowTypes';
import TextInputField from '../../@input/TextInputField';
import DropdownField from '../../@input/DropdownField';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

interface FileAnalysisNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const FileAnalysisNodeForm: React.FC<FileAnalysisNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('fileAnalysisNode');

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
            name="filePath"
            label={t('filePathLabel')}
            required
            placeholder="/path/to/file.txt or {{filePath}}"
          />

          <DropdownField
            name="analysisType"
            label={t('analysisTypeLabel')}
            required
            options={[
              { label: t('metadataAnalysis'), value: 'metadata' },
              { label: t('contentAnalysis'), value: 'content' },
              { label: t('structureAnalysis'), value: 'structure' },
              { label: t('securityAnalysis'), value: 'security' },
              { label: t('qualityAnalysis'), value: 'quality' }
            ]}
          />

          <DropdownField
            name="outputFormat"
            label={t('outputFormatLabel')}
            options={[
              { label: 'JSON', value: 'json' },
              { label: 'CSV', value: 'csv' },
              { label: 'XML', value: 'xml' },
              { label: 'Text', value: 'text' }
            ]}
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Analysis Options
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <DropdownField
            name="includeHidden"
            label={t('includeHiddenLabel')}
            options={[
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' }
            ]}
          />

          <DropdownField
            name="recursive"
            label={t('recursiveLabel')}
            options={[
              { label: 'Yes', value: 'true' },
              { label: 'No', value: 'false' }
            ]}
          />

          <DropdownField
            name="fileTypes"
            label={t('fileTypesLabel')}
            options={[
              { label: 'Text Files (.txt)', value: '.txt' },
              { label: 'PDF Files (.pdf)', value: '.pdf' },
              { label: 'Image Files (.jpg)', value: '.jpg' },
              { label: 'CSV Files (.csv)', value: '.csv' },
              { label: 'JSON Files (.json)', value: '.json' }
            ]}
          />
        </div>
      </div>

      <div style={{ padding: '12px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '6px', marginTop: '16px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{t('analysisTypesTitle')}</div>
        <div style={{ marginBottom: '8px' }}>{t('analysisTypesDescription')}</div>
        <div>
          <div style={{ marginTop: '8px' }}>
            <span style={{ backgroundColor: '#1890ff', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>Metadata</span> - File properties, size, dates
          </div>
          <div style={{ marginTop: '4px' }}>
            <span style={{ backgroundColor: '#52c41a', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>Content</span> - Text analysis, line count, preview
          </div>
          <div style={{ marginTop: '4px' }}>
            <span style={{ backgroundColor: '#fa8c16', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>Structure</span> - Directory tree, file organization
          </div>
          <div style={{ marginTop: '4px' }}>
            <span style={{ backgroundColor: '#f5222d', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>Security</span> - Risk assessment, suspicious patterns
          </div>
          <div style={{ marginTop: '4px' }}>
            <span style={{ backgroundColor: '#722ed1', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>Quality</span> - Naming conventions, best practices
          </div>
        </div>
      </div>

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default FileAnalysisNodeForm;
