import { FilePdfOutlined, SettingOutlined, FileTextOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Switch, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from './base-node-form';
import InputReferences from './shared/InputReferences';
import RoleSelector from './shared/RoleSelector';
import { useLocale } from '../../../locale';

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
                <Form.Item
                  name="pdfPath"
                  label={t('pdfPathLabel')}
                  help={t('pdfPathHelp')}
                  rules={[{ required: true, message: 'Please enter PDF file path' }]}
                >
                  <Input placeholder="/path/to/document.pdf or {{pdfPath}}" />
                </Form.Item>

                <Form.Item
                  name="operation"
                  label={t('operationLabel')}
                  help={t('operationHelp')}
                  initialValue="extract_text"
                  rules={[{ required: true, message: 'Please select an operation' }]}
                >
                  <Select>
                    <Select.Option value="extract_text">{t('extractTextOperation')}</Select.Option>
                    <Select.Option value="extract_metadata">{t('extractMetadataOperation')}</Select.Option>
                    <Select.Option value="extract_images">{t('extractImagesOperation')}</Select.Option>
                    <Select.Option value="split_pages">{t('splitPagesOperation')}</Select.Option>
                    <Select.Option value="merge_pdfs">{t('mergePdfsOperation')}</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const operation = getFieldValue('operation');
                    
                    return ['extract_text', 'split_pages'].includes(operation) ? (
                      <Form.Item
                        name="pageRange"
                        label={t('pageRangeLabel')}
                        help={t('pageRangeHelp')}
                      >
                        <Input placeholder="1-5 or 1,3,5 or leave empty for all pages" />
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const operation = getFieldValue('operation');
                    
                    return ['extract_images', 'split_pages'].includes(operation) ? (
                      <Form.Item
                        name="outputDir"
                        label={t('outputDirLabel')}
                        help={t('outputDirHelp')}
                      >
                        <Input placeholder="/path/to/output/directory" />
                      </Form.Item>
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
