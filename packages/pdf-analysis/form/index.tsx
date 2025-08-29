import { FilePdfOutlined, SettingOutlined, FileTextOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Switch, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';
import { TextInputField, DropdownField } from '../../../packages/@input';

const { Text } = Typography;

interface PdfAnalysisNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const PdfAnalysisNodeForm: React.FC<PdfAnalysisNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('pdfAnalysisNode');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message={t('title')}
        description={t('description')}
        type="info"
        showIcon
        icon={<FilePdfOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['pdf', 'settings']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'pdf',
            label: (
              <Text strong>
                <FileTextOutlined style={{ marginRight: 8 }} />
                {t('configurationLabel')}
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <TextInputField
                  name="pdfPath"
                  label={t('pdfPathLabel')}
                  placeholder="/path/to/document.pdf or {{pdfPath}}"
                  required
                />

                <DropdownField
                  name="operation"
                  label={t('operationLabel')}
                  options={[
                    { value: 'extract_text', label: t('extractTextOperation') },
                    { value: 'extract_metadata', label: t('extractMetadataOperation') },
                    { value: 'extract_images', label: t('extractImagesOperation') },
                    { value: 'split_pages', label: t('splitPagesOperation') },
                    { value: 'merge_pdfs', label: t('mergePdfsOperation') }
                  ]}
                  required
                />

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const operation = getFieldValue('operation');
                    
                    return ['extract_text', 'split_pages'].includes(operation) ? (
                      <TextInputField
                        name="pageRange"
                        label={t('pageRangeLabel')}
                        placeholder="1-5 or 1,3,5 or leave empty for all pages"
                      />
                    ) : null;
                  }}
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const operation = getFieldValue('operation');
                    
                    return ['extract_images', 'split_pages'].includes(operation) ? (
                      <TextInputField
                        name="outputDir"
                        label={t('outputDirLabel')}
                        placeholder="/path/to/output/directory"
                      />
                    ) : null;
                  }}
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'settings',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Processing Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const operation = getFieldValue('operation');
                    
                    return operation === 'extract_text' ? (
                      <Form.Item
                        name="preserveFormatting"
                        label={t('preserveFormattingLabel')}
                        help={t('preserveFormattingHelp')}
                        valuePropName="checked"
                        initialValue={true}
                      >
                        <Switch />
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const operation = getFieldValue('operation');
                    
                    return operation === 'extract_text' ? (
                      <Form.Item
                        name="extractImages"
                        label={t('extractImagesLabel')}
                        help={t('extractImagesHelp')}
                        valuePropName="checked"
                        initialValue={false}
                      >
                        <Switch />
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>
              </Space>
            ),
          },
        ]}
      />

      <Alert
        message={t('examplesTitle')}
        description={
          <div>
            <p>{t('examplesDescription')}</p>
            <ul>
              <li>{t('example1')}</li>
              <li>{t('example2')}</li>
              <li>{t('example3')}</li>
              <li>{t('example4')}</li>
            </ul>
          </div>
        }
        type="info"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default PdfAnalysisNodeForm;
