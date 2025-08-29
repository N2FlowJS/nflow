import { FlowNode } from '../../../models/flowTypes';
import TextInputField from '../../@input/TextInputField';
import DropdownField from '../../@input/DropdownField';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

interface ImageAnalysisNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ImageAnalysisNodeForm: React.FC<ImageAnalysisNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('imageAnalysisNode');

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
            name="imagePath"
            label={t('imagePathLabel')}
            required
            placeholder="/path/to/image.jpg or {{imagePath}}"
          />

          <DropdownField
            name="analysisType"
            label={t('analysisTypeLabel')}
            required
            options={[
              { label: t('metadataAnalysis'), value: 'metadata' },
              { label: t('dimensionsAnalysis'), value: 'dimensions' },
              { label: t('colorsAnalysis'), value: 'colors' },
              { label: t('textRecognition'), value: 'text_recognition' },
              { label: t('objectDetection'), value: 'object_detection' }
            ]}
          />

          {/* Conditional rendering for OCR Language */}
          <DropdownField
            name="ocrLanguage"
            label={t('ocrLanguageLabel')}
            options={[
              { label: 'English', value: 'eng' },
              { label: 'Vietnamese', value: 'vie' },
              { label: 'French', value: 'fra' },
              { label: 'German', value: 'deu' },
              { label: 'Spanish', value: 'spa' }
            ]}
          />

          {/* Conditional rendering for Color Palette */}
          <TextInputField
            name="colorPalette"
            label={t('colorPaletteLabel')}
            placeholder="5"
            type="number"
          />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
          Analysis Settings
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <DropdownField
            name="outputDetails"
            label={t('outputDetailsLabel')}
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

export default ImageAnalysisNodeForm;
